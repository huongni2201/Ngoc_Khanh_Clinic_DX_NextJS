"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, ArrowLeft, Edit, Info, RefreshCw, Trash2 } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { InfoList, PageHeader, ScreenLayout, ScreenLoadingSkeleton, StatusPill, formatVND } from "@/shared/ui"
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
import { ExaminationDetailTab } from "../components/examination-detail-tab/examination-detail-tab"
import { ParticipantsTab } from "../components/participants-tab/participants-tab"
import { ReportTab } from "../components/report-tab/report-tab"
import { MISSING_SERVICE_NAME } from "../utils/batch-form-values"
import { EXAMINATION_SITE_TYPE_LABELS, isBatchEditable } from "../utils/batch-labels"
import {
  HEALTH_EXAMINATION_BATCH_STATUS_TONES,
  getHealthExaminationBatchStatusLabel,
} from "../utils/batch-status"
import {
  EXAMINATION_REPORT_READ_PERMISSION,
  EXAMINATION_SERVICE_READ_PERMISSION,
  EXAMINATION_SERVICE_RECONCILE_PERMISSION,
  PARTICIPANT_IMPORT_PERMISSION,
  PARTICIPANT_MANAGE_PERMISSION,
  PARTICIPANT_READ_PERMISSION,
} from "../utils/participant-permissions"
import { formatHealthExaminationDate } from "../utils/format-health-examination-date"
import type { HealthExaminationBatch } from "../types"

interface HealthExaminationBatchDetailPageProps {
  organizationId: string
  batchId: string
}

const TAB_PARAM = "tab"
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
      <Card className="gap-0 py-0">
        <CardHeader className="border-b border-border px-5 py-4">
          <h2 id="batch-site-heading" className="text-base font-semibold text-foreground">
            Địa điểm và ngày khám
          </h2>
        </CardHeader>
        <CardContent className="space-y-4 px-5 py-4">
          <InfoList
            layout="inline"
            items={[
              { label: "Loại địa điểm", value: EXAMINATION_SITE_TYPE_LABELS[batch.examinationSiteType] },
              { label: "Tên địa điểm", value: batch.examinationSiteName },
              { label: "Địa chỉ", value: batch.examinationSiteAddress },
            ]}
          />
          <ul aria-label="Ngày khám" className="flex flex-wrap gap-2 border-t border-divider pt-4">
            {batch.examinationDates.map((date) => (
              <li
                key={date}
                className="rounded-md border border-border bg-surface-alt px-2.5 py-1 text-xs font-medium tabular-nums text-foreground"
              >
                {formatHealthExaminationDate(date)}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="border-b border-border px-5 py-4">
          <h2 id="batch-services-heading" className="text-base font-semibold text-foreground">
            Dịch vụ và giá thỏa thuận
          </h2>
        </CardHeader>
        <Table aria-labelledby="batch-services-heading">
          <TableHeader>
            <TableRow className="border-b border-border bg-table-header-bg hover:bg-table-header-bg">
              <TableHead className="h-10 w-14 px-4 text-center text-xs font-semibold">STT</TableHead>
              <TableHead className="h-10 px-4 text-xs font-semibold">Hạng mục</TableHead>
              <TableHead className="h-10 px-4 text-right text-xs font-semibold">Giá tham chiếu</TableHead>
              <TableHead className="h-10 px-4 text-right text-xs font-semibold">Giá thỏa thuận</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batch.services.map((service, index) => (
              <TableRow key={service.id}>
                <TableCell className="px-4 py-3 text-center text-xs text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-normal">
                  <div className="text-sm font-medium text-foreground">
                    {service.name ?? MISSING_SERVICE_NAME}
                  </div>
                  {service.code && (
                    <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                      Mã: {service.code}
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground">
                  {formatVND(service.referencePrice)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-sm font-medium tabular-nums text-foreground">
                  {formatVND(service.negotiatedPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
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
  const requestedTab = parseTab(searchParams?.get(TAB_PARAM))
  const batchesHref = `/organizations/${encodeURIComponent(organizationId)}`

  const queryClient = useQueryClient()
  const currentUser = useCachedUserSession()
  // Display only; the backend checks every request. An unknown session still tries to read.
  const canReadParticipants = currentUser
    ? hasStaffPermission(currentUser, PARTICIPANT_READ_PERMISSION)
    : true
  const canImportParticipants = hasStaffPermission(currentUser, PARTICIPANT_IMPORT_PERMISSION)
  const canManageParticipants = hasStaffPermission(currentUser, PARTICIPANT_MANAGE_PERMISSION)
  // An unknown session still tries to read; a known session without the permission loses the tab.
  const canReadExamination = currentUser
    ? hasStaffPermission(currentUser, EXAMINATION_SERVICE_READ_PERMISSION)
    : true
  const canReconcileExamination = hasStaffPermission(
    currentUser,
    EXAMINATION_SERVICE_RECONCILE_PERMISSION
  )
  const canReadReport = currentUser
    ? hasStaffPermission(currentUser, EXAMINATION_REPORT_READ_PERMISSION)
    : true
  const hiddenTabs: HealthExaminationBatchTabType[] = [
    ...(canReadExamination ? [] : (["examination"] as const)),
    ...(canReadReport ? [] : (["report"] as const)),
  ]
  const activeTab = hiddenTabs.includes(requestedTab) ? "overview" : requestedTab
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
          <StatusPill tone={HEALTH_EXAMINATION_BATCH_STATUS_TONES[batch.status]}>
            {getHealthExaminationBatchStatusLabel(batch.status)}
          </StatusPill>
        }
        description={
          <>
            Mã đợt khám{" "}
            <span className="font-mono text-[13px] tabular-nums text-foreground">{batch.code}</span>
          </>
        }
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
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info aria-hidden="true" className="size-3.5 shrink-0" />
          Chỉ đợt khám ở trạng thái Nháp mới được chỉnh sửa hoặc xóa.
        </p>
      )}

      <HealthExaminationBatchSummaryStrip batch={batch} />

      <HealthExaminationBatchTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hiddenTabs={hiddenTabs}
      />

      <div className="pt-1">
        {activeTab === "overview" ? (
          <BatchOverview batch={batch} />
        ) : activeTab === "participants" ? (
          <ParticipantsTab
            organizationId={organizationId}
            batchId={batch.id}
            batch={{
              code: batch.code,
              status: batch.status,
              rowVersion: batch.rowVersion,
              days: batch.examinationDays,
            }}
            canRead={canReadParticipants}
            canImport={canImportParticipants}
            canManage={canManageParticipants}
          />
        ) : activeTab === "examination" ? (
          <ExaminationDetailTab
            organizationId={organizationId}
            batch={{ id: batch.id, status: batch.status, services: batch.services }}
            canRead={canReadExamination}
            canImport={canReconcileExamination}
          />
        ) : (
          <ReportTab
            organizationId={organizationId}
            batchId={batch.id}
            canExportDetails={canReadExamination}
          />
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
