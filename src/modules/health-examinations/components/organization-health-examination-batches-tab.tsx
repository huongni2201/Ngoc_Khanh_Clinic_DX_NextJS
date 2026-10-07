"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, RefreshCw } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { DataTablePagination } from "@/shared/ui"
import { useOrganizationHealthExaminationBatches } from "../hooks/use-health-examination-batches"
import { BATCH_DEFAULT_PAGE_SIZE, BATCH_MAX_SEARCH_LENGTH } from "../utils/batch-list-params"
import { HealthExaminationBatchTable } from "./batch-list/health-examination-batch-table"
import { HealthExaminationBatchToolbar } from "./batch-list/health-examination-batch-toolbar"
import { CreateHealthExaminationBatchDialog } from "./batch-form/create-health-examination-batch-dialog"

interface OrganizationHealthExaminationBatchesTabProps {
  organizationId: string
  organizationName: string
  organizationAddress?: string
}

const SEARCH_PARAM = "bq"
const PAGE_PARAM = "bpage"
const SEARCH_DEBOUNCE_MS = 300

export function OrganizationHealthExaminationBatchesTab({
  organizationId,
  organizationName,
  organizationAddress,
}: OrganizationHealthExaminationBatchesTabProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search = (searchParams?.get(SEARCH_PARAM) ?? "").trim().slice(0, BATCH_MAX_SEARCH_LENGTH)
  const pageValue = Number(searchParams?.get(PAGE_PARAM))
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1

  const [searchInput, setSearchInput] = React.useState(search)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  const updateParams = React.useCallback(
    (changes: { search?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "")
      if (changes.search !== undefined) {
        if (changes.search.trim()) params.set(SEARCH_PARAM, changes.search.trim())
        else params.delete(SEARCH_PARAM)
        params.delete(PAGE_PARAM)
      }
      if (changes.page !== undefined) {
        if (changes.page > 1) params.set(PAGE_PARAM, String(changes.page))
        else params.delete(PAGE_PARAM)
      }
      const query = params.toString()
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  // Writes the typed search to the URL once the user pauses; the URL is the source of the request.
  React.useEffect(() => {
    if (searchInput.trim() === search) return
    const timer = setTimeout(() => updateParams({ search: searchInput }), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchInput, search, updateParams])

  const { data, isLoading, isError, error, refetch } = useOrganizationHealthExaminationBatches(
    organizationId,
    {
      search,
      page,
      pageSize: BATCH_DEFAULT_PAGE_SIZE,
      sortKey: "createdAt",
      sortBy: "DESC",
    }
  )

  return (
    <div className="space-y-3" data-slot="organization-health-examination-batches-tab">
      <HealthExaminationBatchToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      {isError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted p-4 text-xs text-foreground"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
            {error instanceof Error ? error.message : "Không thể tải danh sách đợt khám."}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="size-3.5" />
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          <HealthExaminationBatchTable
            organizationId={organizationId}
            batches={data?.data ?? []}
            isLoading={isLoading}
            isFiltered={Boolean(search)}
            onCreateClick={() => setIsCreateOpen(true)}
          />
          {data && (
            <DataTablePagination
              currentPage={data.page}
              pageSize={data.pageSize}
              totalItems={data.total}
              totalPages={data.totalPages}
              entityName="đợt khám"
              onPageChange={(next) => updateParams({ page: next })}
            />
          )}
        </>
      )}

      <CreateHealthExaminationBatchDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        organizationId={organizationId}
        organizationName={organizationName}
        organizationAddress={organizationAddress}
      />
    </div>
  )
}
