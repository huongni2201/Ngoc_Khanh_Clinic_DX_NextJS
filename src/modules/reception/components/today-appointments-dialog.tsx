"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search,
  Building2,
  UserCheck,
  ExternalLink,
  Clock,
  Filter,
} from "@/shared/ui/product-icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useAppointments,
  Appointment,
  AppointmentStatusBadge,
} from "@/modules/appointments"

interface TodayAppointmentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckInAppointment: (appointment: Appointment) => void
}

export function TodayAppointmentsDialog({
  open,
  onOpenChange,
  onCheckInAppointment,
}: TodayAppointmentsDialogProps) {
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL")
  const [statusFilter, setStatusFilter] = React.useState<string>("PENDING")

  const { data: appointments = [], isLoading } = useAppointments({
    tab: "TODAY",
  })

  // Filter appointments
  const filteredAppointments = React.useMemo(() => {
    return appointments.filter((apt) => {
      // Status filter
      if (statusFilter === "PENDING") {
        if (
          apt.status !== "BOOKED" &&
          apt.status !== "CONFIRMED" &&
          apt.status !== "ARRIVED"
        ) {
          return false
        }
      } else if (statusFilter === "CHECKED_IN") {
        if (apt.status !== "CHECKED_IN") return false
      }

      // Type filter
      if (typeFilter !== "ALL") {
        if (apt.careProgram !== typeFilter) return false
      }

      // Search term
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchName = apt.patientName.toLowerCase().includes(q)
        const matchCode = apt.patientCode.toLowerCase().includes(q)
        const matchPhone = apt.phoneNumber.includes(q)
        const matchAppt = apt.appointmentCode.toLowerCase().includes(q)
        const matchCompany = apt.organizationName?.toLowerCase().includes(q) || false
        const matchParticipantCode =
          apt.participantCode?.toLowerCase().includes(q) || false
        if (
          !matchName &&
          !matchCode &&
          !matchPhone &&
          !matchAppt &&
          !matchCompany &&
          !matchParticipantCode
        ) {
          return false
        }
      }

      return true
    })
  }, [appointments, search, typeFilter, statusFilter])

  const pendingCount = appointments.filter(
    (a) =>
      a.status === "BOOKED" ||
      a.status === "CONFIRMED" ||
      a.status === "ARRIVED"
  ).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl md:max-w-6xl lg:max-w-[1200px] w-full max-w-[calc(100%-2rem)] p-6 max-h-[90vh] flex flex-col gap-0 rounded-lg shadow-xl overflow-hidden bg-card border-border">
        {/* Header */}
        <DialogHeader className="pb-4 shrink-0 text-left border-b border-border/80">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Lịch hẹn hôm nay</span>
                <Badge
                  variant="outline"
                  className="bg-selected text-primary border-primary/20 text-xs font-semibold px-2 py-0.5"
                >
                  {pendingCount} chờ tiếp nhận
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Danh sách người bệnh có lịch hẹn khám hôm nay — Tiếp nhận trực tiếp vào luồng khám
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar & Filters */}
        <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border/80">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-primary pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên BN, SĐT, mã hẹn, công ty..."
              className="h-8.5 pl-8.5 pr-3 text-xs bg-card border-border"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <Filter className="size-3.5 text-primary shrink-0 hidden sm:block" />

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
              <SelectTrigger className="h-8.5 text-xs bg-card border-border w-full sm:w-36">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Chờ tiếp nhận</SelectItem>
                <SelectItem value="CHECKED_IN">Đã tiếp nhận</SelectItem>
                <SelectItem value="ALL">Tất cả hôm nay</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(val) => val && setTypeFilter(val)}>
              <SelectTrigger className="h-8.5 text-xs bg-card border-border w-full sm:w-38">
                <SelectValue placeholder="Đối tượng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả đối tượng</SelectItem>
                <SelectItem value="INDIVIDUAL">Khám cá nhân</SelectItem>
                <SelectItem value="ORGANIZATION">Khám đơn vị</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-y-auto min-h-0 py-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-alt/40 border-b border-border">
                <TableHead className="w-20 text-[11px] font-semibold text-foreground h-9 px-3 text-center">
                  Giờ hẹn
                </TableHead>
                <TableHead className="min-w-[220px] text-[11px] font-semibold text-foreground h-9 px-3">
                  Người bệnh / Đơn vị
                </TableHead>
                <TableHead className="w-28 text-[11px] font-semibold text-foreground h-9 px-3">
                  Số điện thoại
                </TableHead>
                <TableHead className="min-w-[140px] text-[11px] font-semibold text-foreground h-9 px-3">
                  Loại khám
                </TableHead>
                <TableHead className="min-w-[160px] text-[11px] font-semibold text-foreground h-9 px-3">
                  Bác sĩ / Phòng
                </TableHead>
                <TableHead className="w-32 text-[11px] font-semibold text-foreground h-9 px-3 text-center">
                  Trạng thái
                </TableHead>
                <TableHead className="w-32 text-[11px] font-semibold text-foreground h-9 pr-4 pl-2 text-right">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-40 text-center text-xs text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải danh sách lịch hẹn hôm nay...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-40 text-center text-xs text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5 py-6">
                      <Clock className="size-7 text-muted-foreground opacity-60" />
                      <p className="font-semibold text-foreground">
                        Không có lịch hẹn nào phù hợp
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {statusFilter === "PENDING"
                          ? "Hiện không còn lịch hẹn nào chưa tiếp nhận cho hôm nay."
                          : "Không tìm thấy lịch hẹn khớp với bộ lọc."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((apt) => {
                  const isPendingCheckin =
                    apt.status === "BOOKED" ||
                    apt.status === "CONFIRMED" ||
                    apt.status === "ARRIVED"

                  return (
                    <TableRow
                      key={apt.id}
                      className="hover:bg-hover/50 border-b border-border/60 transition-colors"
                    >
                      {/* Giờ hẹn */}
                      <TableCell className="font-mono text-xs font-bold text-foreground text-center px-3 py-2.5">
                        {apt.time}
                      </TableCell>

                      {/* Người bệnh / Đơn vị */}
                      <TableCell className="px-3 py-2.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">
                            {apt.patientName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
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
                            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-primary">
                              <Building2 className="size-3 shrink-0" />
                              <span className="font-medium break-words leading-tight" title={apt.organizationName}>
                                {apt.organizationName}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* SĐT */}
                      <TableCell className="text-xs font-mono font-medium text-foreground px-3 py-2.5">
                        {apt.phoneNumber}
                      </TableCell>

                      {/* Loại khám */}
                      <TableCell className="text-xs text-foreground px-3 py-2.5">
                        {apt.examinationType}
                      </TableCell>

                      {/* Bác sĩ / Phòng */}
                      <TableCell className="text-xs text-secondary-foreground px-3 py-2.5">
                        <div className="font-medium text-foreground">
                          {apt.physicianName}
                        </div>
                        <div className="text-[11px] text-muted-foreground break-words leading-tight">
                          {apt.roomName}
                        </div>
                      </TableCell>

                      {/* Trạng thái */}
                      <TableCell className="px-3 py-2.5 text-center">
                        <AppointmentStatusBadge status={apt.status} />
                      </TableCell>

                      {/* Thao tác: Căn phải (justify-end) */}
                      <TableCell className="px-3 py-2.5 pr-4 text-right">
                        <div className="flex items-center justify-end">
                          {isPendingCheckin ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                onOpenChange(false)
                                onCheckInAppointment(apt)
                              }}
                              className="gap-1.5 h-7 px-2.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium  cursor-pointer"
                            >
                              <UserCheck className="size-3.5" />
                              <span>Tiếp nhận</span>
                            </Button>
                          ) : apt.status === "CHECKED_IN" ? (
                            <Badge
                              variant="outline"
                              className="text-status-success bg-status-success-bg border-status-success/30 text-[10px]"
                            >
                              Đã tiếp nhận
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
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

        {/* Footer */}
        <DialogFooter className="pt-4 mt-2 shrink-0 border-t border-border flex items-center justify-between gap-3">
          <Link href="/appointments" onClick={() => onOpenChange(false)}>
            <Button
              type="button"
              variant="ghost"
              className="gap-2 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium text-primary hover:text-primary hover:bg-hover rounded-lg cursor-pointer"
            >
              <ExternalLink className="size-4" />
              <span>Xem toàn bộ màn Lịch hẹn</span>
            </Button>
          </Link>

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium border-border/80 hover:bg-hover rounded-lg  cursor-pointer"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

