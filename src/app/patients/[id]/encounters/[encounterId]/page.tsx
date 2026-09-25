import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { EncounterDetailPage } from "@/modules/encounters/pages/encounter-detail-page"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Chi tiết lượt khám — Ngọc Khánh Clinic",
  description: "Chi tiết lượt khám, chẩn đoán, đơn thuốc, cận lâm sàng và tài liệu y tế tại Ngọc Khánh Clinic",
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
