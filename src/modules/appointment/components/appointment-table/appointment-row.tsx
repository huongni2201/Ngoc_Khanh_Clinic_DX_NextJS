"use client"

import {
  Eye,
  Edit,
  UserCheck,
  CheckCircle2,
  XCircle,
  Building2,
} from "@/shared/ui/product-icon"
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppointmentStatusBadge } from "../appointment-status-badge"
import type { Appointment } from "../../types"

interface AppointmentRowProps {
  appointment: Appointment
  onViewAppointment: (apt: Appointment) => void
  onEditAppointment: (apt: Appointment) => void
  onConfirmArrived: (apt: Appointment) => void
  onCheckInAppointment: (apt: Appointment) => void
  onCancelAppointment: (apt: Appointment) => void
}

export function AppointmentRow({
  appointment: apt,
  onViewAppointment,
  onEditAppointment,
  onConfirmArrived,
  onCheckInAppointment,
  onCancelAppointment,
}: AppointmentRowProps) {
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
}
