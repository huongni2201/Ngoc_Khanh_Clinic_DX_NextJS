"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Edit, Info, PlayCircle, Trash2 } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { isApiErrorStatus } from "@/shared/api/api-client"
import { PageHeader, ScreenLayout, ScreenLoadingSkeleton, StatusPill } from "@/shared/ui"
import { toast } from "@/shared/ui/toaster"
import { useBatchPermissions } from "../hooks/use-batch-permissions"
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
import { HealthExaminationBatchOverview } from "../components/health-examination-batch-overview"
import { HealthExaminationBatchDetailError } from "../components/health-examination-batch-detail-error"
import { DeleteHealthExaminationBatchDialog } from "../components/delete-health-examination-batch-dialog"
import { StartHealthExaminationBatchDialog } from "../components/start-health-examination-batch-dialog"
import { healthExaminationKeys } from "../query-keys"
import { ExaminationDetailTab } from "../components/examination-detail-tab/examination-detail-tab"
import { ParticipantsTab } from "../components/participants-tab/participants-tab"
import { ReportTab } from "../components/report-tab/report-tab"
import { isBatchEditable } from "../utils/batch-labels"
import {
  HEALTH_EXAMINATION_BATCH_STATUS_TONES,
  getHealthExaminationBatchStatusLabel,
} from "../utils/batch-status"

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
  // Display only; the backend checks every request.
  const permissions = useBatchPermissions()
  const hiddenTabs: HealthExaminationBatchTabType[] = [
    ...(permissions.examination.canRead ? [] : (["examination"] as const)),
    ...(permissions.report.canRead ? [] : (["report"] as const)),
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
  const [isStartOpen, setIsStartOpen] = React.useState(false)
  const isDeleteConflict = isApiErrorStatus(deleteMutation.error, 409)

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
      toast.success(`Đã xóa đợt khám ${batch.code}.`)
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
    return (
      <HealthExaminationBatchDetailError
        notFound={isApiErrorStatus(error, 404)}
        error={error}
        batchesHref={batchesHref}
        onRetry={() => void refetch()}
      />
    )
  }

  const editable = isBatchEditable(batch.status)
  const { canStart, canEdit, canDelete } = permissions.batch

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
          editable && (canStart || canEdit || canDelete) ? (
            <>
              {canStart && (
                <Button type="button" onClick={() => setIsStartOpen(true)}>
                  <PlayCircle className="size-4" />
                  Bắt đầu đợt khám
                </Button>
              )}
              {canEdit && (
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(true)}>
                  <Edit className="size-4" />
                  Chỉnh sửa
                </Button>
              )}
              {canDelete && (
                <Button type="button" variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                  <Trash2 className="size-4" />
                  Xóa đợt khám
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      {!editable && (canEdit || canDelete) && (
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
          <HealthExaminationBatchOverview batch={batch} />
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
            canRead={permissions.participants.canRead}
            canDownloadTemplate={permissions.participants.canDownloadTemplate}
            canImport={permissions.participants.canImport}
            canCreate={permissions.participants.canCreate}
            canEdit={permissions.participants.canEdit}
            canRemove={permissions.participants.canRemove}
            canReactivate={permissions.participants.canReactivate}
            canPrintForm={permissions.participants.canPrintForm}
            canBulkPrintForms={permissions.participants.canBulkPrintForms}
          />
        ) : activeTab === "examination" ? (
          <ExaminationDetailTab
            organizationId={organizationId}
            batch={{
              id: batch.id,
              status: batch.status,
              services: batch.services,
              startDate: batch.examinationDates[0],
            }}
            canRead={permissions.examination.canRead}
            canImport={permissions.examination.canReconcile}
            canDownloadTemplate={permissions.examination.canDownloadTemplate}
            canRecord={permissions.examination.canRecord}
          />
        ) : (
          <ReportTab
            organizationId={organizationId}
            batchId={batch.id}
            canExportDetails={permissions.examination.canRead}
          />
        )}
      </div>

      {editable && canEdit && (
        <EditHealthExaminationBatchDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          organizationId={organizationId}
          batch={batch}
        />
      )}

      {editable && canStart && (
        <StartHealthExaminationBatchDialog
          open={isStartOpen}
          onOpenChange={setIsStartOpen}
          organizationId={organizationId}
          batch={batch}
          onStarted={(started) =>
            toast.success(`Đã bắt đầu đợt khám ${started.code}. Có thể in phiếu khám.`)
          }
        />
      )}

      {canDelete && (
        <DeleteHealthExaminationBatchDialog
          open={isDeleteOpen}
          onOpenChange={handleDeleteOpenChange}
          batchName={batch.name}
          deleteError={deleteMutation.error}
          isDeleteConflict={isDeleteConflict}
          isDeleting={deleteMutation.isPending}
          reloadError={reloadMutation.error}
          isReloading={reloadMutation.isPending}
          onConfirm={handleDelete}
          onReload={handleReloadAfterConflict}
        />
      )}
    </ScreenLayout>
  )
}
