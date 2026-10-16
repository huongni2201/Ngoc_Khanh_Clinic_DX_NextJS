import type { Metadata } from "next"
import { Suspense } from "react"
import { CatalogAccessBoundary, SpecialtyManagementPage, CATALOG_PERMISSIONS } from "@/modules/catalog"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Quản lý chuyên khoa — Phòng khám Ngọc Khánh",
  description: "Danh mục các chuyên khoa tại phòng khám Ngọc Khánh",
}

export default function AdminSpecialtiesPage() {
  return (
    <CatalogAccessBoundary permission={CATALOG_PERMISSIONS.SPECIALTY_VIEW}>
      <Suspense fallback={<ScreenLoadingSkeleton variant="worklist" />}>
        <SpecialtyManagementPage />
      </Suspense>
    </CatalogAccessBoundary>
  )
}
