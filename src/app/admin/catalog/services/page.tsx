import type { Metadata } from "next"
import { Suspense } from "react"
import { CatalogAccessBoundary, ServiceManagementPage, CATALOG_PERMISSIONS } from "@/modules/catalog"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Quản lý dịch vụ — Phòng khám Ngọc Khánh",
  description: "Danh mục dịch vụ khám, cận lâm sàng tại phòng khám Ngọc Khánh",
}

export default function AdminServicesPage() {
  return (
    <CatalogAccessBoundary permission={CATALOG_PERMISSIONS.SERVICE_VIEW}>
      <Suspense fallback={<ScreenLoadingSkeleton variant="worklist" />}>
        <ServiceManagementPage />
      </Suspense>
    </CatalogAccessBoundary>
  )
}
