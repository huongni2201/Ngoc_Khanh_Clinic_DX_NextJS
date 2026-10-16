"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Edit, Info, PlayCircle, Trash2 } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { isApiErrorStatus } from "@/shared/api/api-client"
import { PageHeader, ScreenLayout, ScreenLoadingSkeleton, StatusPill } from "@/shared/ui"
import { toast } from "@/shared/ui/toaster"
import { useAgreementPermissions } from "../hooks/use-agreement-permissions"
import {
  useDeleteHealthExaminationAgreement,
  useHealthExaminationAgreementDetail,
  useReloadHealthExaminationAgreement,
} from "../hooks/use-agreements"
import { EditHealthExaminationAgreementDialog } from "../components/agreement-form/edit-health-examination-agreement-dialog"
import { HealthExaminationAgreementSummaryStrip } from "../components/health-examination-agreement-summary-strip"
import {
  HealthExaminationAgreementTabs,
  type HealthExaminationAgreementTabType,
} from "../components/health-examination-agreement-tabs"
import { HealthExaminationAgreementOverview } from "../components/health-examination-agreement-overview"
import { HealthExaminationAgreementDetailError } from "../components/health-examination-agreement-detail-error"
import { DeleteHealthExaminationAgreementDialog } from "../components/delete-health-examination-agreement-dialog"
import {
  ActivateHealthExaminationAgreementDialog,
  EndHealthExaminationAgreementDialog,
} from "../components/agreement-transition-dialogs"
import { healthExaminationKeys } from "../query-keys"
import { ExaminationDetailTab } from "../components/examination-detail-tab/examination-detail-tab"
import { ParticipantsTab } from "../components/participants-tab/participants-tab"
import { ReportTab } from "../components/report-tab/report-tab"
import { SessionsTab } from "../components/session-tab/sessions-tab"
import { isAgreementEditable, isAgreementOpen } from "../utils/agreement-labels"
import {
  HEALTH_EXAMINATION_AGREEMENT_STATUS_TONES,
  getHealthExaminationAgreementStatusLabel,
} from "../utils/agreement-status"

interface HealthExaminationAgreementDetailPageProps {
  organizationId: string
  agreementId: string
}

const TAB_PARAM = "tab"
function parseTab(value: string | null | undefined): HealthExaminationAgreementTabType {
  return value === "participants" ||
    value === "sessions" ||
    value === "examination" ||
    value === "report"
    ? value
    : "overview"
}

export function HealthExaminationAgreementDetailPage({
  organizationId,
  agreementId,
}: HealthExaminationAgreementDetailPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const requestedTab = parseTab(searchParams?.get(TAB_PARAM))
  const agreementsHref = `/organizations/${encodeURIComponent(organizationId)}`

  const queryClient = useQueryClient()
  // Display only; the backend checks every request.
  const permissions = useAgreementPermissions()
  const hiddenTabs: HealthExaminationAgreementTabType[] = [
    ...(permissions.sessions.canRead ? [] : (["sessions"] as const)),
    ...(permissions.examination.canRead ? [] : (["examination"] as const)),
    ...(permissions.report.canRead ? [] : (["report"] as const)),
  ]
  const activeTab = hiddenTabs.includes(requestedTab) ? "overview" : requestedTab
  const [isDeleted, setIsDeleted] = React.useState(false)
  // After a successful delete the page stops observing the agreement so no request for it is sent.
  const {
    data: agreement,
    isLoading,
    isError,
    error,
    refetch,
  } = useHealthExaminationAgreementDetail(organizationId, isDeleted ? "" : agreementId)
  const deleteMutation = useDeleteHealthExaminationAgreement()
  const reloadMutation = useReloadHealthExaminationAgreement(organizationId, agreementId)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isActivateOpen, setIsActivateOpen] = React.useState(false)
  const [isEndOpen, setIsEndOpen] = React.useState(false)
  const isDeleteConflict = isApiErrorStatus(deleteMutation.error, 409)

  React.useEffect(() => {
    if (isDeleted) {
      queryClient.removeQueries({
        queryKey: healthExaminationKeys.agreement(organizationId, agreementId),
      })
    }
  }, [isDeleted, queryClient, organizationId, agreementId])

  const handleTabChange = (tab: HealthExaminationAgreementTabType) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    // Each tab keeps its own filters; leaving the tab drops the ones of the tab it came from.
    for (const key of [...params.keys()]) if (key !== TAB_PARAM) params.delete(key)
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
    if (!agreement) return
    try {
      await deleteMutation.mutateAsync({
        organizationId,
        agreementId: agreement.id,
        rowVersion: agreement.rowVersion,
      })
      toast.success(`Đã xóa thỏa thuận ${agreement.code}.`)
      setIsDeleteOpen(false)
      setIsDeleted(true)
      router.push(agreementsHref)
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

  if (isError || !agreement) {
    return (
      <HealthExaminationAgreementDetailError
        notFound={isApiErrorStatus(error, 404)}
        error={error}
        agreementsHref={agreementsHref}
        onRetry={() => void refetch()}
      />
    )
  }

  const editable = isAgreementEditable(agreement.status)
  const open = isAgreementOpen(agreement.status)
  const { canActivate, canEnd, canEdit, canDelete } = permissions.agreement
  const showDraftActions = editable && (canActivate || canEdit || canDelete)
  const showEnd = agreement.status === "ACTIVE" && canEnd

  return (
    <ScreenLayout data-slot="health-examination-agreement-detail-page" className="gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Đơn vị", href: "/organizations" },
          { label: "Thỏa thuận", href: agreementsHref },
          { label: agreement.code },
        ]}
        title={agreement.name}
        titleAccessory={
          <StatusPill tone={HEALTH_EXAMINATION_AGREEMENT_STATUS_TONES[agreement.status]}>
            {getHealthExaminationAgreementStatusLabel(agreement.status)}
          </StatusPill>
        }
        description={
          <>
            Mã thỏa thuận{" "}
            <span className="font-mono text-[13px] tabular-nums text-foreground">{agreement.code}</span>
          </>
        }
        actions={
          showDraftActions || showEnd ? (
            <>
              {editable && canActivate && (
                <Button type="button" onClick={() => setIsActivateOpen(true)}>
                  <PlayCircle className="size-4" />
                  Kích hoạt thỏa thuận
                </Button>
              )}
              {showEnd && (
                <Button type="button" variant="outline" onClick={() => setIsEndOpen(true)}>
                  Kết thúc thỏa thuận
                </Button>
              )}
              {editable && canEdit && (
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(true)}>
                  <Edit className="size-4" />
                  Chỉnh sửa
                </Button>
              )}
              {editable && canDelete && (
                <Button type="button" variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                  <Trash2 className="size-4" />
                  Xóa thỏa thuận
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      {!editable && (canEdit || canDelete) && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info aria-hidden="true" className="size-3.5 shrink-0" />
          Chỉ thỏa thuận ở trạng thái Nháp mới được chỉnh sửa hoặc xóa, kể cả danh sách dịch vụ.
        </p>
      )}

      <HealthExaminationAgreementSummaryStrip agreement={agreement} />

      <HealthExaminationAgreementTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hiddenTabs={hiddenTabs}
      />

      <div className="pt-1">
        {activeTab === "overview" ? (
          <HealthExaminationAgreementOverview agreement={agreement} />
        ) : activeTab === "participants" ? (
          <ParticipantsTab
            organizationId={organizationId}
            agreementId={agreement.id}
            agreement={{
              code: agreement.code,
              name: agreement.name,
              status: agreement.status,
              rowVersion: agreement.rowVersion,
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
            canAssign={permissions.assignments.canAssign && open}
            canCreateSession={permissions.sessions.canCreate && open}
            canViewSessions={permissions.sessions.canRead}
          />
        ) : activeTab === "sessions" ? (
          <SessionsTab
            organizationId={organizationId}
            agreement={{
              id: agreement.id,
              name: agreement.name,
              code: agreement.code,
              status: agreement.status,
            }}
          />
        ) : activeTab === "examination" ? (
          <ExaminationDetailTab
            organizationId={organizationId}
            agreement={{
              id: agreement.id,
              status: agreement.status,
              services: agreement.services,
            }}
            canRead={permissions.examination.canRead}
            canImport={permissions.examination.canReconcile}
            canDownloadTemplate={permissions.examination.canDownloadTemplate}
            canRecord={permissions.examination.canRecord}
          />
        ) : (
          <ReportTab
            organizationId={organizationId}
            agreementId={agreement.id}
            canExportDetails={permissions.examination.canRead}
          />
        )}
      </div>

      {editable && canEdit && (
        <EditHealthExaminationAgreementDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          organizationId={organizationId}
          agreement={agreement}
        />
      )}

      {editable && canActivate && (
        <ActivateHealthExaminationAgreementDialog
          open={isActivateOpen}
          onOpenChange={setIsActivateOpen}
          organizationId={organizationId}
          agreement={agreement}
          onActivated={(activated) =>
            toast.success(`Đã kích hoạt thỏa thuận ${activated.code}. Có thể in phiếu khám.`)
          }
        />
      )}

      {showEnd && (
        <EndHealthExaminationAgreementDialog
          open={isEndOpen}
          onOpenChange={setIsEndOpen}
          organizationId={organizationId}
          agreement={agreement}
          onEnded={(ended) => toast.success(`Đã kết thúc thỏa thuận ${ended.code}.`)}
        />
      )}

      {canDelete && (
        <DeleteHealthExaminationAgreementDialog
          open={isDeleteOpen}
          onOpenChange={handleDeleteOpenChange}
          agreementName={agreement.name}
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
