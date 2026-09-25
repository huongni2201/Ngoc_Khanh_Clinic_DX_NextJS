import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { OrganizationListPage } from "@/modules/organizations"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Đơn vị — Ngọc Khánh Clinic",
  description: "Danh sách đơn vị đã khám hoặc đang khám tại Ngọc Khánh Clinic",
}

export default function OrganizationsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={<ScreenLoadingSkeleton variant="worklist" />}
      >
        <OrganizationListPage />
      </Suspense>
    </AppShell>
  )
}

