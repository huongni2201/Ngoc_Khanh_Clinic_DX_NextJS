"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Edit, Info, Trash2 } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { hasStaffPermission, useCachedUserSession } from "@/modules/accesscontrol"
import { isApiErrorStatus } from "@/shared/api/api-client"
import { PageHeader, ScreenLayout, ScreenLoadingSkeleton, StatusPill } from "@/shared/ui"
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
import { healthExaminationKeys } from "../query-keys"
import { ExaminationDetailTab } from "../components/examination-detail-tab/examination-detail-tab"
import { ParticipantsTab } from "../components/participants-tab/participants-tab"
import { ReportTab } from "../components/report-tab/report-tab"
import { isBatchEditable } from "../utils/batch-labels"
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
    </ScreenLayout>
  )
}
