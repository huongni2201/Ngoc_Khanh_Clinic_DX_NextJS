"use client"

import * as React from "react"
import { useCachedUserSession, hasStaffPermission } from "@/modules/accesscontrol"
import type { PermissionCode } from "@/modules/accesscontrol"
import { canAccessCatalogManagement } from "../../utils/management/catalog-management-utils"

interface CatalogAccessBoundaryProps {
  /** Permission code required to access this section. */
  permission?: PermissionCode
  children: React.ReactNode
}

/**
 * Clinic Managers and local TEST accounts must also hold the required permission.
 * Shows a denial message without making any catalog API calls when access is denied.
 */
export function CatalogAccessBoundary({ permission, children }: CatalogAccessBoundaryProps) {
  const session = useCachedUserSession()

  // Still loading session
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

  if (permission && !hasStaffPermission(session, permission)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-medium text-foreground">Bạn không có quyền xem danh mục này</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tài khoản của bạn chưa được cấp quyền truy cập.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
