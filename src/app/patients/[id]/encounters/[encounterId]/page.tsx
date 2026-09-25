import * as React from "react"
import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { EncounterDetailPage } from "@/modules/patients/pages/encounter-detail-page"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Chi tiết lượt khám — Ngọc Khánh Clinic",
  description: "Chi tiết lượt khám, chẩn đoán, đơn thuốc, cận lâm sàng và tài liệu y tế tại Ngọc Khánh Clinic",
}

export default function EncounterDetailRoute() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        }
      >
        <EncounterDetailPage />
      </Suspense>
    </AppShell>
  )
}
