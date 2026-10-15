"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  DataTablePagination,
  DEFAULT_PAGE_SIZE,
  Lock,
  parsePageSize,
  PageHeader,
  Plus,
  RefreshCw,
  ScreenLayout,
} from "@/shared/ui"
import { RoleFormSheet } from "../components/role-form-sheet"
import { RoleTable } from "../components/role-table"
import { usePermissions } from "../hooks/use-permissions"
import { useAllRoles } from "../hooks/use-roles"
import { PERMISSION, ROLE_PERMISSIONS_SCREEN_PERMISSIONS } from "../permissions"
import type { RoleStatusFilter, RoleSummary } from "../types/role"
import { selectRolePage } from "../utils/role-labels"
import { PATIENT_ROLE_CODE } from "../utils/role-permission-draft"

/** Role List (SRS UC-008, 1.3.1) with the New Role and Edit Role panels. */
export function RoleListPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { can, canAll } = usePermissions()
  const canView = can(PERMISSION.ROLE_MANAGE)
  const canCreate = can(PERMISSION.ROLE_CREATE)
  const canEdit = can(PERMISSION.ROLE_UPDATE)
  // The Role Permissions screen reads the grants, the catalogue and the role list.
  const canOpenPermissions = canAll(...ROLE_PERMISSIONS_SCREEN_PERMISSIONS)

  const search = searchParams?.get("q")?.trim() || ""
  const statusParam = searchParams?.get("status")
  const status: RoleStatusFilter | undefined =
    statusParam === "ACTIVE" || statusParam === "INACTIVE" ? statusParam : undefined
  const pageParam = Number(searchParams?.get("page"))
  const page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSize = parsePageSize(searchParams?.get("size"))

  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [roleToEditId, setRoleToEditId] = React.useState<string | null>(null)

  const updateUrlParams = React.useCallback(
    (next: { q?: string; status?: RoleStatusFilter | null; page?: number; pageSize?: number }) => {
      const current = new URLSearchParams(Array.from(searchParams?.entries() || []))
      if (next.q !== undefined) {
        if (next.q.trim()) current.set("q", next.q.trim())
        else current.delete("q")
        current.set("page", "1")
      }
      if (next.status !== undefined) {
        if (next.status) current.set("status", next.status)
        else current.delete("status")
        current.set("page", "1")
      }
      if (next.page !== undefined) current.set("page", String(next.page))
      if (next.pageSize !== undefined) {
        if (next.pageSize === DEFAULT_PAGE_SIZE) current.delete("size")
        else current.set("size", String(next.pageSize))
        current.set("page", "1")
      }
      const query = current.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    },
    [router, pathname, searchParams]
  )

  // Searched here on the Vietnamese names shown on screen: the backend stores the English seed names.
  const { data, isLoading, isError, error, refetch } = useAllRoles(canView)
  const allRoles = React.useMemo(() => data ?? [], [data])
  const view = React.useMemo(
    () => selectRolePage(allRoles, { search, status, page, pageSize }),
    [allRoles, search, status, page, pageSize]
  )
  // "Copy permissions from" lists every active staff role, not only the current page: the patient
  // portal role would give a staff role its OWN_* permissions, and the backend rejects it.
  const copySources = React.useMemo(
    () => allRoles.filter((role) => role.active && role.code !== PATIENT_ROLE_CODE),
    [allRoles]
  )

  const roleToEdit = roleToEditId
    ? allRoles.find((role) => role.id === roleToEditId)
    : undefined

  const openPermissions = React.useCallback(
    (role: RoleSummary) => router.push(`/roles/permissions?roleId=${encodeURIComponent(role.id)}`),
    [router]
  )
  const openCreate = canCreate ? () => setIsCreateOpen(true) : undefined
  const handleSearchChange = React.useCallback((q: string) => updateUrlParams({ q }), [updateUrlParams])

  return (
    <ScreenLayout data-slot="role-list-page">
      <PageHeader
        breadcrumbs={[{ label: "Quản trị" }, { label: "Vai trò" }]}
        title="Vai trò"
        description="Nhóm quyền gán cho tài khoản đăng nhập"
        actions={
          openCreate ? (
            <Button type="button" onClick={openCreate}>
              <Plus className="size-4" />
              Thêm vai trò
            </Button>
          ) : null
        }
      />

      {!canView ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-border bg-muted p-4 text-xs text-foreground"
        >
          <Lock aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          Tài khoản của bạn chưa được cấp quyền xem danh sách vai trò. Nếu vừa được cấp quyền, hãy đăng
          nhập lại.
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted p-4 text-xs text-foreground"
        >
          <span className="flex items-center gap-2">
            <AlertCircle aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            {error instanceof Error ? error.message : "Không thể tải danh sách vai trò."}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="size-3.5" />
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-1 flex-col">
            <RoleTable
              roles={view.items}
              isLoading={isLoading}
              totalItems={view.total}
              searchTerm={search}
              onSearchChange={handleSearchChange}
              status={status}
              onStatusChange={(next) => updateUrlParams({ status: next ?? null })}
              onCreateClick={openCreate}
              onEdit={canEdit ? (role) => setRoleToEditId(role.id) : undefined}
              onOpenPermissions={canOpenPermissions ? openPermissions : undefined}
            />
          </div>
          {!isLoading && view.total > 0 ? (
            <div className="mt-1 pt-1">
              <DataTablePagination
                currentPage={view.page}
                pageSize={pageSize}
                totalItems={view.total}
                totalPages={view.totalPages}
                onPageChange={(nextPage) => updateUrlParams({ page: nextPage })}
                onPageSizeChange={(nextSize) => updateUrlParams({ pageSize: nextSize })}
                entityName="vai trò"
              />
            </div>
          ) : null}
        </>
      )}

      {canCreate ? (
        <RoleFormSheet
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          copySources={copySources}
        />
      ) : null}
      {canEdit ? (
        <RoleFormSheet
          open={roleToEdit !== undefined}
          onOpenChange={(open) => {
            if (!open) setRoleToEditId(null)
          }}
          role={roleToEdit}
          onReload={async () => {
            const refreshed = await refetch()
            return refreshed.data?.find((role) => role.id === roleToEditId)
          }}
          onEditPermissions={canOpenPermissions ? openPermissions : undefined}
        />
      ) : null}
    </ScreenLayout>
  )
}
