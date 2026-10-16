import type { Metadata } from "next"
import { Suspense } from "react"
import { CatalogAccessBoundary, MedicineManagementPage, CATALOG_PERMISSIONS } from "@/modules/catalog"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Quản lý thuốc — Phòng khám Ngọc Khánh",
  description: "Danh mục thuốc, hoạt chất tại phòng khám Ngọc Khánh",
}

export default function AdminMedicinesPage() {
  return (
    <CatalogAccessBoundary permission={CATALOG_PERMISSIONS.MEDICINE_VIEW}>
      <Suspense fallback={<ScreenLoadingSkeleton variant="worklist" />}>
        <MedicineManagementPage />
      </Suspense>
    </CatalogAccessBoundary>
  )
}
