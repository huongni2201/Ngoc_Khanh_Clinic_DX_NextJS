import * as React from "react"
import {
  UserPlus,
  Search,
  UserCheck,
  Calendar,
} from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"

interface ReceptionHeaderActionsProps {
  onOpenReceivePatient: () => void
  onOpenFindPatient: () => void
  onOpenCreatePatient: () => void
  onOpenTodayAppointments?: () => void
  todayAppointmentsCount?: number
}

export function ReceptionHeaderActions({
  onOpenReceivePatient,
  onOpenFindPatient,
  onOpenCreatePatient,
  onOpenTodayAppointments,
  todayAppointmentsCount = 0,
}: ReceptionHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onOpenTodayAppointments && (
        <Button
          variant="outline"
          onClick={onOpenTodayAppointments}
        >
          <Calendar className="size-4" />
          Lịch hẹn hôm nay
          {todayAppointmentsCount > 0 && (
            <span aria-label={`${todayAppointmentsCount} lịch chờ xử lý`}>
              ({todayAppointmentsCount})
            </span>
          )}
        </Button>
      )}

      <Button
        variant="outline"
        onClick={onOpenFindPatient}
      >
        <Search className="size-4" />
        Tìm bệnh nhân
      </Button>

      <Button
        variant="outline"
        onClick={onOpenCreatePatient}
      >
        <UserPlus className="size-4" />
        Tạo bệnh nhân mới
      </Button>

      <Button onClick={onOpenReceivePatient}>
        <UserCheck className="size-4" />
        Tiếp nhận bệnh nhân
      </Button>
    </div>
  )
}
