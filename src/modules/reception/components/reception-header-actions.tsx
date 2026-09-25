import * as React from "react"
import {
  UserPlus,
  Search,
  UserCheck,
  Calendar,
} from "lucide-react"
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
    <div className="flex items-center gap-2.5 flex-wrap">
      {/* Primary CTA: Tiếp nhận bệnh nhân */}
      <Button
        onClick={onOpenReceivePatient}
        className="gap-2 h-10 rounded-lg px-4 font-medium text-xs sm:text-sm shadow-xs cursor-pointer"
      >
        <UserCheck className="size-4 stroke-[2]" />
        <span>Tiếp nhận bệnh nhân</span>
      </Button>

      {/* Action: Lịch hẹn hôm nay */}
      {onOpenTodayAppointments && (
        <Button
          variant="outline"
          onClick={onOpenTodayAppointments}
          className="gap-2 h-10 rounded-lg px-3.5 font-medium border-border/80 hover:bg-hover text-foreground text-xs sm:text-sm shadow-2xs cursor-pointer relative"
        >
          <Calendar className="size-4 text-primary stroke-[2]" />
          <span>Lịch hẹn hôm nay</span>
          {todayAppointmentsCount > 0 && (
            <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {todayAppointmentsCount}
            </span>
          )}
        </Button>
      )}

      {/* Secondary Actions: White surface + border */}
      <Button
        variant="outline"
        onClick={onOpenFindPatient}
        className="gap-2 h-10 rounded-lg px-4 font-medium border-border/80 hover:bg-hover text-foreground text-xs sm:text-sm shadow-2xs cursor-pointer"
      >
        <Search className="size-4 text-muted-foreground stroke-[2]" />
        <span>Tìm bệnh nhân</span>
      </Button>

      <Button
        variant="outline"
        onClick={onOpenCreatePatient}
        className="gap-2 h-10 rounded-lg px-4 font-medium border-border/80 hover:bg-hover text-foreground text-xs sm:text-sm shadow-2xs cursor-pointer"
      >
        <UserPlus className="size-4 text-muted-foreground stroke-[2]" />
        <span>Tạo bệnh nhân mới</span>
      </Button>
    </div>
  )
}
