"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { AlertCircle, RefreshCw } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { OrganizationPageHeader } from "../components/organization-page-header"
import { OrganizationCountersStrip } from "../components/organization-counters-strip"
import { OrganizationTable } from "../components/organization-table"
import { DataTablePagination, ScreenLayout } from "@/shared/ui"
import { CreateOrganizationDialog } from "../components/create-organization-dialog"
import { useOrganizations, useOrganizationCounters } from "../hooks/use-organizations"
import type { OrganizationHealthExaminationStatus } from "../types"

export function OrganizationListPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State from URL or defaults
  const search = searchParams?.get("q") || ""
  const status = (searchParams?.get("status") || "ALL") as
    | OrganizationHealthExaminationStatus
    | "ALL"
  const page = parseInt(searchParams?.get("page") || "1", 10)

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  // Sync state to URL params
  const updateUrlParams = React.useCallback(
    (newParams: { q?: string; status?: string; page?: number }) => {
      const current = new URLSearchParams(
        Array.from(searchParams?.entries() || [])
      )

      if (newParams.q !== undefined) {
        if (newParams.q.trim()) {
          current.set("q", newParams.q.trim())
        } else {
          current.delete("q")
        }
        current.set("page", "1")
      }

      if (newParams.status !== undefined) {
        if (newParams.status && newParams.status !== "ALL") {
          current.set("status", newParams.status)
        } else {
          current.delete("status")
        }
        current.set("page", "1")
      }

      if (newParams.page !== undefined) {
        current.set("page", newParams.page.toString())
      }

      const searchStr = current.toString()
      const query = searchStr ? `?${searchStr}` : ""
      router.replace(`${pathname}${query}`)
    },
    [router, pathname, searchParams]
  )

  // Data fetching hook
  const { data, isLoading, isError, refetch } = useOrganizations({
    search,
    status,
    page,
    pageSize: 10,
  })

  // Counters hook
  const { data: counters, isLoading: isCountersLoading } = useOrganizationCounters()

  return (
    <ScreenLayout data-slot="organization-list-page">
      {/* 1. Page Header */}
      <OrganizationPageHeader onOpenCreateDialog={() => setIsCreateOpen(true)} />

      {/* 2. Operational Counters Strip */}
      <OrganizationCountersStrip
        counters={counters}
        isLoading={isCountersLoading}
        activeStatusKey={status}
        onFilterStatus={(newStatus) => updateUrlParams({ status: newStatus })}
      />

      {/* Error State */}
      {isError && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-3 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>Có lỗi xảy ra trong quá trình truy xuất dữ liệu từ máy chủ.</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-7 text-xs border-destructive/30 hover:bg-destructive/10 cursor-pointer"
          >
            <RefreshCw className="size-3 mr-1" />
            Thử lại
          </Button>
        </div>
      )}

      {/* 3. Organizations Table with integrated header, tabs, and filter */}
      {!isError && (
        <div className="flex-1 flex flex-col">
          <OrganizationTable
            organizations={data?.data || []}
            isLoading={isLoading}
            currentPage={data?.page || 1}
            pageSize={data?.pageSize || 10}
            totalItems={data?.total || 0}
            activeStatus={status}
            onStatusChange={(newStatus) => updateUrlParams({ status: newStatus })}
            searchTerm={search}
            onSearchChange={(q) => updateUrlParams({ q })}
          />
        </div>
      )}

      {/* 4. Pagination */}
      {!isError && !isLoading && (data?.total || 0) > 0 && (
        <div className="pt-1 mt-1">
          <DataTablePagination
            currentPage={data?.page || 1}
            pageSize={data?.pageSize || 10}
            totalItems={data?.total || 0}
            totalPages={data?.totalPages || 1}
            onPageChange={(newPage) => updateUrlParams({ page: newPage })}
            entityName="đơn vị"
          />
        </div>
      )}

      {/* 5. Create Organization Modal */}
      <CreateOrganizationDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </ScreenLayout>
  )
}

