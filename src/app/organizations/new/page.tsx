import { Metadata } from "next"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { OrganizationCreatePage } from "@/modules/organizations/pages/organization-create-page"

export const metadata: Metadata = {
  title: "Thêm đơn vị mới — Ngọc Khánh Clinic",
  description: "Tạo mới đơn vị tham gia khám sức khỏe tại Ngọc Khánh Clinic",
}

export default function NewOrganizationPage() {
  return (
    <AppShell>
      <OrganizationCreatePage />
    </AppShell>
  )
}
