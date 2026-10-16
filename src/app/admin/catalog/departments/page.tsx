import type { Metadata } from "next"
import { Suspense } from "react"
import { CatalogAccessBoundary, DepartmentManagementPage, CATALOG_PERMISSIONS } from "@/modules/catalog"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Quản lý khoa — Phòng khám Ngọc Khánh",
  description: "Danh mục các khoa tại phòng khám Ngọc Khánh",
}

export default function AdminDepartmentsPage() {
  return (
    <CatalogAccessBoundary permission={CATALOG_PERMISSIONS.DEPARTMENT_VIEW}>
      <Suspense fallback={<ScreenLoadingSkeleton variant="worklist" />}>
        <DepartmentManagementPage />
      </Suspense>
    </CatalogAccessBoundary>
  )
}
