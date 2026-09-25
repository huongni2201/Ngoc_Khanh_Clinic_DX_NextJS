import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { AppointmentsPage } from "@/modules/appointments"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Lịch hẹn — Ngọc Khánh Clinic",
  description: "Quản lý lịch hẹn khám bệnh tại Phòng Khám Ngọc Khánh",
}

export default function AppointmentsRoute() {
  return (
    <AppShell>
      <Suspense
        fallback={<ScreenLoadingSkeleton variant="worklist" />}
      >
        <AppointmentsPage />
      </Suspense>
    </AppShell>
  )
}
