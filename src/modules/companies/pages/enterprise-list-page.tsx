"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EnterprisePageHeader } from "../components/enterprise-page-header"
import { EnterpriseFilters } from "../components/enterprise-filters"
import { EnterpriseTable } from "../components/enterprise-table"
import { DataTablePagination } from "@/shared/ui"
import { CreateEnterpriseDialog } from "../components/create-enterprise-dialog"
import { useEnterprises } from "../hooks/use-enterprises"

export function EnterpriseListPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State from URL or defaults
  const search = searchParams.get("q") || ""
  const status = searchParams.get("status") || "ALL"
  const page = parseInt(searchParams.get("page") || "1", 10)

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  // Sync state to URL params
  const updateUrlParams = React.useCallback(
    (newParams: { q?: string; status?: string; page?: number }) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))

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
  const { data, isLoading, isError, refetch } = useEnterprises({
    search,
    status,
    page,
    pageSize: 10,
  })

  return (
    <div className="flex-1 flex flex-col justify-between space-y-3.5 w-full min-h-0">
      <div className="space-y-3.5 flex-1 flex flex-col">
        {/* 1. Page Header */}
        <EnterprisePageHeader onOpenCreateDialog={() => setIsCreateOpen(true)} />

        {/* 2. Filters Bar */}
        <EnterpriseFilters
          search={search}
          onSearchChange={(q) => updateUrlParams({ q })}
          status={status}
          onStatusChange={(newStatus) => updateUrlParams({ status: newStatus })}
        />

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Không thể tải danh sách doanh nghiệp
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Đã có lỗi xảy ra trong quá trình truy xuất dữ liệu từ máy chủ.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2 text-xs"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Thử lại
            </Button>
          </div>
        )}

        {/* 3. Enterprises Table */}
        {!isError && (
          <div className="flex-1 flex flex-col">
            <EnterpriseTable
              enterprises={data?.data || []}
              isLoading={isLoading}
              currentPage={data?.page || 1}
              pageSize={data?.pageSize || 10}
            />
          </div>
        )}
      </div>

      {/* 4. Pagination */}
      {!isError && !isLoading && (data?.total || 0) > 0 && (
        <div className="pt-1 mt-1">
          <DataTablePagination
            currentPage={data?.page || 1}
            pageSize={data?.pageSize || 10}
            totalItems={data?.total || 0}
            totalPages={data?.totalPages || 1}
            onPageChange={(newPage) => updateUrlParams({ page: newPage })}
            entityName="doanh nghiệp"
          />
        </div>
      )}

      {/* 5. Create Enterprise Modal */}
      <CreateEnterpriseDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}
