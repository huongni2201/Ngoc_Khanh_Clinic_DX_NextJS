import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { PatientsPage } from "@/widgets/patient-workspace"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Danh sách bệnh nhân — Ngọc Khánh Clinic",
  description: "Quản lý thông tin hồ sơ bệnh nhân của Phòng Khám Ngọc Khánh",
}

export default function PatientsRoute() {
  return (
    <AppShell>
      <Suspense
        fallback={<ScreenLoadingSkeleton variant="worklist" />}
      >
        <PatientsPage />
      </Suspense>
    </AppShell>
  )
}
