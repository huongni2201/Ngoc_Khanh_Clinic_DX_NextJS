import type { Metadata } from "next"
import { Suspense } from "react"
import { CatalogAccessBoundary, RoomManagementPage, CATALOG_PERMISSIONS } from "@/modules/catalog"
import { ScreenLoadingSkeleton } from "@/shared/ui"

export const metadata: Metadata = {
  title: "Quản lý phòng — Phòng khám Ngọc Khánh",
  description: "Danh mục các phòng tại phòng khám Ngọc Khánh",
}

export default function AdminRoomsPage() {
  return (
    <CatalogAccessBoundary permission={CATALOG_PERMISSIONS.ROOM_VIEW}>
      <Suspense fallback={<ScreenLoadingSkeleton variant="worklist" />}>
        <RoomManagementPage />
      </Suspense>
    </CatalogAccessBoundary>
  )
}
