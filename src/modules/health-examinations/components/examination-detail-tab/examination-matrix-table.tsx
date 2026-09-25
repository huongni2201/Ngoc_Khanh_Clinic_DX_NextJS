"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTablePagination } from "@/shared/ui"
import { ParticipantExaminationProgress, ClinicalServiceColumn } from "../../types"
import { cn } from "@/lib/utils"

interface ExaminationMatrixTableProps {
  categoryColumns: ClinicalServiceColumn[]
  items: ParticipantExaminationProgress[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
}

export function ExaminationMatrixTable({
  categoryColumns,
  items,
  totalItems,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: ExaminationMatrixTableProps) {
  const isAllSelected =
    items.length > 0 && items.every((emp) => selectedIds.includes(emp.id))

  const isSomeSelected =
    items.some((emp) => selectedIds.includes(emp.id)) && !isAllSelected

  // Check if there are any completed exams among current items
  const hasAnyCompleted = items.some(
    (emp) =>
      (emp.completedServiceIds && emp.completedServiceIds.length > 0) ||
      Object.values(emp.examinations || {}).some((st) => st === "COMPLETED")
  )

  return (
    <div className="space-y-4">
      {/* Table Container with Horizontal Scroll */}
      <div className="rounded-lg border border-border bg-card  overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-table-header-bg border-b border-border text-table-header-fg font-semibold select-none">
                {/* 1. Checkbox */}
                <th className="py-3 px-3.5 text-center w-10 sticky left-0 z-20 bg-table-header-bg">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onCheckedChange={() => onToggleSelectAll()}
                    aria-label="Chọn tất cả người khám"
                  />
                </th>

                {/* 2. Mã người khám */}
                <th className="py-3 px-3.5 text-left font-semibold w-24 sticky left-[40px] z-20 bg-table-header-bg">
                  Mã người khám
                </th>

                {/* 3. Họ tên */}
                <th className="py-3 px-3.5 text-left font-semibold min-w-[150px] sticky left-[136px] z-20 bg-table-header-bg border-r border-border/60">
                  Họ tên
                </th>

                {/* 4. Đơn vị công tác */}
                <th className="py-3 px-3.5 text-left font-semibold min-w-[130px]">
                  Đơn vị công tác
                </th>

                {/* Dynamic Examination Columns from Configured Items */}
                {categoryColumns.map((cat) => (
                  <th
                    key={cat.id}
                    className="py-3 px-3 text-center font-semibold whitespace-nowrap min-w-[85px]"
                  >
                    <span className="line-clamp-2 leading-tight">
                      {cat.name}
                    </span>
                  </th>
                ))}

                {/* Ghi chú */}
                <th className="py-3 px-3.5 text-left font-semibold min-w-[110px]">
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-table-divider">
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + categoryColumns.length}
                    className="py-10 text-center text-muted-foreground text-xs"
                  >
                    Không tìm thấy người khám phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                items.map((emp) => {
                  const isSelected = selectedIds.includes(emp.id)

                  return (
                    <tr
                      key={emp.id}
                      data-selected={isSelected}
                      className={cn(
                        "group border-b border-divider transition-colors hover:bg-hover/50",
                        isSelected && "bg-selected hover:bg-hover/70"
                      )}
                    >
                      {/* Checkbox */}
                      <td
                        className={cn(
                          "py-2.5 px-3.5 text-center sticky left-0 z-10 bg-card group-hover:bg-hover/50",
                          isSelected && "bg-selected group-hover:bg-hover/70"
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelect(emp.id)}
                          aria-label={`Chọn người khám ${emp.fullName}`}
                        />
                      </td>

                      {/* Mã người khám */}
                      <td
                        className={cn(
                          "py-2.5 px-3.5 font-medium text-foreground whitespace-nowrap sticky left-[40px] z-10 bg-card group-hover:bg-hover/50",
                          isSelected && "bg-selected group-hover:bg-hover/70"
                        )}
                      >
                        {emp.participantCode}
                      </td>

                      {/* Họ tên */}
                      <td
                        className={cn(
                          "py-2.5 px-3.5 font-medium text-foreground whitespace-nowrap sticky left-[136px] z-10 bg-card group-hover:bg-hover/50 border-r border-border/60",
                          isSelected && "bg-selected group-hover:bg-hover/70"
                        )}
                      >
                        {emp.fullName}
                      </td>

                      {/* Đơn vị công tác */}
                      <td className="py-2.5 px-3.5 text-secondary-foreground whitespace-nowrap">
                        {emp.organizationUnit}
                      </td>

                      {/* Dynamic Examination Matrix Cells */}
                      {categoryColumns.map((cat) => {
                        const isCompleted =
                          emp.examinations?.[cat.id] === "COMPLETED" ||
                          emp.completedServiceIds?.includes(cat.id)

                        return (
                          <td
                            key={cat.id}
                            className="py-2.5 px-3 text-center align-middle whitespace-nowrap"
                          >
                            {isCompleted && (
                              <span className="inline-flex items-center justify-center font-bold text-primary text-sm select-none">
                                X
                              </span>
                            )}
                          </td>
                        )
                      })}

                      {/* Ghi chú Badge */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        {emp.note === "Đủ hồ sơ" ? (
                          <span className="inline-flex items-center rounded-full bg-status-success-bg px-2.5 py-0.5 text-[11px] font-medium text-status-success select-none whitespace-nowrap">
                            Đủ hồ sơ
                          </span>
                        ) : emp.note === "Khám bù" ? (
                          <span className="inline-flex items-center rounded-full bg-status-warning-bg px-2.5 py-0.5 text-[11px] font-medium text-status-warning select-none whitespace-nowrap">
                            Khám bù
                          </span>
                        ) : emp.note === "Thiếu chữ ký" ? (
                          <span className="inline-flex items-center rounded-full bg-status-warning-bg px-2.5 py-0.5 text-[11px] font-medium text-status-warning select-none whitespace-nowrap">
                            Thiếu chữ ký
                          </span>
                        ) : emp.note === "Thiếu CCCD" ? (
                          <span className="inline-flex items-center rounded-full bg-status-warning-bg px-2.5 py-0.5 text-[11px] font-medium text-status-warning select-none whitespace-nowrap">
                            Thiếu CCCD
                          </span>
                        ) : emp.note ? (
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground select-none whitespace-nowrap">
                            {emp.note}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Helper notice if participants exist but no completed exams yet */}
      {items.length > 0 && !hasAnyCompleted && (
        <div className="rounded-lg bg-muted/40 border border-border/80 px-3.5 py-2 text-xs text-muted-foreground text-center">
          Chưa ghi nhận hạng mục khám hoàn thành.
        </div>
      )}

      {/* Pagination */}
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

