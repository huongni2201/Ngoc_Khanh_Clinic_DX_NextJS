import { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/widgets/app-shell"
import { UserAccountCreatePage } from "@/modules/accesscontrol"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Tạo tài khoản người dùng — Ngọc Khánh Clinic",
  description: "Cấp tài khoản đăng nhập cho nhân viên hoặc bệnh nhân đã có hồ sơ",
}

export default function NewUserAccountPage() {
  return (
    <AppShell>
      <Suspense fallback={<ScreenLoadingSkeleton variant="detail" />}>
        <UserAccountCreatePage />
      </Suspense>
    </AppShell>
  )
}
