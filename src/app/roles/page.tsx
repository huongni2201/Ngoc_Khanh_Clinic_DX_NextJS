import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { RoleListPage } from "@/modules/accesscontrol"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Vai trò — Ngọc Khánh Clinic",
  description: "Vai trò và nhóm quyền truy cập của Ngọc Khánh Clinic",
}

export default function RolesPage() {
  return (
    <AppShell>
      <Suspense fallback={<ScreenLoadingSkeleton variant="worklist" />}>
        <RoleListPage />
      </Suspense>
    </AppShell>
  )
}
