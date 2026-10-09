import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { DoctorWorklistPage } from "@/widgets/doctor"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Danh sách lượt khám — Bác sĩ — Ngọc Khánh Clinic",
  description: "Theo dõi bệnh nhân đang chờ, đang khám và tiến độ xử lý trong ngày tại Ngọc Khánh Clinic",
}

export default function DoctorRoute() {
  return (
    <AppShell>
      <Suspense
        fallback={<ScreenLoadingSkeleton variant="worklist" />}
      >
        <DoctorWorklistPage />
      </Suspense>
    </AppShell>
  )
}
