import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { PaymentWorklistPage } from "@/modules/billing"
import { AppShell } from "@/widgets/app-shell/app-shell"

export const metadata: Metadata = {
  title: "Thanh toán — Ngọc Khánh Clinic",
  description: "Danh sách thu phí và theo dõi thanh toán tại Phòng Khám Ngọc Khánh",
}

export default function BillingRoute() {
  return <AppShell><Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}><PaymentWorklistPage /></Suspense></AppShell>
}
