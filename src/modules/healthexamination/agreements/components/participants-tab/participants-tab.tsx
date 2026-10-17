"use client"

import * as React from "react"
import { Download, Info, Upload, UserPlus } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DEFAULT_PAGE_SIZE } from "@/shared/ui"
import { toast } from "@/shared/ui/toaster"
import {
  useDownloadParticipantImportTemplate,
  useHealthExaminationAgreementParticipants,
  type CancelParticipantsResult,
} from "../../hooks/use-agreements"
import { useSelectPrintableParticipants } from "../../hooks/use-examination-forms"
import type {
  AssignParticipantsResult,
  ExaminationFormPrintEntry,
  HealthExaminationParticipant,
  ParticipantAttendanceStatus,
  ParticipantRosterStatus,
  ParticipantSelectionEntry,
  ParticipantSortKey,
} from "../../types"
import {
  isParticipantChangeAllowed,
  isParticipantImportAllowed,
  isParticipantSchedulingAllowed,
  toUnscheduledFor,
  type ParticipantScheduleFilter,
} from "../../utils/participant-labels"
import {
  EXAMINATION_FORM_PRINT_BLOCKED_NOTE,
  isExaminationFormPrintAllowed,
  toExaminationFormPrintEntry,
} from "../../utils/examination-form-print"
import { toParticipantSelectionEntry } from "../../utils/participant-selection"
import { CancelParticipantsDialog } from "./cancel-participants-dialog"
import { EmptyParticipantsState } from "./empty-participants-state"
import { ExaminationFormPreviewDialog } from "./examination-form-preview-dialog"
import {
  ExaminationFormPrintJobDialog,
  type ExaminationFormPrintJobDialogMode,
  type TrackedExaminationFormPrintJob,
} from "./examination-form-print-job-dialog"
import { AssignSessionDialog } from "../session-tab/assign-session-dialog"
import { ParticipantFormDialog } from "./participant-form-dialog"
import { ParticipantImportDialog } from "./participant-import-dialog"
import { ParticipantSelectionBar } from "./participant-selection-bar"
import { ParticipantsTable } from "./participants-table"
import { ParticipantsToolbar } from "./participants-toolbar"
import { ReactivateParticipantDialog } from "./reactivate-participant-dialog"

/** A dialog closed without doing what was asked (no permission, changed by someone else). */
const warn = (message: string) => {
  toast.warning(message)
}

interface ParticipantsTabProps {
  agreementId: string
  organizationId: string
  agreement: {
    code: string
    name: string
    status: string
    /** Version the Excel template is prepared for; sent back with the upload. */
    rowVersion: number
  }
  /** UX only: the backend decides. When false the list is not requested at all. */
  canRead?: boolean
  /** UX only: the backend decides. Shows the template download when true and the agreement accepts imports. */
  canDownloadTemplate?: boolean
  /** UX only: the backend decides. Shows the import action when true and the agreement allows it. */
  canImport?: boolean
  /** UX only: the backend decides. Shows manual add when true and the agreement allows it. */
  canCreate?: boolean
  /** UX only: the backend decides. Shows "Sửa" on each row when true and the agreement allows it. */
  canEdit?: boolean
  /** UX only: the backend decides. Shows row selection and "Hủy khỏi danh sách" once rows are ticked. */
  canRemove?: boolean
  /** UX only: the backend decides. Shows "Khôi phục" on cancelled rows when true and the agreement allows it. */
  canReactivate?: boolean
  /** UX only: the backend decides. Shows "In phiếu" on each active row of a READY/FINALIZED agreement. */
  canPrintForm?: boolean
  /** UX only: the backend decides. Shows row selection and the bulk print job. */
  canBulkPrintForms?: boolean
  /** UX only: the backend decides. Shows "Xếp lịch khám" for the ticked Participants. */
  canAssign?: boolean
  /** UX only: the backend decides. Lets the session picker offer "Tạo lịch khám mới". */
  canCreateSession?: boolean
  /** UX only: the backend decides. Needed to pick a session for a print by session. */
  canViewSessions?: boolean
}

export function ParticipantsTab({
  agreementId,
  organizationId,
  agreement,
  canRead = true,
  canDownloadTemplate = false,
  canImport = false,
  canCreate = false,
  canEdit = false,
  canRemove = false,
  canReactivate = false,
  canPrintForm = false,
  canBulkPrintForms = false,
  canAssign = false,
  canCreateSession = false,
  canViewSessions = false,
}: ParticipantsTabProps) {
  const [search, setSearch] = React.useState("")
  const [rosterStatus, setRosterStatus] = React.useState<ParticipantRosterStatus | undefined>()
  const [attendanceStatus, setAttendanceStatus] = React.useState<
    ParticipantAttendanceStatus | undefined
  >()
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE)
  const [sortKey, setSortKey] = React.useState<ParticipantSortKey>("id")
  const [sortBy, setSortBy] = React.useState<"ASC" | "DESC">("ASC")
  const [isImportOpen, setIsImportOpen] = React.useState(false)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<HealthExaminationParticipant | null>(null)
  // The ticked Participants a cancellation was asked for; null while the dialog is closed.
  const [cancelTargets, setCancelTargets] = React.useState<ParticipantSelectionEntry[] | null>(null)
  const [reactivating, setReactivating] = React.useState<HealthExaminationParticipant | null>(null)
  const [schedule, setSchedule] = React.useState<ParticipantScheduleFilter | undefined>()
  const [isAssignOpen, setIsAssignOpen] = React.useState(false)
  // Kept across pages and sorting; cleared when the filter changes, so it never hides rows.
  const [selection, setSelection] = React.useState<ReadonlyMap<string, ParticipantSelectionEntry>>(
    () => new Map()
  )
  const [previewing, setPreviewing] = React.useState<ExaminationFormPrintEntry | null>(null)
  const [printJobMode, setPrintJobMode] = React.useState<ExaminationFormPrintJobDialogMode | null>(
    null
  )
  const [isPrintJobOpen, setIsPrintJobOpen] = React.useState(false)
  const [trackedJob, setTrackedJob] = React.useState<TrackedExaminationFormPrintJob | null>(null)

  const { data, isLoading, isError, error, refetch } = useHealthExaminationAgreementParticipants(
    organizationId,
    agreementId,
    {
      search,
      rosterStatus,
      attendanceStatus,
      unscheduledFor: toUnscheduledFor(schedule),
      page,
      pageSize,
      sortKey,
      sortBy,
    },
    { enabled: canRead }
  )
  const templateDownload = useDownloadParticipantImportTemplate(organizationId, agreementId)
  const selectPrintable = useSelectPrintableParticipants(organizationId, agreementId)

  const templateAllowed = canDownloadTemplate && isParticipantImportAllowed(agreement.status)
  const importAllowed = canImport && isParticipantImportAllowed(agreement.status)
  const createAllowed = canCreate && isParticipantChangeAllowed(agreement.status)
  const editAllowed = canEdit && isParticipantChangeAllowed(agreement.status)
  const removeAllowed = canRemove && isParticipantChangeAllowed(agreement.status)
  const reactivateAllowed = canReactivate && isParticipantChangeAllowed(agreement.status)
  const hasWritePermission = canImport || canCreate || canEdit || canRemove || canReactivate
  const writeAllowed =
    importAllowed || createAllowed || editAllowed || removeAllowed || reactivateAllowed
  const printAllowed = isExaminationFormPrintAllowed(agreement.status)
  const singlePrintAllowed = canPrintForm && printAllowed
  const bulkPrintAllowed = canBulkPrintForms && printAllowed
  const assignAllowed = canAssign && isParticipantSchedulingAllowed(agreement.status)
  // Ticking is offered when a ticked row can be scheduled, printed or cancelled.
  const selectionEnabled = bulkPrintAllowed || removeAllowed || assignAllowed
  const hasFilter = Boolean(search.trim() || rosterStatus || attendanceStatus || schedule)
  const participants = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages || 1
  const isEmpty = !isLoading && !isError && total === 0 && !hasFilter

  const resetPage = <T,>(set: (value: T) => void) => (value: T) => {
    set(value)
    setPage(1)
    setSelection(new Map())
  }

  const handleSelectionChange = (
    changed: HealthExaminationParticipant[],
    selected: boolean
  ) => {
    setSelection((current) => {
      const next = new Map(current)
      for (const participant of changed) {
        if (selected && participant.rosterStatus === "ACTIVE") {
          next.set(participant.id, toParticipantSelectionEntry(participant))
        } else {
          next.delete(participant.id)
        }
      }
      return next
    })
  }

  const handleSelectAllMatching = () => {
    if (rosterStatus === "CANCELLED") {
      toast.warning("Người đã hủy khỏi danh sách không in được phiếu khám.")
      return
    }
    selectPrintable.mutate(
      {
        search,
        attendanceStatus,
        unscheduledFor: toUnscheduledFor(schedule),
        sortKey,
        sortBy,
      },
      {
        onSuccess: (result) => {
          if (result.tooMany) {
            toast.warning(
              `Có ${result.total.toLocaleString("vi-VN")} người khớp bộ lọc, vượt giới hạn 1.000 người mỗi lệnh in. Hãy lọc theo lịch khám hoặc tìm theo đơn vị/phòng ban.`,
              { id: "participant-print-select-too-many" }
            )
            return
          }
          setSelection(new Map(result.entries.map((entry) => [entry.id, entry])))
          if (result.entries.length === 0) {
            toast.warning("Không có người khám đang trong danh sách khớp bộ lọc.", {
              id: "participant-print-select-empty",
            })
          }
        },
        onError: () =>
          toast.error("Không thể tải danh sách người khám để chọn. Vui lòng thử lại.", {
            id: "participant-print-select-failed",
          }),
      }
    )
  }

  const openPrintJob = (mode: ExaminationFormPrintJobDialogMode) => {
    setPrintJobMode(mode)
    setIsPrintJobOpen(true)
  }

  const handlePrintJobCreated = (job: TrackedExaminationFormPrintJob) => {
    setTrackedJob(job)
    // A session print does not use the selection, so it stays for the next print.
    if (!job.session) setSelection(new Map())
    setPrintJobMode({ kind: "track", job })
  }

  const handleAssigned = (result: AssignParticipantsResult) => {
    setSelection(new Map())
    const skipped = result.skippedParticipantIds.length
    toast.success(
      skipped > 0
        ? `Đã xếp lịch cho ${result.assignedCount.toLocaleString("vi-VN")} người; ${skipped.toLocaleString("vi-VN")} người đã có trong lịch này.`
        : `Đã xếp lịch cho ${result.assignedCount.toLocaleString("vi-VN")} người khám.`
    )
  }

  const handleCancelProcessed = (
    result: CancelParticipantsResult,
    targets: ParticipantSelectionEntry[]
  ) => {
    if (result.cancelled.length === 0) return
    const cancelled = new Set(result.cancelled)
    setSelection((current) => new Map([...current].filter(([id]) => !cancelled.has(id))))
    const [first] = targets.filter((target) => cancelled.has(target.id))
    toast.success(
      result.cancelled.length === 1 && first
        ? `Đã hủy người khám ${first.fullName}.`
        : `Đã hủy ${result.cancelled.length.toLocaleString("vi-VN")} người khám.`
    )
  }

  const handleSortChange = (key: ParticipantSortKey) => {
    if (key === sortKey) setSortBy((current) => (current === "ASC" ? "DESC" : "ASC"))
    else {
      setSortKey(key)
      setSortBy("ASC")
    }
    setPage(1)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }

  const handleDownloadTemplate = () =>
    templateDownload.mutate(
      { agreementCode: agreement.code },
      {
        onError: () =>
          toast.error("Không thể tải tệp mẫu. Vui lòng thử lại.", {
            id: "participant-template-download-failed",
            action: { label: "Thử lại", onClick: handleDownloadTemplate },
          }),
      }
    )

  const actions =
    templateAllowed || importAllowed || createAllowed ? (
      <>
        {createAllowed && (
          <Button
            type="button"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
          >
            <UserPlus className="mr-1.5 size-3.5" />
            Thêm người khám
          </Button>
        )}
        {templateAllowed && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={templateDownload.isPending}
          >
            <Download className="mr-1.5 size-3.5" />
            {templateDownload.isPending ? "Đang tải..." : "Tải tệp mẫu"}
          </Button>
        )}
        {importAllowed && (
          <Button type="button" size="sm" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-1.5 size-3.5" />
            Nhập từ Excel
          </Button>
        )}
      </>
    ) : undefined

  if (!canRead) {
    return (
      <div role="status" className="rounded-lg border border-border bg-muted p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Không có quyền xem</p>
        <p className="mt-1">Tài khoản của bạn chưa được cấp quyền xem danh sách người khám.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ParticipantsToolbar
        search={search}
        onSearchChange={resetPage(setSearch)}
        rosterStatus={rosterStatus}
        onRosterStatusChange={resetPage(setRosterStatus)}
        attendanceStatus={attendanceStatus}
        onAttendanceStatusChange={resetPage(setAttendanceStatus)}
        schedule={schedule}
        onScheduleChange={resetPage(setSchedule)}
        actions={isEmpty ? undefined : actions}
      />

      {!isEmpty && (canPrintForm || canBulkPrintForms) && !printAllowed && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info aria-hidden="true" className="size-3.5 shrink-0" />
          {EXAMINATION_FORM_PRINT_BLOCKED_NOTE}
        </p>
      )}

      {!isEmpty && !isLoading && !isError && selectionEnabled && (
        <ParticipantSelectionBar
          selectedCount={selection.size}
          onSelectAllMatching={handleSelectAllMatching}
          isSelectingAll={selectPrintable.isPending}
          onClear={() => setSelection(new Map())}
          onPrint={
            bulkPrintAllowed
              ? () => openPrintJob({ kind: "create", entries: [...selection.values()] })
              : undefined
          }
          onPrintSession={
            bulkPrintAllowed && canViewSessions
              ? () => openPrintJob({ kind: "create-session" })
              : undefined
          }
          onAssign={assignAllowed ? () => setIsAssignOpen(true) : undefined}
          onCancel={removeAllowed ? () => setCancelTargets([...selection.values()]) : undefined}
          trackedJobId={trackedJob?.jobId}
          onOpenTrackedJob={() => trackedJob && openPrintJob({ kind: "track", job: trackedJob })}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">
            Không thể tải danh sách người khám.
          </p>
          <p role="alert" className="text-xs text-muted-foreground">
            {error instanceof Error ? error.message : "Đã xảy ra lỗi kết nối API."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-medium text-primary hover:underline"
          >
            Thử lại
          </button>
        </div>
      ) : isEmpty ? (
        <EmptyParticipantsState
          actions={actions}
          note={
            writeAllowed || !hasWritePermission
              ? undefined
              : "Thỏa thuận này không còn nhận danh sách người khám mới."
          }
        />
      ) : (
        <ParticipantsTable
          participants={participants}
          totalItems={total}
          currentPage={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          sortKey={sortKey}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onEdit={editAllowed ? setEditing : undefined}
          onReactivate={reactivateAllowed ? setReactivating : undefined}
          onPrint={
            singlePrintAllowed
              ? (participant) => setPreviewing(toExaminationFormPrintEntry(participant))
              : undefined
          }
          selection={
            selectionEnabled
              ? {
                  isSelected: (participantId) => selection.has(participantId),
                  onChange: handleSelectionChange,
                }
              : undefined
          }
        />
      )}

      {singlePrintAllowed && (
        <ExaminationFormPreviewDialog
          open={previewing !== null}
          onOpenChange={(open) => {
            if (!open) setPreviewing(null)
          }}
          organizationId={organizationId}
          agreementId={agreementId}
          participant={previewing}
        />
      )}

      {bulkPrintAllowed && (
        <ExaminationFormPrintJobDialog
          open={isPrintJobOpen}
          onOpenChange={setIsPrintJobOpen}
          organizationId={organizationId}
          agreementId={agreementId}
          mode={printJobMode}
          onJobCreated={handlePrintJobCreated}
          onRecreate={(job) =>
            setPrintJobMode(
              job.session
                ? { kind: "create-session", initialSessionId: job.session.id }
                : { kind: "create", entries: job.entries }
            )
          }
        />
      )}

      {editAllowed && (
        <ParticipantFormDialog
          mode="edit"
          open={editing !== null}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
          organizationId={organizationId}
          agreementId={agreementId}
          participantId={editing?.id}
          onSaved={() => toast.success("Đã cập nhật thông tin người khám.")}
          onNotice={warn}
        />
      )}
      {removeAllowed && (
        <CancelParticipantsDialog
          open={cancelTargets !== null}
          onOpenChange={(open) => {
            if (!open) setCancelTargets(null)
          }}
          organizationId={organizationId}
          agreementId={agreementId}
          participants={cancelTargets ?? []}
          onProcessed={handleCancelProcessed}
        />
      )}
      {reactivateAllowed && (
        <ReactivateParticipantDialog
          open={reactivating !== null}
          onOpenChange={(open) => {
            if (!open) setReactivating(null)
          }}
          organizationId={organizationId}
          agreementId={agreementId}
          participant={reactivating}
          onReactivated={(participant) =>
            toast.success(`Đã khôi phục người khám ${participant.fullName}.`)
          }
          onNotice={warn}
        />
      )}

      {createAllowed && (
        <ParticipantFormDialog
          mode="create"
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          organizationId={organizationId}
          agreementId={agreementId}
          onSaved={() => toast.success("Đã thêm người khám vào danh sách.")}
          onNotice={warn}
          onReactivateCandidate={
            reactivateAllowed
              ? (participant) => {
                  setIsCreateOpen(false)
                  setReactivating(participant)
                }
              : undefined
          }
        />
      )}

      {assignAllowed && (
        <AssignSessionDialog
          open={isAssignOpen}
          onOpenChange={setIsAssignOpen}
          organizationId={organizationId}
          agreement={{ id: agreementId, name: agreement.name }}
          participantIds={[...selection.keys()]}
          canCreateSession={canCreateSession}
          onAssigned={handleAssigned}
        />
      )}

      {importAllowed && (
        <ParticipantImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          organizationId={organizationId}
          agreementId={agreementId}
          agreementName={agreement.name}
          rowVersion={agreement.rowVersion}
          onDownloadTemplate={templateAllowed ? handleDownloadTemplate : undefined}
          isDownloadingTemplate={templateDownload.isPending}
          canAssign={assignAllowed}
          canCreateSession={canCreateSession}
          onImported={(imported) =>
            toast.success(
              imported.sessionId
                ? `Đã thêm ${imported.createdCount.toLocaleString("vi-VN")} người khám vào thỏa thuận và xếp lịch cho ${(imported.assignedCount ?? 0).toLocaleString("vi-VN")} người.`
                : `Đã thêm ${imported.createdCount} người khám vào thỏa thuận.`
            )
          }
        />
      )}
    </div>
  )
}
