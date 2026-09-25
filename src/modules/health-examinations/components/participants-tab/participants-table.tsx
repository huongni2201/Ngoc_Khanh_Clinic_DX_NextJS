"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, UserCheck, CalendarPlus } from "@/shared/ui/product-icon"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTablePagination } from "@/shared/ui"
import { HealthExaminationParticipant, ParticipantProfileStatus } from "../../types"
import { cn } from "@/lib/utils"

interface ParticipantsTableProps {
  participants: HealthExaminationParticipant[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  batchId?: string
  organizationId?: string
}

function ProfileStatusBadge({ status }: { status: ParticipantProfileStatus }) {
  if (status === "VALID") {
    return (
      <span className="inline-flex items-center rounded-full bg-status-success-bg px-2.5 py-0.5 text-[11px] font-medium text-status-success select-none whitespace-nowrap">
        Đủ hồ sơ
      </span>
    )
  }

  if (status === "MISSING_IDENTIFICATION_NUMBER") {
    return (
      <span className="inline-flex items-center rounded-full bg-status-warning-bg px-2.5 py-0.5 text-[11px] font-medium text-status-warning select-none whitespace-nowrap">
        Thiếu số định danh
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-status-warning-bg px-2.5 py-0.5 text-[11px] font-medium text-status-warning select-none whitespace-nowrap">
      Thiếu chữ ký
    </span>
  )
}

export function ParticipantsTable({
  participants,
  totalItems,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  batchId,
  organizationId,
}: ParticipantsTableProps) {
  const router = useRouter()

  const isAllSelected =
    participants.length > 0 &&
    participants.every((emp) => selectedIds.includes(emp.id))

  const isSomeSelected =
    participants.some((emp) => selectedIds.includes(emp.id)) && !isAllSelected

  return (
    <div className="space-y-4">
      {/* Table Container with Horizontal Scroll */}
      <div className="rounded-lg border border-border bg-card  overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs border-collapse min-w-[1250px]">
            <thead>
              <tr className="bg-table-header-bg border-b border-border text-table-header-fg font-semibold select-none">
                <th className="py-3 px-3.5 text-center w-10">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onCheckedChange={() => onToggleSelectAll()}
                    aria-label="Chọn tất cả người khám"
                  />
                </th>
                <th className="py-3 px-3 text-left font-semibold">Mã người khám</th>
                <th className="py-3 px-3 text-left font-semibold">Họ tên</th>
                <th className="py-3 px-3 text-left font-semibold">Ngày sinh</th>
                <th className="py-3 px-3 text-left font-semibold">Giới tính</th>
                <th className="py-3 px-3 text-left font-semibold">CCCD</th>
                <th className="py-3 px-3 text-left font-semibold">Số điện thoại</th>
                <th className="py-3 px-3 text-left font-semibold">Đơn vị công tác</th>
                <th className="py-3 px-3 text-left font-semibold">Chức vụ</th>
                <th className="py-3 px-3 text-left font-semibold">Địa chỉ</th>
                <th className="py-3 px-3 text-left font-semibold">Trạng thái hồ sơ</th>
                <th className="py-3 px-3 text-left font-semibold">Ghi chú</th>
                <th className="py-3 px-3 text-center font-semibold whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-table-divider">
              {participants.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="py-10 text-center text-muted-foreground text-xs"
                  >
                    Không tìm thấy người khám phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                participants.map((emp) => {
                  const isSelected = selectedIds.includes(emp.id)

                  return (
                    <tr
                      key={emp.id}
                      className={cn(
                        "border-b border-divider transition-colors hover:bg-hover/50",
                        isSelected && "bg-selected hover:bg-hover/70"
                      )}
                    >
                      <td className="py-2.5 px-3.5 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelect(emp.id)}
                          aria-label={`Chọn người khám ${emp.fullName}`}
                        />
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">
                        {emp.participantCode}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">
                        {emp.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.dateOfBirth}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.gender}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.identificationNumber}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.phoneNumber}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.organizationUnit}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.jobTitle}
                      </td>
                      <td className="py-2.5 px-3 text-secondary-foreground whitespace-nowrap">
                        {emp.address}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <ProfileStatusBadge status={emp.profileStatus} />
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        {emp.note || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-alt transition-colors cursor-pointer"
                            aria-label={`Thao tác với người khám ${emp.fullName}`}
                          >
                            <MoreHorizontal className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs">
                            <DropdownMenuItem
                              onClick={() => {
                                const code =
                                  emp.identificationNumber || emp.participantCode || ""
                                router.push(
                                  `/reception?checkinCode=${encodeURIComponent(code)}`
                                )
                              }}
                              className="gap-2 cursor-pointer"
                            >
                              <UserCheck className="size-3.5 text-primary" />
                              <span>Tiếp nhận Lễ tân</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const query = new URLSearchParams({
                                  create: "true",
                                  ...(organizationId ? { organizationId } : {}),
                                  ...(batchId ? { batchId } : {}),
                                  participantCode: emp.participantCode || "",
                                })
                                router.push(`/appointments?${query.toString()}`)
                              }}
                              className="gap-2 cursor-pointer"
                            >
                              <CalendarPlus className="size-3.5 text-primary" />
                              <span>Đặt lịch hẹn</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        entityName="người khám"
      />
    </div>
  )
}



