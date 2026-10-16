"use client"

import * as React from "react"
import { Edit3, Plus, SearchField, ShieldCheck, StatusPill, Users } from "@/shared/ui"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RoleStatusFilter, RoleSummary } from "../types/role"
import {
  ROLE_ACTIVE_PRESENTATION,
  ROLE_STATUS_FILTER_ITEMS,
  roleDisplayDescription,
  roleDisplayName,
} from "../utils/role-labels"

interface RoleTableProps {
  roles: RoleSummary[]
  isLoading?: boolean
  totalItems?: number
  searchTerm?: string
  onSearchChange: (search: string) => void
  status?: RoleStatusFilter
  onStatusChange: (status: RoleStatusFilter | undefined) => void
  /** Omitted when the session may not create roles. */
  onCreateClick?: () => void
  /** Omitted when the session may not update roles. */
  onEdit?: (role: RoleSummary) => void
  /** Omitted when the session may not view role permissions. */
  onOpenPermissions?: (role: RoleSummary) => void
}

const HEAD_CLASS = "h-10 px-4 text-xs font-semibold text-table-header-fg"
const ICON_BUTTON_CLASS =
  "size-8 rounded-lg border-border p-0 text-secondary-foreground hover:bg-surface-alt hover:text-foreground"
const COLUMN_COUNT = 5
const ALL_STATUSES = "ALL"

/** Role List grid (SRS 1.3.1) with its search and status filter. */
export function RoleTable({
  roles,
  isLoading,
  totalItems,
  searchTerm = "",
  onSearchChange,
  status,
  onStatusChange,
  onCreateClick,
  onEdit,
  onOpenPermissions,
}: RoleTableProps) {
  // Local value for the debounced search, re-synced when the URL changes.
  const [searchValue, setSearchValue] = React.useState(searchTerm)
  const [prevSearch, setPrevSearch] = React.useState(searchTerm)

  if (searchTerm !== prevSearch) {
    setPrevSearch(searchTerm)
    setSearchValue(searchTerm)
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== searchTerm) onSearchChange(searchValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, searchTerm, onSearchChange])

  const isFiltered = searchTerm.trim().length > 0 || status !== undefined
  const total = totalItems ?? roles.length
  const showActions = Boolean(onEdit || onOpenPermissions)

  return (
    <div
      data-slot="role-table"
      className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Tìm theo tên vai trò..."
            label="Tìm vai trò"
            maxLength={100}
            className="sm:max-w-md"
          />
          <Select
            items={ROLE_STATUS_FILTER_ITEMS}
            value={status ?? ALL_STATUSES}
            onValueChange={(value) =>
              onStatusChange(value === "ACTIVE" || value === "INACTIVE" ? value : undefined)
            }
          >
            <SelectTrigger
              aria-label="Lọc theo trạng thái"
              className="h-8.5 w-full border-border bg-card text-xs sm:w-44"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_STATUS_FILTER_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!isLoading ? (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            <span className="font-semibold text-foreground">{total}</span> vai trò
          </p>
        ) : null}
      </div>

      <Table className="min-w-[22rem] md:min-w-[36rem]">
        <TableHeader>
          <TableRow className="border-b border-border bg-table-header-bg hover:bg-table-header-bg">
            <TableHead className={`${HEAD_CLASS} w-[48%]`}>Tên vai trò</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[10%] text-right`}>Quyền</TableHead>
            <TableHead className={`${HEAD_CLASS} hidden w-[12%] text-right md:table-cell`}>
              Người dùng
            </TableHead>
            <TableHead className={`${HEAD_CLASS} w-[14%]`}>Trạng thái</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[12%] text-right`}>
              {showActions ? "Thao tác" : <span className="sr-only">Thao tác</span>}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="mt-1.5 h-3 w-48" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="ml-auto h-4 w-8" />
                </TableCell>
                <TableCell className="hidden px-4 py-3 md:table-cell">
                  <Skeleton className="ml-auto h-4 w-8" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="ml-auto h-8 w-[4.5rem] rounded-lg" />
                </TableCell>
              </TableRow>
            ))
          ) : roles.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COLUMN_COUNT} className="py-16 text-center">
                <Users aria-hidden="true" className="mx-auto mb-3 size-9 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  {isFiltered ? "Không có kết quả tìm kiếm" : "Chưa có vai trò nào"}
                </p>
                <p className="mx-auto mb-5 mt-1 max-w-sm whitespace-normal text-xs text-muted-foreground">
                  {isFiltered
                    ? "Thử đổi từ khóa hoặc bỏ lọc trạng thái."
                    : "Thêm vai trò đầu tiên, sau đó cấp quyền ở màn Phân quyền vai trò."}
                </p>
                {isFiltered ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearchValue("")
                      onSearchChange("")
                      onStatusChange(undefined)
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                ) : onCreateClick ? (
                  <Button type="button" onClick={onCreateClick}>
                    <Plus className="size-4" />
                    Thêm vai trò
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <RoleRow
                key={role.id}
                role={role}
                onEdit={onEdit}
                onOpenPermissions={onOpenPermissions}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function RoleRow({
  role,
  onEdit,
  onOpenPermissions,
}: {
  role: RoleSummary
  onEdit?: (role: RoleSummary) => void
  onOpenPermissions?: (role: RoleSummary) => void
}) {
  const status = ROLE_ACTIVE_PRESENTATION[role.active ? "ACTIVE" : "INACTIVE"]
  const name = roleDisplayName(role)
  const description = roleDisplayDescription(role)
  return (
    <TableRow>
      <TableCell className="whitespace-normal px-4 py-3">
        <span className="block text-sm font-medium text-foreground">{name}</span>
        {description ? (
          <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </TableCell>
      <TableCell className="px-4 py-3 text-right text-sm tabular-nums text-foreground">
        {role.permissionCount}
      </TableCell>
      <TableCell className="hidden px-4 py-3 text-right text-sm tabular-nums text-foreground md:table-cell">
        {role.userCount}
      </TableCell>
      <TableCell className="px-4 py-3">
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </TableCell>
      <TableCell className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {onEdit ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(role)}
              className={ICON_BUTTON_CLASS}
              title={`Sửa - ${name}`}
              aria-label={`Sửa vai trò ${name}`}
            >
              <Edit3 className="size-3.5" />
            </Button>
          ) : null}
          {onOpenPermissions ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenPermissions(role)}
              className={ICON_BUTTON_CLASS}
              title={`Phân quyền - ${name}`}
              aria-label={`Phân quyền vai trò ${name}`}
            >
              <ShieldCheck className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  )
}
