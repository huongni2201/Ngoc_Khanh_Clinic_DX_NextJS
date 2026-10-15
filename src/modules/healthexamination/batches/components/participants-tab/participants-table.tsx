"use client"

import { ChevronDown, ChevronRight, Printer } from "@/shared/ui/product-icon"
import { DataTablePagination } from "@/shared/ui"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { HealthExaminationParticipant, ParticipantSortKey } from "../../types"
import {
  PARTICIPANT_ATTENDANCE_STATUS_LABELS,
  PARTICIPANT_ROSTER_STATUS_LABELS,
  PARTICIPANT_SEX_LABELS,
} from "../../utils/participant-labels"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"

interface ParticipantsTableProps {
  participants: HealthExaminationParticipant[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Lets the user choose how many rows a page shows. */
  onPageSizeChange?: (pageSize: number) => void
  sortKey: ParticipantSortKey
  sortBy: "ASC" | "DESC"
  onSortChange: (sortKey: ParticipantSortKey) => void
  /** Shows "Sửa" on active rows. UX only: the backend decides every change. */
  onEdit?: (participant: HealthExaminationParticipant) => void
  /** Shows "Khôi phục" on cancelled rows. UX only: the backend decides. */
  onReactivate?: (participant: HealthExaminationParticipant) => void
  /** Shows "In phiếu" on active rows. UX only: the backend decides. */
  onPrint?: (participant: HealthExaminationParticipant) => void
  /**
   * Shows a selection column for the bulk actions (print, cancel). Cancelled rows cannot be
   * selected. The selection itself is owned by the caller so it survives paging.
   */
  selection?: {
    isSelected: (participantId: string) => boolean
    onChange: (participants: HealthExaminationParticipant[], selected: boolean) => void
  }
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
  onReactivate?: (participant: HealthExaminationParticipant) => void
  onPrint?: (participant: HealthExaminationParticipant) => void
}

/**
 * Print and edit for one row. A cancelled Participant can only be reactivated; the backend still
 * decides. Cancelling needs ticks, so it lives in the selection bar and not on the row.
 */
function ParticipantRowActions({
  participant,
  onEdit,
  onReactivate,
  onPrint,
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
  if (!onPrint && !onEdit) return <span className="text-muted-foreground">—</span>

  return (
    <div className="flex items-center gap-1.5">
      {onPrint && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-xs"
          aria-label={`In phiếu khám của ${participant.fullName}`}
          onClick={() => onPrint(participant)}
        >
          <Printer aria-hidden="true" className="size-3.5" />
          In phiếu
        </Button>
      )}
      {onEdit && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-xs"
          aria-label={`Sửa người khám ${participant.fullName}`}
          onClick={() => onEdit(participant)}
        >
          Sửa
        </Button>
      )}
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
  onPageSizeChange,
  sortKey,
  sortBy,
  onSortChange,
  onEdit,
  onReactivate,
  onPrint,
  selection,
}: ParticipantsTableProps) {
  const showActions = Boolean(onEdit || onReactivate || onPrint)
  const columnCount = 10 + (showActions ? 1 : 0) + (selection ? 1 : 0)
  const sortProps = { activeKey: sortKey, direction: sortBy, onSort: onSortChange }
  const selectable = participants.filter((participant) => participant.rosterStatus === "ACTIVE")
  const selectedOnPage = selection
    ? selectable.filter((participant) => selection.isSelected(participant.id)).length
    : 0
  const allOnPageSelected = selectable.length > 0 && selectedOnPage === selectable.length

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card  overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs border-collapse min-w-[1100px]">
            <caption className="sr-only">Danh sách người khám của đợt khám</caption>
            <thead>
              <tr className="bg-table-header-bg border-b border-border text-table-header-fg font-semibold select-none">
                {selection && (
                  <th className="w-10 py-3 pl-3 pr-1 text-left">
                    <Checkbox
                      aria-label="Chọn tất cả người khám đang trong danh sách trên trang này"
                      checked={allOnPageSelected}
                      indeterminate={selectedOnPage > 0 && !allOnPageSelected}
                      disabled={selectable.length === 0}
                      onCheckedChange={(checked) => selection.onChange(selectable, checked)}
                    />
                  </th>
                )}
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
                {showActions && <th className="py-3 px-3 text-left font-semibold">Thao tác</th>}
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
                    aria-selected={selection ? selection.isSelected(participant.id) : undefined}
                  >
                    {selection && (
                      <td className="w-10 py-2.5 pl-3 pr-1">
                        <Checkbox
                          aria-label={`Chọn ${participant.fullName}`}
                          checked={selection.isSelected(participant.id)}
                          disabled={participant.rosterStatus !== "ACTIVE"}
                          onCheckedChange={(checked) => selection.onChange([participant], checked)}
                        />
                      </td>
                    )}
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
                    {showActions && (
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <ParticipantRowActions
                          participant={participant}
                          onEdit={onEdit}
                          onReactivate={onReactivate}
                          onPrint={onPrint}
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
        onPageSizeChange={onPageSizeChange}
        entityName="người khám"
      />
    </div>
  )
}
