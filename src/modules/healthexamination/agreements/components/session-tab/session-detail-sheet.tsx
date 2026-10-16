"use client"

import * as React from "react"
import { AlertCircle, Loader2, Printer } from "@/shared/ui/product-icon"
import { DataTablePagination, StatusPill } from "@/shared/ui"
import { toast } from "@/shared/ui/toaster"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useExaminationSession,
  useMoveSessionAssignment,
  useMoveSessionAssignments,
  useRecordSessionAttendance,
  useSessionAssignments,
} from "../../hooks/use-sessions"
import type {
  AssignmentStatus,
  RecordableAssignmentStatus,
  SessionAssignmentRow,
} from "../../types"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"
import { describeSchedulingError } from "../../utils/session-errors"
import {
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_TONES,
  SESSION_ACTIVITY_LABELS,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_TONES,
  formatSessionSite,
  isSessionOpen,
} from "../../utils/session-labels"
import { CancelAssignmentDialog } from "./cancel-assignment-dialog"
import { SessionSelectDialog } from "./session-select-dialog"

const STATUS_FILTER_ALL = "ALL"
const SEARCH_MAX_LENGTH = 100
const PAGE_SIZE = 20
const STATUS_FILTERS: Record<string, string> = {
  [STATUS_FILTER_ALL]: "Tất cả",
  ASSIGNED: ASSIGNMENT_STATUS_LABELS.ASSIGNED,
  ATTENDED: ASSIGNMENT_STATUS_LABELS.ATTENDED,
  NO_SHOW: ASSIGNMENT_STATUS_LABELS.NO_SHOW,
  MOVED: ASSIGNMENT_STATUS_LABELS.MOVED,
  CANCELLED: ASSIGNMENT_STATUS_LABELS.CANCELLED,
}

export interface SessionDetailPermissions {
  canViewAssignments: boolean
  canRecordAttendance: boolean
  canMove: boolean
  canMoveAll: boolean
  canCancelAssignment: boolean
  /** Opens the print of this session; needs an agreement to print for. */
  canPrint: boolean
  canCreateSession: boolean
}

export interface SessionDetailSheetProps extends SessionDetailPermissions {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  sessionId: string | null
  /** The agreement the sheet is opened from; the move picker then lists its sessions. */
  agreement?: { id: string; name: string }
  onPrint?: (sessionId: string) => void
}

/** One session with the Participants assigned to it, and what staff can do with each of them. */
export function SessionDetailSheet({
  open,
  onOpenChange,
  organizationId,
  sessionId,
  agreement,
  onPrint,
  canViewAssignments,
  canRecordAttendance,
  canMove,
  canMoveAll,
  canCancelAssignment,
  canPrint,
  canCreateSession,
}: SessionDetailSheetProps) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<AssignmentStatus | undefined>()
  const [page, setPage] = React.useState(1)
  const [moving, setMoving] = React.useState<SessionAssignmentRow | null>(null)
  const [isMoveAllOpen, setIsMoveAllOpen] = React.useState(false)
  const [cancelling, setCancelling] = React.useState<SessionAssignmentRow | null>(null)
  const [failure, setFailure] = React.useState<string | null>(null)
  const [moveFailure, setMoveFailure] = React.useState<string | null>(null)

  const sessionQuery = useExaminationSession(organizationId, sessionId ?? undefined, {
    enabled: open,
  })
  const assignmentsQuery = useSessionAssignments(
    organizationId,
    sessionId ?? undefined,
    { search, status, page, pageSize: PAGE_SIZE, sortKey: "fullName", sortBy: "ASC" },
    { enabled: open && canViewAssignments }
  )
  const attendanceMutation = useRecordSessionAttendance()
  const moveMutation = useMoveSessionAssignment()
  const moveAllMutation = useMoveSessionAssignments()

  const session = sessionQuery.data
  const rows = assignmentsQuery.data?.data ?? []
  const open_ = session ? isSessionOpen(session.status) : false

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSearch("")
      setStatus(undefined)
      setPage(1)
      setFailure(null)
    }
    onOpenChange(next)
  }

  const record = async (row: SessionAssignmentRow, target: RecordableAssignmentStatus) => {
    if (!sessionId) return
    setFailure(null)
    try {
      await attendanceMutation.mutateAsync({
        organizationId,
        sessionId,
        assignmentId: row.assignmentId,
        status: target,
        rowVersion: row.assignmentRowVersion,
      })
      toast.success(
        target === "ATTENDED"
          ? `Đã ghi nhận ${row.fullName} đến khám.`
          : target === "NO_SHOW"
            ? `Đã ghi nhận ${row.fullName} không đến.`
            : `Đã hoàn tác ghi nhận của ${row.fullName}.`
      )
    } catch (error) {
      setFailure(describeSchedulingError(error, "attendance").message)
    }
  }

  const confirmMove = async (target: { id: string }) => {
    if (!sessionId || !moving) return
    setMoveFailure(null)
    try {
      await moveMutation.mutateAsync({
        organizationId,
        sessionId,
        assignmentId: moving.assignmentId,
        targetSessionId: target.id,
        rowVersion: moving.assignmentRowVersion,
      })
      toast.success(`Đã đổi lịch khám của ${moving.fullName}.`)
      setMoving(null)
    } catch (error) {
      setMoveFailure(describeSchedulingError(error, "move").message)
    }
  }

  const confirmMoveAll = async (target: { id: string }) => {
    if (!sessionId) return
    setMoveFailure(null)
    try {
      const result = await moveAllMutation.mutateAsync({
        organizationId,
        sessionId,
        targetSessionId: target.id,
      })
      toast.success(
        result.skippedParticipantIds.length > 0
          ? `Đã dời ${result.movedCount.toLocaleString("vi-VN")} người; ${result.skippedParticipantIds.length.toLocaleString("vi-VN")} người đã có trong lịch đích.`
          : `Đã dời ${result.movedCount.toLocaleString("vi-VN")} người sang lịch mới.`
      )
      setIsMoveAllOpen(false)
    } catch (error) {
      setMoveFailure(describeSchedulingError(error, "move-all").message)
    }
  }

  const title = session
    ? `Lịch khám ngày ${formatHealthExaminationDate(session.sessionDate)}`
    : "Lịch khám"

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-l border-border bg-background p-0 sm:max-w-3xl"
        >
          <SheetHeader className="border-b border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
              <div className="space-y-1">
                <SheetTitle className="text-base font-bold text-foreground">{title}</SheetTitle>
                <SheetDescription className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {session ? (
                    <>
                      <span>{SESSION_ACTIVITY_LABELS[session.activity]}</span>
                      <span>•</span>
                      <span>{formatSessionSite(session)}</span>
                      <StatusPill tone={SESSION_STATUS_TONES[session.status]}>
                        {SESSION_STATUS_LABELS[session.status]}
                      </StatusPill>
                    </>
                  ) : (
                    "Đang tải lịch khám..."
                  )}
                </SheetDescription>
              </div>
              {session && (
                <dl className="flex gap-4 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Đã xếp</dt>
                    <dd className="font-semibold tabular-nums text-foreground">
                      {session.assignedCount.toLocaleString("vi-VN")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Đã đến</dt>
                    <dd className="font-semibold tabular-nums text-foreground">
                      {session.attendedCount.toLocaleString("vi-VN")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Không đến</dt>
                    <dd className="font-semibold tabular-nums text-foreground">
                      {session.noShowCount.toLocaleString("vi-VN")}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {canMoveAll && open_ && session && session.assignedCount > 0 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setIsMoveAllOpen(true)}>
                  Dời cả lịch sang ngày khác
                </Button>
              )}
              {canPrint && onPrint && sessionId && session && open_ && (
                <Button type="button" variant="outline" size="sm" onClick={() => onPrint(sessionId)}>
                  <Printer aria-hidden="true" className="mr-1.5 size-3.5" />
                  In phiếu theo lịch này
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-4 p-6">
            {sessionQuery.isError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs">
                  Không thể tải lịch khám. Đóng rồi mở lại để thử lại.
                </AlertDescription>
              </Alert>
            )}

            {!canViewAssignments ? (
              <p role="status" className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
                Tài khoản của bạn chưa được cấp quyền xem người khám trong lịch khám.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    type="search"
                    value={search}
                    maxLength={SEARCH_MAX_LENGTH}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPage(1)
                    }}
                    aria-label="Tìm người khám trong lịch khám"
                    placeholder="Tìm theo mã, họ tên, đơn vị..."
                    className="h-9 min-w-52 max-w-sm flex-1 text-xs"
                  />
                  <select
                    aria-label="Lọc theo trạng thái phân lịch"
                    value={status ?? STATUS_FILTER_ALL}
                    onChange={(event) => {
                      setStatus(
                        event.target.value === STATUS_FILTER_ALL
                          ? undefined
                          : (event.target.value as AssignmentStatus)
                      )
                      setPage(1)
                    }}
                    className="h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground"
                  >
                    {Object.entries(STATUS_FILTERS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {failure && (
                  <Alert variant="destructive" className="py-2.5">
                    <AlertCircle className="size-4" />
                    <AlertDescription className="text-xs">{failure}</AlertDescription>
                  </Alert>
                )}

                {assignmentsQuery.isLoading ? (
                  <Skeleton className="h-64 w-full rounded-lg" />
                ) : assignmentsQuery.isError ? (
                  <div role="alert" className="space-y-2 text-xs text-destructive">
                    <p>Không thể tải danh sách người khám của lịch khám.</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => void assignmentsQuery.refetch()}>
                      Thử lại
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="overflow-x-auto rounded-lg border border-border bg-card">
                      <table className="w-full min-w-[640px] border-collapse text-xs">
                        <caption className="sr-only">Người khám trong lịch khám</caption>
                        <thead>
                          <tr className="border-b border-border bg-table-header-bg text-left font-semibold text-table-header-fg">
                            <th className="px-3 py-3">Mã</th>
                            <th className="px-3 py-3">Họ và tên</th>
                            <th className="px-3 py-3">Đơn vị/Phòng ban</th>
                            <th className="px-3 py-3">Trạng thái</th>
                            <th className="px-3 py-3">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-table-divider">
                          {rows.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                Chưa có người khám nào trong lịch này.
                              </td>
                            </tr>
                          ) : (
                            rows.map((row) => (
                              <tr key={row.assignmentId}>
                                <td className="whitespace-nowrap px-3 py-2.5">{row.participantCode ?? "—"}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">
                                  {row.fullName}
                                  {row.rosterStatus === "CANCELLED" && (
                                    <span className="ml-1 text-muted-foreground">(đã hủy khỏi danh sách)</span>
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5">{row.departmentName}</td>
                                <td className="whitespace-nowrap px-3 py-2.5">
                                  <StatusPill tone={ASSIGNMENT_STATUS_TONES[row.status]}>
                                    {ASSIGNMENT_STATUS_LABELS[row.status]}
                                  </StatusPill>
                                </td>
                                <td className="px-3 py-2.5">
                                  <AssignmentRowActions
                                    row={row}
                                    sessionOpen={open_}
                                    pending={attendanceMutation.isPending}
                                    canRecordAttendance={canRecordAttendance}
                                    canMove={canMove}
                                    canCancel={canCancelAssignment}
                                    onRecord={(target) => void record(row, target)}
                                    onMove={() => {
                                      setMoveFailure(null)
                                      setMoving(row)
                                    }}
                                    onCancel={() => setCancelling(row)}
                                  />
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {assignmentsQuery.data && (
                      <DataTablePagination
                        currentPage={assignmentsQuery.data.page}
                        pageSize={assignmentsQuery.data.pageSize}
                        totalItems={assignmentsQuery.data.total}
                        totalPages={assignmentsQuery.data.totalPages}
                        onPageChange={setPage}
                        entityName="người khám"
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {canMove && (
        <SessionSelectDialog
          open={moving !== null}
          onOpenChange={(next) => {
            if (!next) {
              setMoving(null)
              setMoveFailure(null)
            }
          }}
          organizationId={organizationId}
          agreement={agreement}
          excludeSessionId={sessionId ?? undefined}
          title="Đổi lịch khám"
          description={`Chọn lịch khám mới cho ${moving?.fullName ?? "người khám"}. Lịch cũ được giữ lại trong lịch sử.`}
          confirmLabel="Đổi lịch"
          pendingLabel="Đang đổi lịch..."
          pending={moveMutation.isPending}
          errorMessage={moveFailure}
          canCreateSession={canCreateSession}
          onConfirm={(target) => void confirmMove(target)}
        />
      )}

      {canMoveAll && (
        <SessionSelectDialog
          open={isMoveAllOpen}
          onOpenChange={(next) => {
            if (!next) {
              setIsMoveAllOpen(false)
              setMoveFailure(null)
            }
          }}
          organizationId={organizationId}
          agreement={agreement}
          excludeSessionId={sessionId ?? undefined}
          title="Dời cả lịch khám"
          description="Mọi người đang chờ khám trong lịch này sẽ chuyển sang lịch khám được chọn. Người đã đến khám ở lại lịch này."
          confirmLabel="Dời cả lịch"
          pendingLabel="Đang dời lịch..."
          pending={moveAllMutation.isPending}
          errorMessage={moveFailure}
          canCreateSession={canCreateSession}
          onConfirm={(target) => void confirmMoveAll(target)}
        />
      )}

      {canCancelAssignment && sessionId && (
        <CancelAssignmentDialog
          open={cancelling !== null}
          onOpenChange={(next) => {
            if (!next) setCancelling(null)
          }}
          organizationId={organizationId}
          sessionId={sessionId}
          row={cancelling}
        />
      )}
    </>
  )
}

interface AssignmentRowActionsProps {
  row: SessionAssignmentRow
  sessionOpen: boolean
  pending: boolean
  canRecordAttendance: boolean
  canMove: boolean
  canCancel: boolean
  onRecord: (target: RecordableAssignmentStatus) => void
  onMove: () => void
  onCancel: () => void
}

/**
 * The actions of one assignment. Only a waiting assignment can be moved or cancelled; attendance can
 * be corrected after the fact. The backend decides the rest (for instance a session not yet started).
 */
function AssignmentRowActions({
  row,
  sessionOpen,
  pending,
  canRecordAttendance,
  canMove,
  canCancel,
  onRecord,
  onMove,
  onCancel,
}: AssignmentRowActionsProps) {
  if (!sessionOpen && row.status !== "ATTENDED" && row.status !== "NO_SHOW") {
    return <span className="text-muted-foreground">—</span>
  }
  const buttonClass = "h-7 px-2.5 text-xs"
  const actions: React.ReactNode[] = []

  if (canRecordAttendance && (row.status === "ASSIGNED" || row.status === "NO_SHOW")) {
    actions.push(
      <Button
        key="attended"
        type="button"
        variant="outline"
        size="sm"
        className={buttonClass}
        disabled={pending}
        aria-label={`Ghi nhận ${row.fullName} đã đến`}
        onClick={() => onRecord("ATTENDED")}
      >
        Đã đến
      </Button>
    )
  }
  if (canRecordAttendance && row.status === "ASSIGNED") {
    actions.push(
      <Button
        key="no-show"
        type="button"
        variant="outline"
        size="sm"
        className={buttonClass}
        disabled={pending}
        aria-label={`Ghi nhận ${row.fullName} không đến`}
        onClick={() => onRecord("NO_SHOW")}
      >
        Không đến
      </Button>
    )
  }
  if (canRecordAttendance && (row.status === "ATTENDED" || row.status === "NO_SHOW")) {
    actions.push(
      <Button
        key="undo"
        type="button"
        variant="ghost"
        size="sm"
        className={buttonClass}
        disabled={pending}
        aria-label={`Hoàn tác ghi nhận của ${row.fullName}`}
        onClick={() => onRecord("ASSIGNED")}
      >
        {pending ? <Loader2 className="size-3 animate-spin" aria-hidden="true" /> : "Hoàn tác"}
      </Button>
    )
  }
  if (canMove && row.status === "ASSIGNED") {
    actions.push(
      <Button
        key="move"
        type="button"
        variant="outline"
        size="sm"
        className={buttonClass}
        aria-label={`Đổi lịch khám của ${row.fullName}`}
        onClick={onMove}
      >
        Đổi lịch
      </Button>
    )
  }
  if (canCancel && row.status === "ASSIGNED") {
    actions.push(
      <Button
        key="cancel"
        type="button"
        variant="outline"
        size="sm"
        className={buttonClass}
        aria-label={`Hủy phân lịch của ${row.fullName}`}
        onClick={onCancel}
      >
        Hủy phân lịch
      </Button>
    )
  }

  if (actions.length === 0) return <span className="text-muted-foreground">—</span>
  return <div className="flex flex-wrap items-center gap-1.5">{actions}</div>
}
