"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTablePagination } from "@/shared/ui"
import { EmployeeMatrixItem } from "../../types"
import { cn } from "@/lib/utils"

interface ExaminationMatrixTableProps {
  items: EmployeeMatrixItem[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
}

interface MatrixCategoryColumn {
  id: string
  label: string
}

const MATRIX_CATEGORIES: MatrixCategoryColumn[] = [
  { id: "item-kntq", label: "Khám nội" },
  { id: "item-xnm", label: "XN máu" },
  { id: "item-xnnt", label: "XN nước tiểu" },
  { id: "item-saob", label: "Siêu âm" },
  { id: "item-xqp", label: "X-quang" },
  { id: "item-km", label: "Khám mắt" },
  { id: "item-tmh", label: "TMH" },
]

export function ExaminationMatrixTable({
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

  return (
    <div className="space-y-4">
      {/* Table Container with Horizontal Scroll */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-table-header-bg border-b border-border text-table-header-fg font-semibold select-none">
                <th className="py-3 px-3.5 text-center w-10">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onCheckedChange={() => onToggleSelectAll()}
                    aria-label="Chọn tất cả nhân sự"
                  />
                </th>
                <th className="py-3 px-3.5 text-left font-semibold w-24">Mã NV</th>
                <th className="py-3 px-3.5 text-left font-semibold min-w-[150px]">Họ tên</th>
                <th className="py-3 px-3.5 text-left font-semibold min-w-[130px]">Phòng ban</th>

                {/* 7 Examination Matrix Categories */}
                {MATRIX_CATEGORIES.map((cat) => (
                  <th
                    key={cat.id}
                    className="py-3 px-3 text-center font-semibold whitespace-nowrap min-w-[85px]"
                  >
                    {cat.label}
                  </th>
                ))}

                <th className="py-3 px-3.5 text-left font-semibold min-w-[100px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-table-divider">
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="py-10 text-center text-muted-foreground text-xs"
                  >
                    Không tìm thấy nhân sự phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                items.map((emp) => {
                  const isSelected = selectedIds.includes(emp.id)

                  return (
                    <tr
                      key={emp.id}
                      className={cn(
                        "transition-colors hover:bg-muted/40",
                        isSelected && "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <td className="py-2.5 px-3.5 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelect(emp.id)}
                          aria-label={`Chọn nhân sự ${emp.fullName}`}
                        />
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-foreground whitespace-nowrap">
                        {emp.employeeCode}
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-foreground whitespace-nowrap">
                        {emp.fullName}
                      </td>
                      <td className="py-2.5 px-3.5 text-secondary-foreground whitespace-nowrap">
                        {emp.department}
                      </td>

                      {/* 7 Categories Matrix Cells */}
                      {MATRIX_CATEGORIES.map((cat) => {
                        const hasCompleted = emp.completedItemIds.includes(cat.id)

                        return (
                          <td
                            key={cat.id}
                            className="py-2.5 px-3 text-center align-middle whitespace-nowrap"
                          >
                            {hasCompleted ? (
                              <span className="inline-flex items-center justify-center font-bold text-primary text-sm select-none">
                                X
                              </span>
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )}
                          </td>
                        )
                      })}

                      <td className="py-2.5 px-3.5 text-muted-foreground whitespace-nowrap">
                        {emp.note || "—"}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <DataTablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={onPageChange}
        entityName="nhân sự"
      />
    </div>
  )
}
