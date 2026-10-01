"use client"

import * as React from "react"
import { useOrganizationHealthExaminationBatches } from "../hooks/use-health-examination-batches"
import { HealthExaminationBatchToolbar } from "./batch-list/health-examination-batch-toolbar"
import { HealthExaminationBatchTable } from "./batch-list/health-examination-batch-table"
import { DataTablePagination } from "@/shared/ui"

interface OrganizationHealthExaminationBatchesTabProps {
  organizationId: string
  onCreateBatchClick?: () => void
}

export function OrganizationHealthExaminationBatchesTab({
  organizationId,
  onCreateBatchClick,
}: OrganizationHealthExaminationBatchesTabProps) {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)

  const { data, isLoading, isError, error } = useOrganizationHealthExaminationBatches(
    organizationId,
    { search, page, pageSize: 10 }
  )

  const batches = data?.data || []
  const total = data?.total ?? 0

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {isError ? (
        <div role="status" className="rounded-lg border border-border bg-muted p-6 text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Backend chưa cung cấp API cho danh sách đợt khám."}
        </div>
      ) : (
        <>
          <HealthExaminationBatchToolbar
            search={search}
            onSearchChange={handleSearchChange}
          />
          <HealthExaminationBatchTable
            organizationId={organizationId}
            batches={batches}
            isLoading={isLoading}
            currentPage={data?.page ?? page}
            pageSize={data?.pageSize ?? 10}
            onCreateClick={onCreateBatchClick}
          />
          {!isLoading && total > 0 && (
            <DataTablePagination
              currentPage={data?.page ?? page}
              pageSize={data?.pageSize ?? 10}
              totalItems={total}
              totalPages={data?.totalPages ?? 1}
              onPageChange={setPage}
              entityName="đợt khám"
            />
          )}
        </>
      )}
    </div>
  )
}
