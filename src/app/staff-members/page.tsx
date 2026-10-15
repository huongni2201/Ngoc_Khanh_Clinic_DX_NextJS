import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { StaffMemberListPage } from "@/modules/accesscontrol"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Nhân viên — Ngọc Khánh Clinic",
  description: "Hồ sơ nhân viên và tài khoản đăng nhập của Ngọc Khánh Clinic",
}

export default function StaffMembersPage() {
  return (
    <AppShell>
      <Suspense fallback={<ScreenLoadingSkeleton variant="worklist" />}>
        <StaffMemberListPage />
      </Suspense>
    </AppShell>
  )
}
