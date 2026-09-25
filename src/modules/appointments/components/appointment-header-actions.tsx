import * as React from "react"
import { CalendarPlus } from "@/shared/ui/product-icon"
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
    <div className="flex items-center gap-2">
      <Button onClick={onOpenCreateAppointment}>
        <CalendarPlus className="size-4" />
        Tạo lịch hẹn
      </Button>
    </div>
  )
}
