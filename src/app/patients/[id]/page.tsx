import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { PatientDetailPage } from "@/modules/patients/pages/patient-detail-page"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Hồ sơ bệnh nhân — Ngọc Khánh Clinic",
  description: "Chi tiết hồ sơ bệnh nhân và lịch sử khám tại Ngọc Khánh Clinic",
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
