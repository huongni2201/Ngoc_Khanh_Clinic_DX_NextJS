import * as React from "react"
import { CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppointmentHeaderActionsProps {
  onOpenCreateAppointment: () => void
  onOpenFindPatient?: () => void
  onOpenCreatePatient?: () => void
}

export function AppointmentHeaderActions({
  onOpenCreateAppointment,
}: AppointmentHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Primary CTA: Tạo lịch hẹn */}
      <Button
        onClick={onOpenCreateAppointment}
        className="gap-2 h-10 rounded-lg px-4 font-medium text-xs sm:text-sm shadow-xs cursor-pointer"
      >
        <CalendarPlus className="size-4 stroke-[2]" />
        <span>Tạo lịch hẹn</span>
      </Button>
    </div>
  )
}
