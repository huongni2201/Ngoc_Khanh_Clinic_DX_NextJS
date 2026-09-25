"use client"

import * as React from "react"
import { Eye, Edit, UserCheck, CheckCircle2, Calendar, MapPin, User, Building2 } from "@/shared/ui/product-icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppointmentStatusBadge } from "./appointment-status-badge"
import { Appointment } from "../types"

interface AppointmentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment | null
  onEdit?: (apt: Appointment) => void
  onConfirmArrived?: (apt: Appointment) => void
  onCheckIn?: (apt: Appointment) => void
}

export function AppointmentDetailDialog({
  open,
  onOpenChange,
  appointment,
  onEdit,
  onConfirmArrived,
  onCheckIn,
}: AppointmentDetailDialogProps) {
  if (!appointment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl w-full p-0 gap-0 overflow-hidden bg-card border-border sm:rounded-lg">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-surface-alt flex items-center justify-center text-primary">
                <Eye className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  Chi tiết lịch hẹn
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-mono">
                  {appointment.appointmentCode}
                </DialogDescription>
              </div>
            </div>

            <AppointmentStatusBadge status={appointment.status} />
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column (5 cols): Patient Profile */}
            <div className="md:col-span-5 space-y-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Thông tin người bệnh
              </span>
              <div className="p-4 rounded-lg border border-border bg-surface-alt/50 space-y-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {appointment.patientName}
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-card text-primary font-mono text-[10px]"
                    >
                      {appointment.patientCode}
                    </Badge>
                  </div>
                  <div className="text-xs text-secondary-foreground pt-1 space-y-1">
                    <div>
                      SĐT: <strong className="text-foreground">{appointment.phoneNumber}</strong>
                    </div>
                    <div>
                      Năm sinh: <strong className="text-foreground">{appointment.birthYear}</strong>
                    </div>
                  </div>
                </div>

                {appointment.organizationName && (
                  <div className="pt-2 border-t border-border/60 space-y-1 text-xs">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                      <Building2 className="size-3 shrink-0" />
                      <span>Thông tin đơn vị</span>
                    </div>
                    <div className="space-y-0.5 text-secondary-foreground">
                      <div>
                        Đơn vị: <strong className="text-foreground">{appointment.organizationName}</strong>
                      </div>
                      {appointment.healthExaminationBatchName && (
                        <div>
                          Đợt khám: <span className="text-foreground">{appointment.healthExaminationBatchName}</span>
                        </div>
                      )}
                      {appointment.participantCode && (
                        <div>
                          Mã người khám: <strong className="font-mono text-primary">{appointment.participantCode}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Kênh đặt hẹn:</span>
                  <Badge
                    variant="outline"
                    className="bg-card text-secondary-foreground text-[10px]"
                  >
                    {appointment.careProgram === "ORGANIZATION_HEALTH_EXAMINATION"
                      ? "Khám đoàn DN"
                      : appointment.bookingChannel === "ONLINE"
                      ? "Đặt online"
                      : "Lễ tân tạo"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Schedule Info */}
            <div className="md:col-span-7 space-y-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Chi tiết lịch khám
              </span>
              <div className="border border-border rounded-lg p-4 space-y-2.5 bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>Thời gian hẹn:</span>
                  </div>
                  <span className="font-semibold text-foreground font-mono">
                    {appointment.time} — {appointment.date}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-muted-foreground">Loại khám:</span>
                  <span className="font-semibold text-foreground">
                    {appointment.examinationType}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="size-3.5" />
                    <span>Bác sĩ phụ trách:</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {appointment.physicianName}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5" />
                    <span>Phòng khám:</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {appointment.roomName}
                  </span>
                </div>

                {appointment.notes && (
                  <div className="pt-1">
                    <span className="text-muted-foreground block mb-1">Ghi chú:</span>
                    <p className="text-foreground bg-surface-alt/50 p-2.5 rounded-lg text-xs italic border border-border/60">
                      {appointment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t border-border bg-card flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Đóng
          </Button>

          <div className="flex items-center gap-2">
            {onEdit && appointment.status !== "CANCELLED" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onEdit(appointment)
                }}
                className="gap-1.5 text-xs"
              >
                <Edit className="size-3.5 text-status-warning" />
                Chỉnh sửa
              </Button>
            )}

            {onConfirmArrived && appointment.status === "CONFIRMED" && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onConfirmArrived(appointment)
                }}
                className="gap-1.5 text-xs bg-status-success hover:bg-status-success/90 text-white"
              >
                <CheckCircle2 className="size-3.5" />
                Xác nhận đến
              </Button>
            )}

            {onCheckIn &&
              (appointment.status === "ARRIVED" ||
                appointment.status === "CONFIRMED" ||
                appointment.status === "BOOKED") && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false)
                    onCheckIn(appointment)
                  }}
                  className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  <UserCheck className="size-3.5" />
                  Tiếp nhận
                </Button>
              )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

