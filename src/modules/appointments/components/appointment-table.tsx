"use client"

import * as React from "react"
import {
  Eye,
  Edit,
  UserCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Calendar,
  Building2,
} from "@/shared/ui/product-icon"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AppointmentStatusBadge } from "./appointment-status-badge"
import { Appointment, AppointmentTab } from "../types"
import { cn } from "@/lib/utils"

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
      {/* Top Header of Appointments Table: Title & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border px-5 pt-4 pb-0 gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Danh sách lịch hẹn
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-alt font-medium text-primary">
            {appointments.length}
          </span>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center overflow-x-auto gap-1 -mb-px scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer",
                  isActive
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-secondary-foreground hover:text-foreground hover:border-border"
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-b border-border bg-surface-alt/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên bệnh nhân, SĐT, mã hẹn..."
            className="h-8.5 pl-8.5 pr-3 text-xs bg-card border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Filter className="size-3.5 text-primary shrink-0 hidden sm:block" />

          {/* Type Filter: Cá nhân vs Đơn vị */}
          {onCareProgramChange && (
            <Select
              value={selectedCareProgram}
              onValueChange={(val) => onCareProgramChange(val || "ALL")}
            >
              <SelectTrigger className="h-8.5 text-xs bg-card border-border w-full sm:w-40">
                <SelectValue placeholder="Tất cả đối tượng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả đối tượng</SelectItem>
                <SelectItem value="INDIVIDUAL">Khám cá nhân</SelectItem>
                <SelectItem value="ORGANIZATION_HEALTH_EXAMINATION">Khám đơn vị</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Doctor Filter */}
          <Select
            value={selectedDoctorId}
            onValueChange={(val) => onDoctorChange(val || "ALL")}
          >
            <SelectTrigger className="h-8.5 text-xs bg-card border-border w-full sm:w-40">
              <SelectValue placeholder="Tất cả bác sĩ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả bác sĩ</SelectItem>
              <SelectItem value="doc-01">BS.CKI Trần Văn Minh</SelectItem>
              <SelectItem value="doc-02">BS. Lê Đức Anh</SelectItem>
              <SelectItem value="doc-03">BS. Phạm Quang Huy</SelectItem>
              <SelectItem value="doc-04">BS. Nguyễn Thị Lan</SelectItem>
              <SelectItem value="doc-05">ThS.BS Đỗ Mỹ Linh</SelectItem>
            </SelectContent>
          </Select>

          {/* Exam Type Filter */}
          <Select
            value={selectedExamType}
            onValueChange={(val) => onExamTypeChange(val || "ALL")}
          >
            <SelectTrigger className="h-8.5 text-xs bg-card border-border w-full sm:w-44">
              <SelectValue placeholder="Tất cả loại khám" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại khám</SelectItem>
              <SelectItem value="Khám tổng quát">Khám tổng quát</SelectItem>
              <SelectItem value="Nội tổng quát">Nội tổng quát</SelectItem>
              <SelectItem value="Khám sức khỏe đơn vị">
                Khám sức khỏe đơn vị
              </SelectItem>
              <SelectItem value="Tim mạch">Tim mạch</SelectItem>
              <SelectItem value="Cơ xương khớp">Cơ xương khớp</SelectItem>
              <SelectItem value="Khám da liễu">Khám da liễu</SelectItem>
              <SelectItem value="Hô hấp">Hô hấp</SelectItem>
              <SelectItem value="Nội tiết">Nội tiết</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
              appointments.map((apt) => {
                const bookingChannelBadge =
                  apt.careProgram === "ORGANIZATION_HEALTH_EXAMINATION" ? (
                    <Badge
                      variant="outline"
                      className="bg-selected text-primary border-primary/20 text-[10px] font-medium"
                    >
                      Khám đoàn DN
                    </Badge>
                  ) : apt.bookingChannel === "ONLINE" ? (
                    <Badge
                      variant="outline"
                      className="bg-surface-alt text-primary border-primary/20 text-[10px] font-normal"
                    >
                      Đặt online
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-surface-alt text-secondary-foreground border-border text-[10px] font-normal"
                    >
                      Lễ tân tạo
                    </Badge>
                  )

                return (
                  <TableRow
                    key={apt.id}
                    className="hover:bg-hover/50 border-b border-divider transition-colors"
                  >
                    {/* Giờ */}
                    <TableCell className="font-mono text-xs font-semibold text-foreground text-center px-2 py-3">
                      {apt.time}
                    </TableCell>

                    {/* Bệnh nhân */}
                    <TableCell className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">
                          {apt.patientName}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono text-muted-foreground">
                          <span>{apt.patientCode}</span>
                          <span>•</span>
                          <span>Sinh {apt.birthYear}</span>
                          {apt.participantCode && (
                            <>
                              <span>•</span>
                              <span className="text-primary font-semibold">
                                {apt.participantCode}
                              </span>
                            </>
                          )}
                        </div>
                        {apt.organizationName && (
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-primary">
                            <Building2 className="size-3 shrink-0" />
                            <span className="font-medium break-words leading-tight" title={apt.organizationName}>
                              {apt.organizationName}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Số điện thoại */}
                    <TableCell className="text-xs font-mono text-foreground px-3 py-3">
                      {apt.phoneNumber}
                    </TableCell>

                    {/* Loại khám */}
                    <TableCell className="text-xs text-foreground px-3 py-3">
                      {apt.examinationType}
                    </TableCell>

                    {/* Bác sĩ */}
                    <TableCell className="text-xs font-medium text-foreground px-3 py-3">
                      {apt.physicianName}
                    </TableCell>

                    {/* Phòng */}
                    <TableCell className="text-xs text-secondary-foreground px-3 py-3">
                      {apt.roomName}
                    </TableCell>

                    {/* Nguồn đặt lịch */}
                    <TableCell className="px-2 py-3 text-center">
                      {bookingChannelBadge}
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="px-2 py-3 text-center">
                      <AppointmentStatusBadge status={apt.status} />
                    </TableCell>

                    {/* Thao tác: Căn phải (justify-end), đồng bộ thẳng hàng với header Thao tác */}
                    <TableCell className="w-44 min-w-[170px] pr-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. Nút Tiếp nhận vào khám (nếu đã đến / đã đặt / đã hẹn) */}
                        {(apt.status === "ARRIVED" ||
                          apt.status === "BOOKED" ||
                          apt.status === "CONFIRMED") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCheckInAppointment(apt)}
                            className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer transition-colors "
                            title={`Tiếp nhận vào khám - ${apt.patientName}`}
                            aria-label={`Tiếp nhận vào khám cho ${apt.patientName}`}
                          >
                            <UserCheck className="size-3.5" />
                            <span className="sr-only">Tiếp nhận</span>
                          </Button>
                        )}

                        {/* 2. Nút Xác nhận đã đến (nếu CONFIRMED) */}
                        {apt.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onConfirmArrived(apt)}
                            className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer transition-colors "
                            title={`Xác nhận đã đến - ${apt.patientName}`}
                            aria-label={`Xác nhận đã đến cho ${apt.patientName}`}
                          >
                            <CheckCircle2 className="size-3.5" />
                            <span className="sr-only">Xác nhận đã đến</span>
                          </Button>
                        )}

                        {/* 3. Nút Xem chi tiết */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewAppointment(apt)}
                          className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer transition-colors "
                          title={`Xem chi tiết - ${apt.patientName}`}
                          aria-label={`Xem chi tiết cho ${apt.patientName}`}
                        >
                          <Eye className="size-3.5" />
                          <span className="sr-only">Xem chi tiết</span>
                        </Button>

                        {/* 4. Nút Chỉnh sửa (nếu chưa hủy hoặc đã khám) */}
                        {apt.status !== "CANCELLED" && apt.status !== "EXAMINED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditAppointment(apt)}
                            className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer transition-colors "
                            title={`Chỉnh sửa lịch hẹn - ${apt.patientName}`}
                            aria-label={`Chỉnh sửa cho ${apt.patientName}`}
                          >
                            <Edit className="size-3.5" />
                            <span className="sr-only">Chỉnh sửa</span>
                          </Button>
                        )}

                        {/* 5. Nút Hủy lịch hẹn (nếu chưa hủy hoặc đã khám) */}
                        {apt.status !== "CANCELLED" && apt.status !== "EXAMINED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCancelAppointment(apt)}
                            className="size-7.5 p-0 text-secondary-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 border-border rounded-lg cursor-pointer transition-colors "
                            title={`Hủy lịch hẹn - ${apt.patientName}`}
                            aria-label={`Hủy lịch hẹn cho ${apt.patientName}`}
                          >
                            <XCircle className="size-3.5" />
                            <span className="sr-only">Hủy lịch hẹn</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

