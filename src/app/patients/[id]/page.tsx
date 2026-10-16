import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { PatientDetailPage } from "@/widgets/patient-workspace"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Hồ sơ bệnh nhân — Phòng khám Ngọc Khánh",
  description: "Chi tiết hồ sơ bệnh nhân và lịch sử khám tại Phòng khám Ngọc Khánh",
}

export default function PatientDetailRoute() {
  return (
    <AppShell>
      <Suspense
        fallback={<ScreenLoadingSkeleton variant="detail" />}
      >
        <PatientDetailPage />
      </Suspense>
    </AppShell>
  )
}
