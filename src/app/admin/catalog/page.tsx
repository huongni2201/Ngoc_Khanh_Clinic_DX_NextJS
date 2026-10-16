"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCachedUserSession, hasStaffPermission } from "@/modules/accesscontrol"
import { canAccessCatalogManagement, CATALOG_PERMISSIONS } from "@/modules/catalog"

const CATALOG_ROUTES = [
  { href: "/admin/catalog/departments", permission: CATALOG_PERMISSIONS.DEPARTMENT_VIEW },
  { href: "/admin/catalog/rooms", permission: CATALOG_PERMISSIONS.ROOM_VIEW },
  { href: "/admin/catalog/specialties", permission: CATALOG_PERMISSIONS.SPECIALTY_VIEW },
  { href: "/admin/catalog/services", permission: CATALOG_PERMISSIONS.SERVICE_VIEW },
  { href: "/admin/catalog/medicines", permission: CATALOG_PERMISSIONS.MEDICINE_VIEW },
]

export default function AdminCatalogIndexPage() {
  const router = useRouter()
  const session = useCachedUserSession()

  React.useEffect(() => {
    if (session === undefined) return
    if (!canAccessCatalogManagement(session)) return

    const firstAllowed = CATALOG_ROUTES.find((r) => hasStaffPermission(session, r.permission))
    if (firstAllowed) {
      router.replace(firstAllowed.href)
    }
  }, [session, router])

  if (session === undefined) return null

  if (!canAccessCatalogManagement(session)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-medium text-foreground">Bạn không có quyền truy cập mục này</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tài khoản của bạn không được phép truy cập quản lý danh mục.
        </p>
      </div>
    )
  }

  const hasAnyPermission = CATALOG_ROUTES.some((r) => hasStaffPermission(session, r.permission))
  if (!hasAnyPermission) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-medium text-foreground">Bạn không có quyền xem danh mục này</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tài khoản của bạn chưa được cấp quyền cho bất kỳ danh mục nào.
        </p>
      </div>
    )
  }

  return null
}
