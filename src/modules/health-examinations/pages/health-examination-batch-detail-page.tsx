"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, ArrowLeft, Edit, RefreshCw, Trash2 } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { hasStaffPermission, useCachedUserSession } from "@/modules/auth"
import { ApiClientError } from "@/shared/api/api-client"
import { PageHeader, ScreenLayout, ScreenLoadingSkeleton, formatVND } from "@/shared/ui"
import {
  useDeleteHealthExaminationBatch,
  useHealthExaminationBatchDetail,
  useReloadHealthExaminationBatch,
} from "../hooks/use-health-examination-batches"
import { EditHealthExaminationBatchDialog } from "../components/batch-form/edit-health-examination-batch-dialog"
import { HealthExaminationBatchSummaryStrip } from "../components/health-examination-batch-summary-strip"
import {
  HealthExaminationBatchTabs,
  type HealthExaminationBatchTabType,
} from "../components/health-examination-batch-tabs"
import { healthExaminationKeys } from "../query-keys"
import { ParticipantsTab } from "../components/participants-tab/participants-tab"
import { UnsupportedBatchTab } from "../components/unsupported-batch-tab"
import { MISSING_SERVICE_NAME } from "../utils/batch-form-values"
import { EXAMINATION_SITE_TYPE_LABELS, isBatchEditable } from "../utils/batch-labels"
import { getHealthExaminationBatchStatusLabel } from "../utils/batch-status"
import {
  PARTICIPANT_IMPORT_PERMISSION,
  PARTICIPANT_READ_PERMISSION,
} from "../utils/participant-permissions"
import { formatHealthExaminationDate } from "../utils/format-health-examination-date"
import type { HealthExaminationBatch } from "../types"

interface HealthExaminationBatchDetailPageProps {
  organizationId: string
  batchId: string
}

const TAB_PARAM = "tab"
const UNSUPPORTED_TABS: Record<
  Exclude<HealthExaminationBatchTabType, "overview" | "participants">,
  string
> = {
  examination: "Chi tiết khám",
  report: "Báo cáo đợt khám",
}

function parseTab(value: string | null | undefined): HealthExaminationBatchTabType {
  return value === "participants" || value === "examination" || value === "report"
    ? value
    : "overview"
}

function isStatus(error: unknown, status: number) {
  return error instanceof ApiClientError && error.status === status
}

function BatchOverview({ batch }: { batch: HealthExaminationBatch }) {
  return (
    <div className="space-y-6">
      <section aria-labelledby="batch-site-heading" className="space-y-2">
        <h2 id="batch-site-heading" className="text-base font-bold text-foreground">
          Địa điểm và ngày khám
        </h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Loại địa điểm</dt>
            <dd className="font-medium text-foreground">
              {EXAMINATION_SITE_TYPE_LABELS[batch.examinationSiteType]}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Tên địa điểm</dt>
            <dd className="font-medium text-foreground">{batch.examinationSiteName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Địa chỉ</dt>
            <dd className="font-medium text-foreground">{batch.examinationSiteAddress || "—"}</dd>
          </div>
        </dl>
        <ul aria-label="Ngày khám" className="flex flex-wrap gap-2 pt-1">
          {batch.examinationDates.map((date) => (
            <li
              key={date}
              className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {formatHealthExaminationDate(date)}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="batch-services-heading" className="space-y-2">
        <h2 id="batch-services-heading" className="text-base font-bold text-foreground">
          Dịch vụ và giá thỏa thuận
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold">
                <th className="px-4 py-2.5 w-14 text-center">STT</th>
                <th className="px-4 py-2.5">Hạng mục</th>
                <th className="px-4 py-2.5 text-right">Giá tham chiếu</th>
                <th className="px-4 py-2.5 text-right">Giá thỏa thuận</th>
              </tr>
            </thead>
            <tbody>
              {batch.services.map((service, index) => (
                <tr key={service.id} className="border-b border-divider">
                  <td className="px-4 py-2.5 text-center text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-foreground">
                      {service.name ?? MISSING_SERVICE_NAME}
                    </div>
                    {service.code && (
                      <div className="text-[11px] text-muted-foreground">Mã: {service.code}</div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {formatVND(service.referencePrice)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-foreground">
                    {formatVND(service.negotiatedPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export function HealthExaminationBatchDetailPage({
  organizationId,
  batchId,
}: HealthExaminationBatchDetailPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = parseTab(searchParams?.get(TAB_PARAM))
  const batchesHref = `/organizations/${encodeURIComponent(organizationId)}?tab=batches`

  const queryClient = useQueryClient()
  const currentUser = useCachedUserSession()
  // Display only; the backend checks every request. An unknown session still tries to read.
  const canReadParticipants = currentUser
    ? hasStaffPermission(currentUser, PARTICIPANT_READ_PERMISSION)
    : true
  const canImportParticipants = hasStaffPermission(currentUser, PARTICIPANT_IMPORT_PERMISSION)
  const [isDeleted, setIsDeleted] = React.useState(false)
  // After a successful delete the page stops observing the batch so no request for it is sent.
  const { data: batch, isLoading, isError, error, refetch } = useHealthExaminationBatchDetail(
    organizationId,
    isDeleted ? "" : batchId
  )
  const deleteMutation = useDeleteHealthExaminationBatch()
  const reloadMutation = useReloadHealthExaminationBatch(organizationId, batchId)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const isDeleteConflict = isStatus(deleteMutation.error, 409)

  React.useEffect(() => {
    if (isDeleted) {
      queryClient.removeQueries({
        queryKey: healthExaminationKeys.batch(organizationId, batchId),
      })
    }
  }, [isDeleted, queryClient, organizationId, batchId])

  const handleTabChange = (tab: HealthExaminationBatchTabType) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    if (tab === "overview") params.delete(TAB_PARAM)
    else params.set(TAB_PARAM, tab)
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
  }

  const handleDeleteOpenChange = (open: boolean) => {
    setIsDeleteOpen(open)
    if (!open) {
      deleteMutation.reset()
      reloadMutation.reset()
    }
  }

  const handleDelete = async () => {
    if (!batch) return
    try {
      await deleteMutation.mutateAsync({
        organizationId,
        batchId: batch.id,
        rowVersion: batch.rowVersion,
      })
      setIsDeleteOpen(false)
      setIsDeleted(true)
      router.push(batchesHref)
    } catch {
      // The mutation error is rendered in the dialog.
    }
  }

  // Reads the latest version after a 409; the deletion is never resent automatically.
  const handleReloadAfterConflict = async () => {
    try {
      await reloadMutation.mutateAsync()
      deleteMutation.reset()
    } catch {
      // The reload error is rendered in the dialog.
    }
  }

  if (isLoading || isDeleted) return <ScreenLoadingSkeleton variant="detail" />

  if (isError || !batch) {
    const notFound = isStatus(error, 404)
    return (
      <ScreenLayout
        data-slot="health-examination-batch-detail-error"
        className="items-center justify-center py-12 text-center"
      >
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          {notFound ? "Không tìm thấy đợt khám" : "Không thể tải dữ liệu đợt khám"}
        </h2>
        <p role="alert" className="mt-1 mb-6 max-w-md text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "Đã xảy ra lỗi khi tải đợt khám."}
        </p>
        <div className="flex items-center gap-3">
          <Link href={batchesHref}>
            <Button variant="outline" size="sm" className="h-9 text-xs">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Về danh sách đợt khám
            </Button>
          </Link>
          {!notFound && (
            <Button size="sm" onClick={() => void refetch()} className="h-9 text-xs">
              <RefreshCw className="mr-1.5 size-3.5" />
              Thử lại
            </Button>
          )}
        </div>
      </ScreenLayout>
    )
  }

  const editable = isBatchEditable(batch.status)

  return (
    <ScreenLayout data-slot="health-examination-batch-detail-page" className="gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Đơn vị", href: "/organizations" },
          { label: "Đợt khám", href: batchesHref },
          { label: batch.code },
        ]}
        title={batch.name}
        titleAccessory={
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
            {getHealthExaminationBatchStatusLabel(batch.status)}
          </span>
        }
        description={`Mã đợt khám: ${batch.code}`}
        actions={
          editable ? (
            <>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(true)}>
                <Edit className="size-4" />
                Chỉnh sửa
              </Button>
              <Button type="button" variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="size-4" />
                Xóa đợt khám
              </Button>
            </>
          ) : undefined
        }
      />

      {!editable && (
        <p className="text-xs text-muted-foreground">
          Chỉ đợt khám ở trạng thái Nháp mới được chỉnh sửa hoặc xóa.
        </p>
      )}

      <HealthExaminationBatchSummaryStrip batch={batch} />

      <HealthExaminationBatchTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="pt-1">
        {activeTab === "overview" ? (
          <BatchOverview batch={batch} />
        ) : activeTab === "participants" ? (
          <ParticipantsTab
            organizationId={organizationId}
            batchId={batch.id}
            batch={{ code: batch.code, status: batch.status, rowVersion: batch.rowVersion }}
            canRead={canReadParticipants}
            canImport={canImportParticipants}
          />
        ) : (
          <UnsupportedBatchTab feature={UNSUPPORTED_TABS[activeTab]} />
        )}
      </div>

      {editable && (
        <EditHealthExaminationBatchDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          organizationId={organizationId}
          batch={batch}
        />
      )}

      <Dialog open={isDeleteOpen} onOpenChange={handleDeleteOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa đợt khám</DialogTitle>
            <DialogDescription>
              Đợt khám “{batch.name}” sẽ bị xóa và không còn xuất hiện trong danh sách. Chỉ đợt
              khám ở trạng thái Nháp và chưa có người khám mới xóa được.
            </DialogDescription>
          </DialogHeader>
          {deleteMutation.error && (
            <div role="alert" className="space-y-2 text-xs text-destructive">
              <p>
                {isDeleteConflict
                  ? "Đợt khám đã có người khám, không còn ở trạng thái Nháp hoặc dữ liệu đã thay đổi. Vui lòng tải lại."
                  : deleteMutation.error.message || "Không thể xóa đợt khám."}
              </p>
              {isDeleteConflict && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReloadAfterConflict}
                  disabled={reloadMutation.isPending}
                >
                  {reloadMutation.isPending ? "Đang tải..." : "Tải lại dữ liệu mới nhất"}
                </Button>
              )}
            </div>
          )}
          {reloadMutation.error && (
            <p role="alert" className="text-xs text-destructive">
              {reloadMutation.error.message || "Không thể tải lại dữ liệu đợt khám."}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDeleteOpenChange(false)}
              disabled={deleteMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScreenLayout>
  )
}
