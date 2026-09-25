import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { ReceptionPage } from "@/modules/reception"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Lễ tân — Ngọc Khánh Clinic",
  description: "Bàn tiếp đón và điều phối bệnh nhân tại Phòng Khám Ngọc Khánh",
}

export default function ReceptionRoute() {
  return (
    <AppShell>
      <Suspense
        fallback={<ScreenLoadingSkeleton variant="worklist" />}
      >
        <ReceptionPage />
      </Suspense>
    </AppShell>
  )
}
