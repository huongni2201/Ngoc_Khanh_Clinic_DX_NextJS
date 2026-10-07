"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Building2, Edit3, Eye, Plus } from "@/shared/ui/product-icon"
import { SearchField, StatusPill } from "@/shared/ui"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Organization, OrganizationDetail } from "../types"
import { EditOrganizationDialog } from "./edit-organization-dialog"

interface OrganizationTableProps {
  organizations: Organization[]
  isLoading?: boolean
  totalItems?: number
  searchTerm?: string
  onSearchChange?: (search: string) => void
  onCreateClick?: () => void
}

const HEAD_CLASS = "h-10 px-4 text-xs font-semibold text-table-header-fg"
const ICON_BUTTON_CLASS =
  "size-8 cursor-pointer rounded-lg border-border p-0 text-secondary-foreground hover:bg-surface-alt hover:text-foreground"

function statusPresentation(status: Organization["status"]) {
  return status === "ACTIVE"
    ? { tone: "success" as const, label: "Hoạt động" }
    : status === "INACTIVE"
      ? { tone: "neutral" as const, label: "Ngừng hoạt động" }
      : { tone: "neutral" as const, label: status }
}

export function OrganizationTable({
  organizations,
  isLoading,
  totalItems,
  searchTerm = "",
  onSearchChange,
  onCreateClick,
}: OrganizationTableProps) {
  const router = useRouter()
  const [organizationToEdit, setOrganizationToEdit] = React.useState<OrganizationDetail | null>(null)

  // Local state for debounced search
  const [searchValue, setSearchValue] = React.useState(searchTerm)
  const [prevSearch, setPrevSearch] = React.useState(searchTerm)

  if (searchTerm !== prevSearch) {
    setPrevSearch(searchTerm)
    setSearchValue(searchTerm)
  }

  React.useEffect(() => {
    if (!onSearchChange) return
    const timer = setTimeout(() => {
      if (searchValue !== searchTerm) {
        onSearchChange(searchValue)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, searchTerm, onSearchChange])

  const openOrganization = (organizationId: string) => {
    router.push(`/organizations/${organizationId}`)
  }

  const total = totalItems ?? organizations.length
  const isFiltered = searchTerm.trim().length > 0

  return (
    <div
      data-slot="organization-table"
      className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card"
    >
      {onSearchChange && (
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Tìm theo tên đơn vị, mã số thuế, người liên hệ..."
            label="Tìm đơn vị"
            className="sm:max-w-md"
          />
          {!isLoading && (
            <p className="text-xs text-muted-foreground" aria-live="polite">
              <span className="font-semibold text-foreground">{total}</span> đơn vị
            </p>
          )}
        </div>
      )}

      <Table className="min-w-[44rem]">
        <TableHeader>
          <TableRow className="border-b border-border bg-table-header-bg hover:bg-table-header-bg">
            <TableHead className={`${HEAD_CLASS} w-[30%] min-w-56`}>Tên đơn vị</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[30%] min-w-48`}>Địa chỉ</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[18%]`}>Người liên hệ</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[14%]`}>Trạng thái</TableHead>
            <TableHead className={`${HEAD_CLASS} w-24 text-right`}>
              <span className="sr-only">Thao tác</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell className="px-4 py-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-52" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="ml-auto h-8 w-[4.5rem] rounded-lg" />
                </TableCell>
              </TableRow>
            ))
          ) : organizations.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="py-16 text-center">
                <Building2 aria-hidden="true" className="mx-auto mb-3 size-9 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  {isFiltered ? "Không tìm thấy đơn vị phù hợp" : "Chưa có đơn vị nào"}
                </p>
                <p className="mx-auto mt-1 mb-5 max-w-sm whitespace-normal text-xs text-muted-foreground">
                  {isFiltered
                    ? "Thử đổi từ khóa hoặc tìm theo mã số thuế."
                    : "Thêm đơn vị đầu tiên để bắt đầu tạo đợt khám sức khỏe."}
                </p>
                {onCreateClick && !isFiltered && (
                  <Button type="button" onClick={onCreateClick}>
                    <Plus className="size-4" />
                    Thêm đơn vị
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            organizations.map((organization) => {
              const status = statusPresentation(organization.status)

              return (
                <TableRow
                  key={organization.id}
                  onClick={() => openOrganization(organization.id)}
                  className="group cursor-pointer"
                >
                  <TableCell className="px-4 py-3 whitespace-normal">
                    <span className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      {organization.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-xs tabular-nums text-muted-foreground">
                      {organization.taxCode || "Chưa có mã số thuế"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-normal text-sm text-secondary-foreground">
                    <span className="line-clamp-2" title={organization.address}>
                      {organization.address || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="block text-sm font-medium text-foreground">
                      {organization.contactName || "—"}
                    </span>
                    <span className="mt-0.5 block font-mono text-xs tabular-nums text-muted-foreground">
                      {organization.contactPhone}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusPill tone={status.tone}>{status.label}</StatusPill>
                  </TableCell>
                  <TableCell
                    className="px-4 py-3 text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openOrganization(organization.id)}
                        className={ICON_BUTTON_CLASS}
                        title={`Xem chi tiết - ${organization.name}`}
                        aria-label={`Xem chi tiết cho ${organization.name}`}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOrganizationToEdit(organization)}
                        className={ICON_BUTTON_CLASS}
                        title={`Chỉnh sửa - ${organization.name}`}
                        aria-label={`Chỉnh sửa cho ${organization.name}`}
                      >
                        <Edit3 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {organizationToEdit && (
        <EditOrganizationDialog
          open
          organization={organizationToEdit}
          onOpenChange={(open) => {
            if (!open) setOrganizationToEdit(null)
          }}
        />
      )}
    </div>
  )
}
