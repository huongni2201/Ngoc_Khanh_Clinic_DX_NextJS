import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { DoctorWorklistPage } from "@/widgets/doctor"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Danh sách lượt khám — Bác sĩ — Phòng khám Ngọc Khánh",
  description: "Theo dõi bệnh nhân đang chờ, đang khám và tiến độ xử lý trong ngày tại Phòng khám Ngọc Khánh",
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
