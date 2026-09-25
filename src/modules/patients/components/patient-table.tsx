"use client"

import * as React from "react"
import { Eye, Pencil, ClipboardPlus, UserX, Search, Plus, RotateCcw } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Patient } from "../types"
import {
  formatDisplayDate,
  calculatePatientAge,
  formatPhoneNumber,
  getGenderLabel,
} from "../lib/patient-formatters"
import { cn } from "@/lib/utils"

interface PatientTableProps {
  patients: Patient[]
  isLoading?: boolean
  selectedIds: string[]
  onSelectPatient: (id: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onViewPatient: (patient: Patient) => void
  onEditPatient: (patient: Patient) => void
  onReceivePatient: (patient: Patient) => void
  onCreatePatient: () => void
  onResetFilters?: () => void
  isFiltered?: boolean
  className?: string
}

export function PatientTable({
  patients,
  isLoading = false,
  selectedIds,
  onSelectPatient,
  onSelectAll,
  onViewPatient,
  onEditPatient,
  onReceivePatient,
  onCreatePatient,
  onResetFilters,
  isFiltered = false,
  className,
}: PatientTableProps) {
  const allCurrentPageSelected =
    patients.length > 0 && patients.every((p) => selectedIds.includes(p.id))
  const someSelected =
    patients.some((p) => selectedIds.includes(p.id)) && !allCurrentPageSelected

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-alt/40 hover:bg-surface-alt/40 border-b border-border">
              <TableHead className="w-12 text-center px-3">
                <Skeleton className="size-4 mx-auto rounded" />
              </TableHead>
              <TableHead className="w-28 text-[11px] font-semibold text-foreground h-9 px-3">Mã BN</TableHead>
              <TableHead className="min-w-[180px] text-[11px] font-semibold text-foreground h-9 px-3">Họ và tên</TableHead>
              <TableHead className="w-28 text-[11px] font-semibold text-foreground h-9 px-3">Ngày sinh</TableHead>
              <TableHead className="w-24 text-[11px] font-semibold text-foreground h-9 px-2 text-center">Giới tính</TableHead>
              <TableHead className="w-32 text-[11px] font-semibold text-foreground h-9 px-3">Số điện thoại</TableHead>
              <TableHead className="w-36 text-[11px] font-semibold text-foreground h-9 px-3">Số định danh</TableHead>
              <TableHead className="w-36 text-[11px] font-semibold text-foreground h-9 px-3">Lần khám gần nhất</TableHead>
              <TableHead className="w-36 min-w-[140px] text-[11px] font-semibold text-foreground h-9 pr-4 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={`skeleton-row-${i}`} className="border-table-divider">
                <TableCell className="text-center">
                  <Skeleton className="size-4 mx-auto rounded" />
                </TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Empty state when filtered has 0 results
  if (patients.length === 0 && isFiltered) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xs">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
          <Search className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Không tìm thấy bệnh nhân phù hợp
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Không có bệnh nhân nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại. Thử thay đổi từ khóa hoặc xóa bộ lọc.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          {onResetFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-9 rounded-lg text-xs font-medium"
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Xóa bộ lọc
            </Button>
          )}
          <Button
            size="sm"
            onClick={onCreatePatient}
            className="h-9 rounded-lg text-xs font-semibold"
          >
            <Plus className="mr-1.5 size-3.5" />
            Tạo bệnh nhân mới
          </Button>
        </div>
      </div>
    )
  }

  // Empty state when system has no patients at all
  if (patients.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xs">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
          <UserX className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Chưa có hồ sơ bệnh nhân nào
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Danh bạ bệnh nhân hiện đang trống. Hãy thêm hồ sơ bệnh nhân mới để bắt đầu tiếp đón và quản lý khám bệnh.
        </p>
        <div className="mt-5">
          <Button
            size="sm"
            onClick={onCreatePatient}
            className="h-9 rounded-lg text-xs font-semibold"
          >
            <Plus className="mr-1.5 size-3.5" />
            Tạo bệnh nhân mới
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
          "rounded-xl border border-border bg-card overflow-hidden shadow-xs",
          className
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-alt/40 hover:bg-surface-alt/40 border-b border-border">
              {/* Checkbox column */}
              <TableHead className="w-12 text-center px-3">
                <Checkbox
                  checked={allCurrentPageSelected || someSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  aria-label="Chọn tất cả bệnh nhân trang này"
                />
              </TableHead>

              {/* Data columns */}
              <TableHead className="w-28 text-[11px] font-semibold text-foreground h-9 px-3">
                Mã BN
              </TableHead>
              <TableHead className="min-w-[180px] text-[11px] font-semibold text-foreground h-9 px-3">
                Họ và tên
              </TableHead>
              <TableHead className="w-28 text-[11px] font-semibold text-foreground h-9 px-3">
                Ngày sinh
              </TableHead>
              <TableHead className="w-24 text-[11px] font-semibold text-foreground h-9 px-2 text-center">
                Giới tính
              </TableHead>
              <TableHead className="w-32 text-[11px] font-semibold text-foreground h-9 px-3">
                Số điện thoại
              </TableHead>
              <TableHead className="w-36 text-[11px] font-semibold text-foreground h-9 px-3">
                Số định danh
              </TableHead>
              <TableHead className="w-36 text-[11px] font-semibold text-foreground h-9 px-3">
                Lần khám gần nhất
              </TableHead>
              <TableHead className="w-36 min-w-[140px] text-[11px] font-semibold text-foreground h-9 pr-4 text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {patients.map((patient) => {
              const isSelected = selectedIds.includes(patient.id)
              const age = calculatePatientAge(patient.dateOfBirth, patient.birthYear)
              const dobDisplay = formatDisplayDate(patient.dateOfBirth)
              const lastExamDisplay = formatDisplayDate(patient.lastExamDate)

              return (
                <TableRow
                  key={patient.id}
                  className={cn(
                    "border-b border-divider hover:bg-hover/50 transition-colors group",
                    isSelected ? "bg-selected/60 hover:bg-selected" : ""
                  )}
                >
                  {/* Row Checkbox */}
                  <TableCell className="text-center px-3 py-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onSelectPatient(patient.id, !!checked)}
                      aria-label={`Chọn bệnh nhân ${patient.fullName}`}
                    />
                  </TableCell>

                  {/* Mã BN */}
                  <TableCell className="text-xs font-mono font-medium text-secondary-foreground px-3 py-3">
                    {patient.patientCode}
                  </TableCell>

                  {/* Họ và tên - Clickable navigation */}
                  <TableCell className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onViewPatient(patient)}
                      className="text-xs font-semibold text-primary hover:underline text-left transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring rounded-xs cursor-pointer"
                      title={`Xem hồ sơ của ${patient.fullName}`}
                    >
                      {patient.fullName}
                    </button>
                  </TableCell>

                  {/* Ngày sinh + tuổi */}
                  <TableCell className="px-3 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-foreground font-medium">
                        {dobDisplay}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        ({age} tuổi)
                      </span>
                    </div>
                  </TableCell>

                  {/* Giới tính */}
                  <TableCell className="text-xs text-foreground px-2 py-3 text-center">
                    {getGenderLabel(patient.gender)}
                  </TableCell>

                  {/* Số điện thoại */}
                  <TableCell className="text-xs font-mono text-foreground px-3 py-3">
                    {formatPhoneNumber(patient.phoneNumber)}
                  </TableCell>

                  {/* Số định danh (CCCD/ĐDCN) */}
                  <TableCell className="text-xs font-mono text-secondary-foreground px-3 py-3">
                    {patient.identificationNumber}
                  </TableCell>

                  {/* Lần khám gần nhất */}
                  <TableCell className="text-xs px-3 py-3">
                    {patient.lastExamDate ? (
                      <span className="text-foreground font-medium font-mono">
                        {lastExamDisplay}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">Chưa có</span>
                    )}
                  </TableCell>

                  {/* Thao tác (3 icon buttons căn phải, trung tính sạch đẹp) */}
                  <TableCell className="w-36 min-w-[140px] pr-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Button 1: Xem hồ sơ */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewPatient(patient)}
                        className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer transition-colors shadow-2xs"
                        title={`Xem hồ sơ của ${patient.fullName}`}
                        aria-label={`Xem hồ sơ bệnh nhân ${patient.fullName}`}
                      >
                        <Eye className="size-3.5" />
                        <span className="sr-only">Xem hồ sơ</span>
                      </Button>

                      {/* Button 2: Chỉnh sửa thông tin */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditPatient(patient)}
                        className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer transition-colors shadow-2xs"
                        title={`Chỉnh sửa thông tin của ${patient.fullName}`}
                        aria-label={`Chỉnh sửa thông tin bệnh nhân ${patient.fullName}`}
                      >
                        <Pencil className="size-3.5" />
                        <span className="sr-only">Chỉnh sửa</span>
                      </Button>

                      {/* Button 3: Tiếp nhận bệnh nhân */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReceivePatient(patient)}
                        className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer transition-colors shadow-2xs"
                        title={`Tiếp nhận ${patient.fullName}`}
                        aria-label={`Tiếp nhận bệnh nhân ${patient.fullName}`}
                      >
                        <ClipboardPlus className="size-3.5" />
                        <span className="sr-only">Tiếp nhận</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
  )
}
