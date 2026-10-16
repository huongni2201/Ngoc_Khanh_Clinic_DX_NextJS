import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { EncounterDetailPage } from "@/widgets/encounter-detail"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Chi tiết lượt khám — Phòng khám Ngọc Khánh",
  description: "Chi tiết lượt khám, chẩn đoán, đơn thuốc, cận lâm sàng và tài liệu y tế tại Phòng khám Ngọc Khánh",
}

export default function EncounterDetailRoute() {
  return (
    <AppShell>
      <Suspense
        fallback={<ScreenLoadingSkeleton variant="encounter" />}
      >
        <EncounterDetailPage />
      </Suspense>
    </AppShell>
  )
}
