"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { hasStaffPermission, useCachedUserSession } from "@/modules/accesscontrol"
import { useDepartment, useDepartmentPicker, useSpecialty, useSpecialtyPicker } from "../../hooks/management/use-catalog-management"
import { CATALOG_PERMISSIONS } from "../../utils/management/catalog-management-utils"
import { CatalogReferencePicker } from "./catalog-reference-picker"

/**
 * Filter dropdown for parent entity (Department / Specialty) in catalog list toolbars.
 * Features:
 * 1. Compact option dropdown style that fits on 1 line.
 * 2. Real-time search inside the dropdown.
 * 3. Max-height (max-h-60) with smooth scrolling.
 * 4. Quick clear icon to reset to "Tất cả".
 */
export function CatalogParentFilter({
  kind,
  value,
  onChange,
  className,
}: {
  kind: "department" | "specialty"
  value?: string
  onChange: (value: string | undefined) => void
  className?: string
}) {
  const session = useCachedUserSession()
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)

  const department = kind === "department"
  const canView = hasStaffPermission(
    session,
    department ? CATALOG_PERMISSIONS.DEPARTMENT_VIEW : CATALOG_PERMISSIONS.SPECIALTY_VIEW
  )
  const canDetail = hasStaffPermission(
    session,
    department ? CATALOG_PERMISSIONS.DEPARTMENT_DETAIL_VIEW : CATALOG_PERMISSIONS.SPECIALTY_DETAIL_VIEW
  )

  const params = { q: search, page, size: 50, active: null, sortKey: "code", sortBy: "ASC" as const }
  const departments = useDepartmentPicker(params, department && canView)
  const specialties = useSpecialtyPicker(params, !department && canView)
  const departmentDetail = useDepartment(value ?? "", department && canDetail)
  const specialtyDetail = useSpecialty(value ?? "", !department && canDetail)

  const query = department ? departments : specialties
  const detail = department ? departmentDetail : specialtyDetail
  const items = query.data?.items.map((i) => ({ id: i.id, code: i.code, name: i.name, active: i.active })) ?? []
  const selectedName = items.find((i) => i.id === value)?.name ?? detail.data?.name

  const allLabel = department ? "Tất cả khoa" : "Tất cả chuyên khoa"

  return (
    <CatalogReferencePicker
      title={department ? "Khoa" : "Chuyên khoa"}
      placeholder={allLabel}
      allowNone
      noneLabel={allLabel}
      selectedId={value}
      selectedName={selectedName}
      clearable
      disabled={!canView}
      triggerClassName={cn("h-9 w-full bg-background text-xs sm:text-sm font-normal", className)}
      items={items}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => void query.refetch()}
      currentPage={page}
      totalPages={query.data?.totalPages ?? 1}
      onPageChange={setPage}
      searchValue={search}
      onSearchChange={(next) => { setSearch(next); setPage(1) }}
      onSelect={(item) => onChange(item?.id)}
    />
  )
}
