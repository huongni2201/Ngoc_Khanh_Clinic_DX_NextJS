import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { RolePermissionsPage } from "@/modules/accesscontrol"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Phân quyền vai trò — Ngọc Khánh Clinic",
  description: "Cấp hoặc gỡ quyền của vai trò tại Ngọc Khánh Clinic",
}

export default function RolePermissionsRoutePage() {
  return (
    <AppShell>
      <Suspense fallback={<ScreenLoadingSkeleton variant="worklist" />}>
        <RolePermissionsPage />
      </Suspense>
    </AppShell>
  )
}
