"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTablePagination } from "@/shared/ui"
import { EmployeeInBatch, EmployeeProfileStatus } from "../../types"
import { cn } from "@/lib/utils"

interface EmployeesTableProps {
  employees: EmployeeInBatch[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
}

function ProfileStatusBadge({ status }: { status: EmployeeProfileStatus }) {
  if (status === "VALID") {
    return (
      <span className="inline-flex items-center rounded-full bg-status-success-bg px-2.5 py-0.5 text-[11px] font-medium text-status-success select-none whitespace-nowrap">
        Đủ hồ sơ
      </span>
    )
  }

  if (status === "MISSING_CCCD") {
    return (
      <span className="inline-flex items-center rounded-full bg-status-warning-bg px-2.5 py-0.5 text-[11px] font-medium text-status-warning select-none whitespace-nowrap">
        Thiếu CCCD
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-status-warning-bg px-2.5 py-0.5 text-[11px] font-medium text-status-warning select-none whitespace-nowrap">
      Thiếu chữ ký
    </span>
  )
}

export function EmployeesTable({
  employees,
  totalItems,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: EmployeesTableProps) {
  const isAllSelected =
    employees.length > 0 &&
    employees.every((emp) => selectedIds.includes(emp.id))

  const isSomeSelected =
    employees.some((emp) => selectedIds.includes(emp.id)) && !isAllSelected

  return (
    <div className="space-y-4">
      {/* Table Container with Horizontal Scroll */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs border-collapse min-w-[1250px]">
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
                <th className="py-3 px-3 text-left font-semibold">Mã NV</th>
                <th className="py-3 px-3 text-left font-semibold">Họ tên</th>
                <th className="py-3 px-3 text-left font-semibold">Ngày sinh</th>
                <th className="py-3 px-3 text-left font-semibold">Giới tính</th>
                <th className="py-3 px-3 text-left font-semibold">CCCD</th>
                <th className="py-3 px-3 text-left font-semibold">Số điện thoại</th>
                <th className="py-3 px-3 text-left font-semibold">Phòng ban</th>
                <th className="py-3 px-3 text-left font-semibold">Chức vụ</th>
                <th className="py-3 px-3 text-left font-semibold">Địa chỉ</th>
                <th className="py-3 px-3 text-left font-semibold">Ngày vào làm</th>
                <th className="py-3 px-3 text-left font-semibold">Loại HĐ</th>
                <th className="py-3 px-3 text-left font-semibold">Trạng thái hồ sơ</th>
                <th className="py-3 px-3 text-left font-semibold">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-table-divider">
              {employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="py-10 text-center text-muted-foreground text-xs"
                  >
                    Không tìm thấy nhân sự phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
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
                      <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">
                        {emp.employeeCode}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">
                        {emp.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.dob}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.gender}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.cccd}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.phone}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.department}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.jobTitle}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.address}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.joinDate}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.contractType}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <ProfileStatusBadge status={emp.profileStatus} />
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
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

      {/* Reusable Pagination */}
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
