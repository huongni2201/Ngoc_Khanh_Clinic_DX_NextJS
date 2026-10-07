"use client"

import { DataTablePagination } from "@/shared/ui"
import { cn } from "@/lib/utils"
import type { ExaminationDetailRow, HealthExaminationBatchService } from "../../types"
import { MISSING_SERVICE_NAME } from "../../utils/batch-form-values"
import {
  getExaminationStatus,
  getExaminationStatusLabel,
  isServicePerformed,
} from "../../utils/examination-detail-labels"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"

interface ExaminationMatrixTableProps {
  /** The columns: the services of the batch, in display order. */
  services: HealthExaminationBatchService[]
  items: ExaminationDetailRow[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  /** True when a filter or search is active, which only changes the empty message. */
  filtered?: boolean
}

const STATUS_TONES = {
  UNCONFIRMED: "bg-muted text-muted-foreground",
  ABSENT: "bg-muted text-muted-foreground",
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
  filtered = false,
}: ExaminationMatrixTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-xs">
            <thead>
              <tr className="select-none border-b border-border bg-table-header-bg font-semibold text-table-header-fg">
                <th className="sticky left-0 z-20 w-28 bg-table-header-bg px-3.5 py-3 text-left font-semibold">
                  Mã người khám
                </th>
                <th className="sticky left-[112px] z-20 min-w-[150px] border-r border-border/60 bg-table-header-bg px-3.5 py-3 text-left font-semibold">
                  Họ tên
                </th>
                <th className="min-w-[130px] px-3.5 py-3 text-left font-semibold">Đơn vị công tác</th>
                <th className="min-w-[100px] px-3.5 py-3 text-left font-semibold">Ngày khám</th>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-table-divider">
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + services.length}
                    className="py-10 text-center text-xs text-muted-foreground"
                  >
                    {filtered
                      ? "Không tìm thấy người khám phù hợp với điều kiện tìm kiếm."
                      : "Đợt khám chưa có người khám trong danh sách."}
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.id}
                    className="group border-b border-divider transition-colors hover:bg-hover/50"
                  >
                    <td className="sticky left-0 z-10 whitespace-nowrap bg-card px-3.5 py-2.5 font-medium text-foreground group-hover:bg-hover/50">
                      {row.participantCode ?? "—"}
                    </td>
                    <td className="sticky left-[112px] z-10 whitespace-nowrap border-r border-border/60 bg-card px-3.5 py-2.5 font-medium text-foreground group-hover:bg-hover/50">
                      {row.fullName}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 text-secondary-foreground">
                      {row.departmentName}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 text-secondary-foreground">
                      {formatHealthExaminationDate(row.actualExaminationDate ?? row.examinationDate)}
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
