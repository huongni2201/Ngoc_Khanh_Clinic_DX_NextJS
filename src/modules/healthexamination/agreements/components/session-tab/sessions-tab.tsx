"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, CalendarPlus, Eye, RefreshCw } from "@/shared/ui/product-icon"
import { DataTablePagination, StatusPill, parsePageSize } from "@/shared/ui"
import { toast } from "@/shared/ui/toaster"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAgreementPermissions } from "../../hooks/use-agreement-permissions"
import { useExaminationSessions } from "../../hooks/use-sessions"
import type { ExaminationSession, SessionActivity, SessionStatus } from "../../types"
import { SESSION_ACTIVITIES, SESSION_STATUSES } from "../../types/transport"
import { isExaminationFormPrintAllowed } from "../../utils/examination-form-print"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"
import { isAgreementOpen } from "../../utils/agreement-labels"
import {
  SESSION_ACTIVITY_LABELS,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_TONES,
  formatSessionSite,
  isSessionOpen,
} from "../../utils/session-labels"
import {
  ExaminationFormPrintJobDialog,
  type ExaminationFormPrintJobDialogMode,
  type TrackedExaminationFormPrintJob,
} from "../participants-tab/examination-form-print-job-dialog"
import { CancelSessionDialog } from "./cancel-session-dialog"
import { SessionDetailSheet } from "./session-detail-sheet"
import { SessionFormDialog } from "./session-form-dialog"

const SEARCH_PARAM = "sq"
const FROM_PARAM = "sfrom"
const TO_PARAM = "sto"
const ACTIVITY_PARAM = "sact"
const STATUS_PARAM = "sstatus"
const PAGE_PARAM = "spage"
const PAGE_SIZE_PARAM = "ssize"
const SESSION_PARAM = "session"
const SEARCH_DEBOUNCE_MS = 300
const DEFAULT_SESSION_PAGE_SIZE = 10
const SEARCH_MAX_LENGTH = 100
const ALL = "ALL"

const HEAD_CLASS = "px-3 py-3 text-left font-semibold"

function isIsoDate(value: string | null | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))
}

interface SessionsTabProps {
  organizationId: string
  /**
   * The agreement the tab is opened from: its own and the shared sessions are listed, new sessions can
   * be reserved to it, and its forms can be printed by session. Omitted for the whole Organization.
   */
  agreement?: { id: string; name: string; code: string; status: string }
}

/**
 * The sessions (Lịch khám) of an Organization or of one agreement: filter by date, activity and
 * status, create and edit, open one to see who is assigned and record who came. The filters live in
 * the address, so they survive opening a session and coming back.
 */
export function SessionsTab({ organizationId, agreement }: SessionsTabProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const permissions = useAgreementPermissions()
  const { sessions, assignments, participants } = permissions

  const search = (searchParams?.get(SEARCH_PARAM) ?? "").trim().slice(0, SEARCH_MAX_LENGTH)
  const fromParam = searchParams?.get(FROM_PARAM)
  const toParam = searchParams?.get(TO_PARAM)
  const from = isIsoDate(fromParam) ? fromParam : undefined
  const to = isIsoDate(toParam) ? toParam : undefined
  const activityParam = searchParams?.get(ACTIVITY_PARAM)
  const activity = SESSION_ACTIVITIES.find((value) => value === activityParam)
  const statusParam = searchParams?.get(STATUS_PARAM)
  const status = SESSION_STATUSES.find((value) => value === statusParam)
  const pageValue = Number(searchParams?.get(PAGE_PARAM))
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1
  const pageSize = parsePageSize(searchParams?.get(PAGE_SIZE_PARAM), DEFAULT_SESSION_PAGE_SIZE)
  const openSessionId = searchParams?.get(SESSION_PARAM) || null

  const [searchInput, setSearchInput] = React.useState(search)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ExaminationSession | null>(null)
  const [cancelling, setCancelling] = React.useState<ExaminationSession | null>(null)
  const [printMode, setPrintMode] = React.useState<ExaminationFormPrintJobDialogMode | null>(null)
  const [isPrintOpen, setIsPrintOpen] = React.useState(false)

  const updateParams = React.useCallback(
    (changes: Record<string, string | undefined>, resetPage = true) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "")
      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      if (resetPage) params.delete(PAGE_PARAM)
      const query = params.toString()
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  // Writes the typed search to the address once the user pauses; the address is the source of the request.
  React.useEffect(() => {
    if (searchInput.trim() === search) return
    const timer = setTimeout(
      () => updateParams({ [SEARCH_PARAM]: searchInput.trim() || undefined }),
      SEARCH_DEBOUNCE_MS
    )
    return () => clearTimeout(timer)
  }, [searchInput, search, updateParams])

  const { data, isLoading, isError, error, refetch } = useExaminationSessions(
    organizationId,
    {
      agreementId: agreement?.id,
      search,
      from,
      to,
      activity,
      status,
      page,
      pageSize,
      sortKey: "sessionDate",
      sortBy: "DESC",
    },
    { enabled: sessions.canRead }
  )

  const agreementOpen = !agreement || isAgreementOpen(agreement.status)
  const createAllowed = sessions.canCreate && agreementOpen
  const editAllowed = sessions.canEdit && agreementOpen
  const cancelAllowed = sessions.canCancel && agreementOpen
  const printAllowed =
    Boolean(agreement) &&
    participants.canBulkPrintForms &&
    sessions.canRead &&
    isExaminationFormPrintAllowed(agreement?.status ?? "")
  const rows = data?.data ?? []
  const filtered = Boolean(search || from || to || activity || status)

  const openSession = (sessionId: string | null) =>
    updateParams({ [SESSION_PARAM]: sessionId ?? undefined }, false)

  const handlePrintJobCreated = (job: TrackedExaminationFormPrintJob) =>
    setPrintMode({ kind: "track", job })

  if (!sessions.canRead) {
    return (
      <div role="status" className="rounded-lg border border-border bg-muted p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Không có quyền xem</p>
        <p className="mt-1">Tài khoản của bạn chưa được cấp quyền xem lịch khám.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4" data-slot="sessions-tab">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          type="search"
          value={searchInput}
          maxLength={SEARCH_MAX_LENGTH}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-label="Tìm lịch khám"
          placeholder="Tìm theo địa điểm..."
          className="h-9 min-w-52 max-w-sm flex-1 text-xs"
        />
        <label className="grid gap-1 text-[11px] font-medium text-muted-foreground">
          Từ ngày
          <Input
            type="date"
            value={from ?? ""}
            max={to}
            onChange={(event) => updateParams({ [FROM_PARAM]: event.target.value || undefined })}
            aria-label="Lọc lịch khám từ ngày"
            className="h-9 text-xs"
          />
        </label>
        <label className="grid gap-1 text-[11px] font-medium text-muted-foreground">
          Đến ngày
          <Input
            type="date"
            value={to ?? ""}
            min={from}
            onChange={(event) => updateParams({ [TO_PARAM]: event.target.value || undefined })}
            aria-label="Lọc lịch khám đến ngày"
            className="h-9 text-xs"
          />
        </label>
        <select
          aria-label="Lọc theo loại hoạt động"
          value={activity ?? ALL}
          onChange={(event) =>
            updateParams({
              [ACTIVITY_PARAM]: event.target.value === ALL ? undefined : (event.target.value as SessionActivity),
            })
          }
          className="h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground"
        >
          <option value={ALL}>Tất cả hoạt động</option>
          {SESSION_ACTIVITIES.map((value) => (
            <option key={value} value={value}>
              {SESSION_ACTIVITY_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          aria-label="Lọc theo trạng thái lịch khám"
          value={status ?? ALL}
          onChange={(event) =>
            updateParams({
              [STATUS_PARAM]: event.target.value === ALL ? undefined : (event.target.value as SessionStatus),
            })
          }
          className="h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground"
        >
          <option value={ALL}>Tất cả trạng thái</option>
          {SESSION_STATUSES.map((value) => (
            <option key={value} value={value}>
              {SESSION_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {createAllowed && (
            <Button type="button" size="sm" onClick={() => setIsCreateOpen(true)}>
              <CalendarPlus aria-hidden="true" className="mr-1.5 size-3.5" />
              Tạo lịch khám
            </Button>
          )}
        </div>
      </div>

      {isError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted p-4 text-xs text-foreground"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
            {error instanceof Error ? error.message : "Không thể tải danh sách lịch khám."}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="size-3.5" />
            Thử lại
          </Button>
        </div>
      ) : isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[820px] border-collapse text-xs">
              <caption className="sr-only">Lịch khám</caption>
              <thead>
                <tr className="border-b border-border bg-table-header-bg text-table-header-fg">
                  <th className={HEAD_CLASS}>Ngày khám</th>
                  <th className={HEAD_CLASS}>Hoạt động</th>
                  <th className={HEAD_CLASS}>Địa điểm</th>
                  <th className={HEAD_CLASS}>Trạng thái</th>
                  <th className={`${HEAD_CLASS} text-right`}>Đã xếp</th>
                  <th className={`${HEAD_CLASS} text-right`}>Đã đến</th>
                  <th className={`${HEAD_CLASS} text-right`}>Không đến</th>
                  <th className={HEAD_CLASS}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-table-divider">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted-foreground">
                      {filtered
                        ? "Không tìm thấy lịch khám phù hợp với bộ lọc."
                        : createAllowed
                          ? "Chưa có lịch khám nào. Tạo lịch khám để xếp người khám vào."
                          : "Chưa có lịch khám nào."}
                    </td>
                  </tr>
                ) : (
                  rows.map((session) => (
                    <tr key={session.id} className="hover:bg-hover/50">
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium tabular-nums text-foreground">
                        {formatHealthExaminationDate(session.sessionDate)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        {SESSION_ACTIVITY_LABELS[session.activity]}
                      </td>
                      <td className="px-3 py-2.5">
                        {formatSessionSite(session)}
                        {!agreement && !session.agreementId && (
                          <span className="ml-1 text-muted-foreground">(dùng chung)</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <StatusPill tone={SESSION_STATUS_TONES[session.status]}>
                          {SESSION_STATUS_LABELS[session.status]}
                        </StatusPill>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {session.assignedCount.toLocaleString("vi-VN")}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {session.attendedCount.toLocaleString("vi-VN")}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {session.noShowCount.toLocaleString("vi-VN")}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {sessions.canViewDetail && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs"
                              aria-label={`Xem lịch khám ngày ${formatHealthExaminationDate(session.sessionDate)}`}
                              onClick={() => openSession(session.id)}
                            >
                              <Eye aria-hidden="true" className="size-3.5" />
                              Xem
                            </Button>
                          )}
                          {editAllowed && isSessionOpen(session.status) && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs"
                              aria-label={`Sửa lịch khám ngày ${formatHealthExaminationDate(session.sessionDate)}`}
                              onClick={() => setEditing(session)}
                            >
                              Sửa
                            </Button>
                          )}
                          {cancelAllowed && isSessionOpen(session.status) && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs"
                              aria-label={`Hủy lịch khám ngày ${formatHealthExaminationDate(session.sessionDate)}`}
                              onClick={() => setCancelling(session)}
                            >
                              Hủy lịch
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {data && (
            <DataTablePagination
              currentPage={data.page}
              pageSize={data.pageSize}
              totalItems={data.total}
              totalPages={data.totalPages}
              entityName="lịch khám"
              onPageChange={(next) => updateParams({ [PAGE_PARAM]: next > 1 ? String(next) : undefined }, false)}
              onPageSizeChange={(size) =>
                updateParams({
                  [PAGE_SIZE_PARAM]: size !== DEFAULT_SESSION_PAGE_SIZE ? String(size) : undefined,
                })
              }
            />
          )}
        </div>
      )}

      {sessions.canViewDetail && (
        <SessionDetailSheet
          open={openSessionId !== null}
          onOpenChange={(open) => {
            if (!open) openSession(null)
          }}
          organizationId={organizationId}
          sessionId={openSessionId}
          agreement={agreement ? { id: agreement.id, name: agreement.name } : undefined}
          canViewAssignments={assignments.canRead}
          canRecordAttendance={assignments.canRecordAttendance && agreementOpen}
          canMove={assignments.canMove && agreementOpen}
          canMoveAll={assignments.canMoveAll && agreementOpen}
          canCancelAssignment={assignments.canCancel && agreementOpen}
          canPrint={printAllowed}
          canCreateSession={createAllowed}
          onPrint={(sessionId) => {
            setPrintMode({ kind: "create-session", initialSessionId: sessionId })
            setIsPrintOpen(true)
          }}
        />
      )}

      {createAllowed && (
        <SessionFormDialog
          mode="create"
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          organizationId={organizationId}
          agreement={agreement ? { id: agreement.id, name: agreement.name } : undefined}
          onSaved={() => toast.success("Đã tạo lịch khám.")}
        />
      )}
      {editAllowed && (
        <SessionFormDialog
          mode="edit"
          open={editing !== null}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
          organizationId={organizationId}
          session={editing}
          onSaved={() => toast.success("Đã cập nhật lịch khám.")}
        />
      )}
      {cancelAllowed && (
        <CancelSessionDialog
          open={cancelling !== null}
          onOpenChange={(open) => {
            if (!open) setCancelling(null)
          }}
          organizationId={organizationId}
          session={cancelling}
        />
      )}

      {printAllowed && agreement && (
        <ExaminationFormPrintJobDialog
          open={isPrintOpen}
          onOpenChange={setIsPrintOpen}
          organizationId={organizationId}
          agreementId={agreement.id}
          mode={printMode}
          onJobCreated={handlePrintJobCreated}
          onRecreate={(job) =>
            setPrintMode(
              job.session
                ? { kind: "create-session", initialSessionId: job.session.id }
                : { kind: "create", entries: job.entries }
            )
          }
        />
      )}
    </div>
  )
}
