import type { Metadata } from "next"
import { Suspense } from "react"
import { PaymentWorklistPage } from "@/modules/billing"
import { ScreenLoadingSkeleton } from "@/shared/ui"
import { AppShell } from "@/widgets/app-shell"

export const metadata: Metadata = {
  title: "Thanh toán — Phòng khám Ngọc Khánh",
  description: "Danh sách thu phí và theo dõi thanh toán tại Phòng Khám Ngọc Khánh",
}

export default function BillingRoute() {
  return (
    <AppShell>
      <Suspense fallback={<ScreenLoadingSkeleton variant="worklist" />}>
        <PaymentWorklistPage />
      </Suspense>
    </AppShell>
  )
}
