import type { Metadata } from "next"
import { AppShell } from "@/widgets/app-shell"
import { CatalogAccessBoundary } from "@/modules/catalog"

export const metadata: Metadata = {
  title: "Quản lý danh mục — Phòng khám Ngọc Khánh",
  description: "Quản lý các danh mục khoa, phòng, chuyên khoa, dịch vụ, thuốc",
}

export default function AdminCatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <CatalogAccessBoundary>
        {children}
      </CatalogAccessBoundary>
    </AppShell>
  )
}
