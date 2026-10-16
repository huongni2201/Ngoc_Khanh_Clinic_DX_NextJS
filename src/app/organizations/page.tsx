import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { OrganizationListPage } from "@/modules/healthexamination"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Đơn vị — Phòng khám Ngọc Khánh",
  description: "Danh sách đơn vị đã khám hoặc đang khám tại Phòng khám Ngọc Khánh",
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

