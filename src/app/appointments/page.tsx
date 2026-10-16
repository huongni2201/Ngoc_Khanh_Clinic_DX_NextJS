import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { AppointmentsPage } from "@/widgets/appointment-workspace"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Lịch hẹn — Phòng khám Ngọc Khánh",
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
