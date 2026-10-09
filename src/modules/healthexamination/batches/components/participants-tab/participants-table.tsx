"use client"

import { ChevronDown, ChevronRight } from "@/shared/ui/product-icon"
import { DataTablePagination } from "@/shared/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { HealthExaminationParticipant, ParticipantSortKey } from "../../types"
import {
  PARTICIPANT_ATTENDANCE_STATUS_LABELS,
  PARTICIPANT_ROSTER_STATUS_LABELS,
  PARTICIPANT_SEX_LABELS,
  getParticipantCancelBlockReason,
} from "../../utils/participant-labels"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"

interface ParticipantsTableProps {
  participants: HealthExaminationParticipant[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  sortKey: ParticipantSortKey
  sortBy: "ASC" | "DESC"
  onSortChange: (sortKey: ParticipantSortKey) => void
  /** Shows the action column. UX only: the backend decides every change. */
  canManage?: boolean
  onEdit?: (participant: HealthExaminationParticipant) => void
  onCancel?: (participant: HealthExaminationParticipant) => void
  onReactivate?: (participant: HealthExaminationParticipant) => void
}

function StatusPill({ children, tone = "muted" }: { children: string; tone?: "muted" | "warning" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium select-none whitespace-nowrap",
        tone === "warning" ? "bg-muted text-foreground" : "bg-muted text-muted-foreground"
      )}
    >
      {children}
    </span>
  )
}

interface SortableHeaderProps {
  label: string
  sortKey: ParticipantSortKey
  activeKey: ParticipantSortKey
  direction: "ASC" | "DESC"
  onSort: (sortKey: ParticipantSortKey) => void
}

function SortableHeader({ label, sortKey, activeKey, direction, onSort }: SortableHeaderProps) {
  const active = activeKey === sortKey
  return (
    <th
      className="py-3 px-3 text-left font-semibold"
      aria-sort={active ? (direction === "ASC" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 font-semibold cursor-pointer hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        aria-label={`Sắp xếp theo ${label}`}
      >
        {label}
        {active &&
          (direction === "ASC" ? (
            <ChevronRight className="size-3 -rotate-90" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-3" aria-hidden="true" />
          ))}
      </button>
    </th>
  )
}

interface ParticipantRowActionsProps {
  participant: HealthExaminationParticipant
  onEdit?: (participant: HealthExaminationParticipant) => void
  onCancel?: (participant: HealthExaminationParticipant) => void
  onReactivate?: (participant: HealthExaminationParticipant) => void
}

/**
 * Edit and cancel for one row. A cancelled Participant can only be reactivated; the backend still
 * decides.
 */
function ParticipantRowActions({
  participant,
  onEdit,
  onCancel,
  onReactivate,
}: ParticipantRowActionsProps) {
  if (participant.rosterStatus === "CANCELLED") {
    if (!onReactivate) return <span className="text-muted-foreground">—</span>
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2.5 text-xs"
        aria-label={`Khôi phục người khám ${participant.fullName}`}
        onClick={() => onReactivate(participant)}
      >
        Khôi phục
      </Button>
    )
  }
  const blockReason = getParticipantCancelBlockReason(participant)
  const reasonId = `cancel-block-${participant.id}`

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2.5 text-xs"
        aria-label={`Sửa người khám ${participant.fullName}`}
        onClick={() => onEdit?.(participant)}
      >
        Sửa
      </Button>
      <span title={blockReason ?? undefined}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-xs"
          aria-label={`Hủy người khám ${participant.fullName}`}
          aria-describedby={blockReason ? reasonId : undefined}
          disabled={blockReason !== null}
          onClick={() => onCancel?.(participant)}
        >
          Hủy
        </Button>
        {blockReason && (
          <span id={reasonId} className="sr-only">
            {blockReason}
          </span>
        )}
      </span>
    </div>
  )
}

export function ParticipantsTable({
  participants,
  totalItems,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  sortKey,
  sortBy,
  onSortChange,
  canManage = false,
  onEdit,
  onCancel,
  onReactivate,
}: ParticipantsTableProps) {
  const columnCount = canManage ? 11 : 10
  const sortProps = { activeKey: sortKey, direction: sortBy, onSort: onSortChange }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card  overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs border-collapse min-w-[1100px]">
            <caption className="sr-only">Danh sách người khám của đợt khám</caption>
            <thead>
              <tr className="bg-table-header-bg border-b border-border text-table-header-fg font-semibold select-none">
                <SortableHeader label="Mã người khám" sortKey="participantCode" {...sortProps} />
                <SortableHeader label="Họ và tên" sortKey="fullName" {...sortProps} />
                <th className="py-3 px-3 text-left font-semibold">Ngày sinh</th>
                <th className="py-3 px-3 text-left font-semibold">Giới tính</th>
                <th className="py-3 px-3 text-left font-semibold">CCCD</th>
                <th className="py-3 px-3 text-left font-semibold">Đơn vị/Phòng ban</th>
                <th className="py-3 px-3 text-left font-semibold">Chức vụ</th>
                <SortableHeader label="Ngày khám" sortKey="examinationDate" {...sortProps} />
                <th className="py-3 px-3 text-left font-semibold">Danh sách</th>
                <th className="py-3 px-3 text-left font-semibold">Tiếp nhận</th>
                {canManage && <th className="py-3 px-3 text-left font-semibold">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-table-divider">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="py-10 text-center text-muted-foreground text-xs">
                    Không tìm thấy người khám phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                participants.map((participant) => (
                  <tr
                    key={participant.id}
                    className="border-b border-divider transition-colors hover:bg-hover/50"
                  >
                    <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">
                      {participant.participantCode ?? "—"}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">
                      {participant.fullName}
                    </td>
                    <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                      {formatHealthExaminationDate(participant.dateOfBirth)}
                    </td>
                    <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                      {PARTICIPANT_SEX_LABELS[participant.sex]}
                    </td>
                    <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap font-mono">
                      {participant.identificationNumberMasked}
                    </td>
                    <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                      {participant.departmentName}
                    </td>
                    <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                      {participant.positionName}
                    </td>
                    <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                      {formatHealthExaminationDate(participant.examinationDate)}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusPill tone={participant.rosterStatus === "CANCELLED" ? "warning" : "muted"}>
                        {PARTICIPANT_ROSTER_STATUS_LABELS[participant.rosterStatus]}
                      </StatusPill>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusPill>
                        {PARTICIPANT_ATTENDANCE_STATUS_LABELS[participant.attendanceStatus]}
                      </StatusPill>
                    </td>
                    {canManage && (
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <ParticipantRowActions
                          participant={participant}
                          onEdit={onEdit}
                          onCancel={onCancel}
                          onReactivate={onReactivate}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DataTablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={onPageChange}
        entityName="người khám"
      />
    </div>
  )
}
