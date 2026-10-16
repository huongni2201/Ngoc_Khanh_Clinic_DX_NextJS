"use client"

import { DataTablePagination } from "@/shared/ui"
import { Pencil } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ExaminationDetailRow, HealthExaminationAgreementService } from "../../types"
import { MISSING_SERVICE_NAME } from "../../utils/agreement-form-values"
import {
  getExaminationStatus,
  getExaminationStatusLabel,
  isServicePerformed,
} from "../../utils/examination-detail-labels"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"

interface ExaminationMatrixTableProps {
  /** The columns: the services of the agreement, in display order. */
  services: HealthExaminationAgreementService[]
  items: ExaminationDetailRow[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  /** True when a filter or search is active, which only changes the empty message. */
  filtered?: boolean
  /** Opens the manual entry for a row. When absent the table is read-only. */
  onEditRow?: (row: ExaminationDetailRow) => void
  /** The row just saved; briefly highlighted. */
  highlightedRowId?: string | null
}

const STATUS_TONES = {
  UNCONFIRMED: "bg-muted text-muted-foreground",
  NO_SHOW: "bg-muted text-muted-foreground",
  ATTENDED_PENDING: "bg-status-in-progress-bg text-status-in-progress",
  RECONCILED: "bg-status-completed-bg text-status-completed",
} as const

export function ExaminationMatrixTable({
  services,
  items,
  totalItems,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  filtered = false,
  onEditRow,
  highlightedRowId = null,
}: ExaminationMatrixTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-xs">
            <thead>
              <tr className="select-none border-b border-border bg-table-header-bg font-semibold text-table-header-fg">
                <th className="w-28 px-3.5 py-3 text-left font-semibold">
                  Mã người khám
                </th>
                <th className="min-w-[150px] px-3.5 py-3 text-left font-semibold">
                  Họ tên
                </th>
                <th className="min-w-[130px] px-3.5 py-3 text-left font-semibold">Đơn vị công tác</th>
                <th className="min-w-[100px] px-3.5 py-3 text-left font-semibold">Lịch khám</th>
                {services.map((service) => (
                  <th
                    key={service.id}
                    className="min-w-[85px] whitespace-nowrap px-3 py-3 text-center font-semibold"
                  >
                    <span className="line-clamp-2 leading-tight">
                      {service.name ?? MISSING_SERVICE_NAME}
                    </span>
                  </th>
                ))}
                <th className="min-w-[150px] px-3.5 py-3 text-left font-semibold">Trạng thái</th>
                {onEditRow && (
                  <th className="sticky right-0 w-24 bg-table-header-bg px-3 py-3 text-center font-semibold">
                    <span className="sr-only">Thao tác</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-table-divider">
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={(onEditRow ? 6 : 5) + services.length}
                    className="py-10 text-center text-xs text-muted-foreground"
                  >
                    {filtered
                      ? "Không tìm thấy người khám phù hợp với điều kiện tìm kiếm."
                      : "Thỏa thuận chưa có người khám trong danh sách."}
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.id}
                    tabIndex={onEditRow ? 0 : undefined}
                    onClick={onEditRow ? () => onEditRow(row) : undefined}
                    onKeyDown={
                      onEditRow
                        ? (event) => {
                            if (event.target !== event.currentTarget) return
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              onEditRow(row)
                            }
                          }
                        : undefined
                    }
                    className={cn(
                      "group border-b border-divider transition-colors hover:bg-hover/50",
                      onEditRow && "cursor-pointer focus-visible:bg-hover/50 focus-visible:outline-none",
                      highlightedRowId === row.id && "bg-status-completed-bg/60"
                    )}
                  >
                    <td className="whitespace-nowrap px-3.5 py-2.5 font-medium text-foreground">
                      {row.participantCode ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 font-medium text-foreground">
                      {row.fullName}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 text-secondary-foreground">
                      {row.departmentName}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 text-secondary-foreground">
                      {row.nextSessionDate
                        ? formatHealthExaminationDate(row.nextSessionDate)
                        : row.lastAttendedDate
                          ? `Đã khám ${formatHealthExaminationDate(row.lastAttendedDate)}`
                          : "Chưa xếp lịch"}
                    </td>
                    {services.map((service) => (
                      <td
                        key={service.id}
                        className="whitespace-nowrap px-3 py-2.5 text-center align-middle"
                      >
                        {isServicePerformed(row, service.id) && (
                          <span
                            title="Đã khám"
                            className="inline-flex select-none items-center justify-center text-sm font-bold text-primary"
                          >
                            X
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-3.5 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                          STATUS_TONES[getExaminationStatus(row)]
                        )}
                      >
                        {getExaminationStatusLabel(row)}
                      </span>
                    </td>
                    {onEditRow && (
                      <td className="sticky right-0 bg-card px-3 py-2 text-center group-hover:bg-hover">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          aria-label={`Cập nhật chi tiết khám của ${row.fullName}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            onEditRow(row)
                          }}
                        >
                          <Pencil />
                          Cập nhật
                        </Button>
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
