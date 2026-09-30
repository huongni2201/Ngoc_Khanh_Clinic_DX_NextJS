"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, Edit3, Search } from "@/shared/ui/product-icon"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { Organization, OrganizationDetail } from "../types"
import { EditOrganizationDialog } from "./edit-organization-dialog"

interface OrganizationTableProps {
  organizations: Organization[]
  isLoading?: boolean
  currentPage?: number
  pageSize?: number
  totalItems?: number
  searchTerm?: string
  onSearchChange?: (search: string) => void
}

export function OrganizationTable({
  organizations,
  isLoading,
  currentPage = 1,
  pageSize = 10,
  totalItems,
  searchTerm = "",
  onSearchChange,
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

  const handleRowClick = (organizationId: string) => {
    router.push(`/organizations/${organizationId}`)
  }

  const renderCardHeader = (count?: number) => (
    <>
      <div className="flex items-center justify-between border-b border-border px-5 pt-4 pb-0 gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Danh sách đơn vị
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-alt font-medium text-primary">
            {count ?? (totalItems !== undefined ? totalItems : organizations.length)}
          </span>
        </div>

      </div>

      {/* Filter Strip */}
      {onSearchChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-b border-border bg-surface-alt/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Tìm theo tên đơn vị, mã số thuế, người liên hệ..."
              className="h-8.5 pl-8.5 pr-3 text-xs bg-card border-border"
            />
          </div>
        </div>
      )}
    </>
  )

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 rounded-lg border border-border bg-card overflow-hidden ">
        {renderCardHeader(totalItems ?? 0)}
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-surface-alt/40 hover:bg-surface-alt/40 border-b border-border">
              <TableHead className="h-9 px-3 text-[11px] font-semibold text-foreground text-center w-12">
                STT
              </TableHead>
              <TableHead className="h-9 px-4 text-[11px] font-semibold text-foreground w-[24%]">
                Tên đơn vị
              </TableHead>
              <TableHead className="h-9 px-4 text-[11px] font-semibold text-foreground w-[14%]">
                Mã số thuế
              </TableHead>
              <TableHead className="h-9 px-4 text-[11px] font-semibold text-foreground w-[24%]">
                Địa chỉ
              </TableHead>
              <TableHead className="h-9 px-4 text-[11px] font-semibold text-foreground w-[16%]">
                Người liên hệ
              </TableHead>
              <TableHead className="h-9 px-4 text-[11px] font-semibold text-foreground w-[12%]">
                Trạng thái
              </TableHead>
              <TableHead className="h-9 px-3 text-[11px] font-semibold text-foreground text-right pr-4 w-28">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, idx) => (
              <TableRow key={idx} className="border-b border-table-divider">
                <TableCell className="px-3 py-3 text-center">
                  <Skeleton className="h-4 w-5 mx-auto" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-52" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell className="px-3 py-3 text-right pr-4">
                  <Skeleton className="size-7.5 rounded-lg ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col flex-1 rounded-lg border border-border bg-card overflow-hidden ">
        {renderCardHeader(0)}
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <p className="text-sm font-medium text-foreground">Không tìm thấy đơn vị nào</p>
          <p className="text-xs text-muted-foreground mt-1">
            Thử thay đổi từ khóa tìm kiếm.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 rounded-lg border border-border bg-card overflow-hidden ">
      {renderCardHeader()}
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-surface-alt/40 hover:bg-surface-alt/40 border-b border-border">
            {/* 1. STT */}
            <TableHead className="h-9 px-3 text-[11px] font-semibold text-foreground text-center w-12">
              STT
            </TableHead>

            {/* 2. Tên đơn vị */}
            <TableHead className="h-9 px-4 text-[11px] font-semibold text-foreground w-[24%]">
              Tên đơn vị
            </TableHead>

            {/* 3. Mã số thuế */}
            <TableHead className="h-9 px-4 text-[11px] font-semibold text-foreground w-[14%]">
              Mã số thuế
            </TableHead>

            {/* 4. Địa chỉ */}
            <TableHead className="h-9 px-4 text-[11px] font-semibold text-foreground w-[24%]">
              Địa chỉ
            </TableHead>

            {/* 5. Người liên hệ */}
            <TableHead className="h-9 px-4 text-[11px] font-semibold text-foreground w-[16%]">
              Người liên hệ
            </TableHead>

            {/* 6. Trạng thái */}
            <TableHead className="h-9 px-4 text-[11px] font-semibold text-foreground w-[12%]">
              Trạng thái
            </TableHead>

            {/* 7. Thao tác */}
            <TableHead className="h-9 px-3 text-[11px] font-semibold text-foreground text-right pr-4 w-28">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((organization, index) => {
            const sttNumber = (currentPage - 1) * pageSize + index + 1

            return (
              <TableRow
                key={organization.id}
                onClick={() => handleRowClick(organization.id)}
                className="group cursor-pointer border-b border-divider transition-colors hover:bg-hover/60"
              >
                {/* 1. STT */}
                <TableCell className="px-3 py-2.5 text-center text-xs font-mono text-muted-foreground">
                  {sttNumber}
                </TableCell>

                {/* 2. Tên đơn vị (không có logo) */}
                <TableCell className="px-4 py-2.5 whitespace-normal">
                  <span className="font-medium text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {organization.name}
                  </span>
                </TableCell>

                {/* 3. Mã số thuế */}
                <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">
                  {organization.taxCode || "—"}
                </TableCell>

                {/* 4. Địa chỉ */}
                <TableCell className="px-4 py-2.5 text-xs text-muted-foreground whitespace-normal">
                  <span className="line-clamp-2" title={organization.address}>
                    {organization.address || "—"}
                  </span>
                </TableCell>

                {/* 5. Người liên hệ */}
                <TableCell className="px-4 py-2.5">
                  <div className="flex flex-col text-xs">
                    <span className="font-medium text-foreground">
                      {organization.contactName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {organization.contactPhone}
                    </span>
                  </div>
                </TableCell>

                {/* 6. Trạng thái */}
                <TableCell className="px-4 py-2.5">
                  {organization.status === "ACTIVE"
                    ? "Hoạt động"
                    : organization.status === "INACTIVE"
                      ? "Ngừng hoạt động"
                      : organization.status}
                </TableCell>

                {/* 7. Thao tác */}
                <TableCell
                  className="px-3 py-2.5 text-right pr-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRowClick(organization.id)}
                      className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer "
                      title={`Xem chi tiết - ${organization.name}`}
                      aria-label={`Xem chi tiết cho ${organization.name}`}
                    >
                      <Eye className="size-3.5" />
                      <span className="sr-only">Xem chi tiết</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOrganizationToEdit(organization)}
                      className="size-7.5 p-0 text-secondary-foreground hover:text-foreground hover:bg-surface-alt border-border rounded-lg cursor-pointer "
                      title={`Chỉnh sửa - ${organization.name}`}
                      aria-label={`Chỉnh sửa cho ${organization.name}`}
                    >
                      <Edit3 className="size-3.5" />
                      <span className="sr-only">Chỉnh sửa</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
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

