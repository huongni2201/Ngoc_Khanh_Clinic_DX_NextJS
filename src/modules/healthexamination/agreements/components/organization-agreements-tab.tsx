"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, RefreshCw } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { DataTablePagination, parsePageSize } from "@/shared/ui"
import { useAgreementPermissions } from "../hooks/use-agreement-permissions"
import { useOrganizationHealthExaminationAgreements } from "../hooks/use-agreements"
import { AGREEMENT_DEFAULT_PAGE_SIZE, AGREEMENT_MAX_SEARCH_LENGTH } from "../utils/agreement-list-params"
import { HealthExaminationAgreementTable } from "./agreement-list/health-examination-agreement-table"
import { HealthExaminationAgreementToolbar } from "./agreement-list/health-examination-agreement-toolbar"
import { CreateHealthExaminationAgreementDialog } from "./agreement-form/create-health-examination-agreement-dialog"

interface OrganizationHealthExaminationAgreementsTabProps {
  organizationId: string
  organizationName: string
}

const SEARCH_PARAM = "aq"
const PAGE_PARAM = "apage"
const PAGE_SIZE_PARAM = "asize"
const SEARCH_DEBOUNCE_MS = 300

export function OrganizationHealthExaminationAgreementsTab({
  organizationId,
  organizationName,
}: OrganizationHealthExaminationAgreementsTabProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search = (searchParams?.get(SEARCH_PARAM) ?? "").trim().slice(0, AGREEMENT_MAX_SEARCH_LENGTH)
  const pageValue = Number(searchParams?.get(PAGE_PARAM))
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1
  const pageSize = parsePageSize(searchParams?.get(PAGE_SIZE_PARAM), AGREEMENT_DEFAULT_PAGE_SIZE)

  // Display only; the backend checks every request.
  const { canCreate } = useAgreementPermissions().agreement

  const [searchInput, setSearchInput] = React.useState(search)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  const updateParams = React.useCallback(
    (changes: { search?: string; page?: number; pageSize?: number }) => {
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
      if (changes.pageSize !== undefined) {
        if (changes.pageSize !== AGREEMENT_DEFAULT_PAGE_SIZE) {
          params.set(PAGE_SIZE_PARAM, String(changes.pageSize))
        } else params.delete(PAGE_SIZE_PARAM)
        params.delete(PAGE_PARAM)
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

  const { data, isLoading, isError, error, refetch } = useOrganizationHealthExaminationAgreements(
    organizationId,
    {
      search,
      page,
      pageSize,
      sortKey: "createdAt",
      sortBy: "DESC",
    }
  )

  return (
    <div className="space-y-3" data-slot="organization-agreements-tab">
      <HealthExaminationAgreementToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        onCreateClick={canCreate ? () => setIsCreateOpen(true) : undefined}
      />

      {isError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted p-4 text-xs text-foreground"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
            {error instanceof Error ? error.message : "Không thể tải danh sách thỏa thuận."}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="size-3.5" />
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          <HealthExaminationAgreementTable
            organizationId={organizationId}
            agreements={data?.data ?? []}
            isLoading={isLoading}
            isFiltered={Boolean(search)}
            onCreateClick={canCreate ? () => setIsCreateOpen(true) : undefined}
          />
          {data && (
            <DataTablePagination
              currentPage={data.page}
              pageSize={data.pageSize}
              totalItems={data.total}
              totalPages={data.totalPages}
              entityName="thỏa thuận"
              onPageChange={(next) => updateParams({ page: next })}
              onPageSizeChange={(size) => updateParams({ pageSize: size })}
            />
          )}
        </>
      )}

      {canCreate && (
        <CreateHealthExaminationAgreementDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          organizationId={organizationId}
          organizationName={organizationName}
        />
      )}
    </div>
  )
}
