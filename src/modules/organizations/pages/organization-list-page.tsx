"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { AlertCircle } from "@/shared/ui/product-icon"
import { OrganizationPageHeader } from "../components/organization-page-header"
import { OrganizationTable } from "../components/organization-table"
import { DataTablePagination, ScreenLayout } from "@/shared/ui"
import { CreateOrganizationDialog } from "../components/create-organization-dialog"
import { useOrganizations } from "../hooks/use-organizations"

export function OrganizationListPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State from URL or defaults
  const search = searchParams?.get("q")?.trim() || ""
  const pageParam = Number(searchParams?.get("page"))
  const page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  // Sync state to URL params
  const updateUrlParams = React.useCallback(
    (newParams: { q?: string; page?: number }) => {
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
  const { data, isLoading, isError, error } = useOrganizations({
    search,
    page,
    pageSize: 10,
  })

  return (
    <ScreenLayout data-slot="organization-list-page">
      {/* 1. Page Header */}
      <OrganizationPageHeader onOpenCreateDialog={() => setIsCreateOpen(true)} />

      {/* Error State */}
      {isError && (
        <div role="status" className="p-4 rounded-lg border border-border bg-muted flex items-center gap-3 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
            <span>{error instanceof Error ? error.message : "Không thể tải danh sách đơn vị."}</span>
          </div>
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
        onCreated={(organizationId) => router.push(`/organizations/${organizationId}`)}
      />
    </ScreenLayout>
  )
}

