"use client"

import { Calendar } from "@/shared/ui/product-icon"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AppointmentFilterStrip } from "./appointment-table/appointment-filter-strip"
import { AppointmentRow } from "./appointment-table/appointment-row"
import { Appointment, AppointmentTab } from "../types"
import { WorklistTabHeader } from "@/shared/ui/worklist-tab-header"

interface AppointmentTableProps {
  appointments: Appointment[]
  isLoading: boolean
  activeTab: AppointmentTab
  onTabChange: (tab: AppointmentTab) => void
  searchTerm: string
  onSearchChange: (search: string) => void
  selectedDoctorId: string
  onDoctorChange: (physicianId: string) => void
  selectedExamType: string
  onExamTypeChange: (type: string) => void
  selectedCareProgram?: string
  onCareProgramChange?: (program: string) => void
  onViewAppointment: (apt: Appointment) => void
  onEditAppointment: (apt: Appointment) => void
  onConfirmArrived: (apt: Appointment) => void
  onCheckInAppointment: (apt: Appointment) => void
  onCancelAppointment: (apt: Appointment) => void
}

export function AppointmentTable({
  appointments,
  isLoading,
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  selectedDoctorId,
  onDoctorChange,
  selectedExamType,
  onExamTypeChange,
  selectedCareProgram = "ALL",
  onCareProgramChange,
  onViewAppointment,
  onEditAppointment,
  onConfirmArrived,
  onCheckInAppointment,
  onCancelAppointment,
}: AppointmentTableProps) {
  const tabs: { key: AppointmentTab; label: string }[] = [
    { key: "ALL", label: "Tất cả" },
    { key: "TODAY", label: "Hôm nay" },
    { key: "UPCOMING", label: "Sắp tới" },
    { key: "ARRIVED", label: "Đã đến" },
    { key: "EXAMINED", label: "Đã khám" },
    { key: "CANCELLED", label: "Đã hủy" },
  ]

  return (
    <div className="flex flex-col flex-1 rounded-lg border border-border bg-card  overflow-hidden">
      <WorklistTabHeader
        title="Danh sách lịch hẹn"
        count={appointments.length}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <AppointmentFilterStrip
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedDoctorId={selectedDoctorId}
        onDoctorChange={onDoctorChange}
        selectedExamType={selectedExamType}
        onExamTypeChange={onExamTypeChange}
        selectedCareProgram={selectedCareProgram}
        onCareProgramChange={onCareProgramChange}
      />

      {/* Main Table */}
      <div className="flex-1 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-alt/40 hover:bg-surface-alt/40 border-b border-border">
              <TableHead className="w-16 text-[11px] font-semibold text-foreground h-9 px-2 text-center">
                Giờ
              </TableHead>
              <TableHead className="min-w-[170px] text-[11px] font-semibold text-foreground h-9 px-3">
                Bệnh nhân
              </TableHead>
              <TableHead className="w-28 text-[11px] font-semibold text-foreground h-9 px-3">
                Số điện thoại
              </TableHead>
              <TableHead className="min-w-[130px] text-[11px] font-semibold text-foreground h-9 px-3">
                Loại khám
              </TableHead>
              <TableHead className="min-w-[130px] text-[11px] font-semibold text-foreground h-9 px-3">
                Bác sĩ
              </TableHead>
              <TableHead className="min-w-[130px] text-[11px] font-semibold text-foreground h-9 px-3">
                Phòng
              </TableHead>
              <TableHead className="w-28 text-[11px] font-semibold text-foreground h-9 px-2 text-center">
                Nguồn đặt lịch
              </TableHead>
              <TableHead className="w-28 text-[11px] font-semibold text-foreground h-9 px-2 text-center">
                Trạng thái
              </TableHead>
              <TableHead className="w-44 min-w-[170px] text-[11px] font-semibold text-foreground h-9 pr-4 text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-48 text-center text-xs text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải danh sách lịch hẹn...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : appointments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-48 text-center text-xs text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5 py-8">
                    <div className="size-9 rounded-full bg-surface-alt flex items-center justify-center text-muted-foreground mb-1">
                      <Calendar className="size-4" />
                    </div>
                    <p className="font-semibold text-foreground">
                      Không có lịch hẹn nào phù hợp
                    </p>
                    <p className="text-muted-foreground text-[11px] max-w-sm">
                      {searchTerm || selectedDoctorId !== "ALL" || selectedExamType !== "ALL"
                        ? "Không tìm thấy lịch hẹn khớp với bộ lọc hiện tại."
                        : "Chưa có lịch hẹn nào được ghi nhận cho danh mục này."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((apt) => (
                <AppointmentRow
                  key={apt.id}
                  appointment={apt}
                  onViewAppointment={onViewAppointment}
                  onEditAppointment={onEditAppointment}
                  onConfirmArrived={onConfirmArrived}
                  onCheckInAppointment={onCheckInAppointment}
                  onCancelAppointment={onCancelAppointment}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

