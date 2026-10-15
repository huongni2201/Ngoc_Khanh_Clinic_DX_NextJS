"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { AlertCircle, RefreshCw } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { OrganizationPageHeader } from "../components/organization-page-header"
import { OrganizationTable } from "../components/organization-table"
import { DataTablePagination, ScreenLayout, parsePageSize, DEFAULT_PAGE_SIZE } from "@/shared/ui"
import { CreateOrganizationDialog } from "../components/create-organization-dialog"
import { useOrganizationPermissions } from "../hooks/use-organization-permissions"
import { useOrganizations } from "../hooks/use-organizations"

export function OrganizationListPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State from URL or defaults
  const search = searchParams?.get("q")?.trim() || ""
  const pageParam = Number(searchParams?.get("page"))
  const page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSize = parsePageSize(searchParams?.get("size"))

  // Display only; the backend checks every request.
  const { canCreate, canEdit } = useOrganizationPermissions()

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  // Sync state to URL params
  const updateUrlParams = React.useCallback(
    (newParams: { q?: string; page?: number; pageSize?: number }) => {
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

      if (newParams.pageSize !== undefined) {
        if (newParams.pageSize === DEFAULT_PAGE_SIZE) current.delete("size")
        else current.set("size", newParams.pageSize.toString())
        current.set("page", "1")
      }

      const searchStr = current.toString()
      const query = searchStr ? `?${searchStr}` : ""
      router.replace(`${pathname}${query}`)
    },
    [router, pathname, searchParams]
  )

  // Data fetching hook
  const { data, isLoading, isError, error, refetch } = useOrganizations({
    search,
    page,
    pageSize,
  })

  return (
    <ScreenLayout data-slot="organization-list-page">
      {/* 1. Page Header */}
      <OrganizationPageHeader onOpenCreateDialog={canCreate ? () => setIsCreateOpen(true) : undefined} />

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted p-4 text-xs text-foreground"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
            {error instanceof Error ? error.message : "Không thể tải danh sách đơn vị."}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="size-3.5" />
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
            totalItems={data?.total || 0}
            searchTerm={search}
            onSearchChange={(q) => updateUrlParams({ q })}
            onCreateClick={canCreate ? () => setIsCreateOpen(true) : undefined}
            canEdit={canEdit}
          />
        </div>
      )}

      {/* 4. Pagination */}
      {!isError && !isLoading && (data?.total || 0) > 0 && (
        <div className="pt-1 mt-1">
          <DataTablePagination
            currentPage={data?.page || 1}
            pageSize={data?.pageSize || pageSize}
            totalItems={data?.total || 0}
            totalPages={data?.totalPages || 1}
            onPageChange={(newPage) => updateUrlParams({ page: newPage })}
            onPageSizeChange={(size) => updateUrlParams({ pageSize: size })}
            entityName="đơn vị"
          />
        </div>
      )}

      {/* 5. Create Organization Modal */}
      {canCreate && (
        <CreateOrganizationDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onCreated={(organizationId) => router.push(`/organizations/${organizationId}`)}
        />
      )}
    </ScreenLayout>
  )
}

