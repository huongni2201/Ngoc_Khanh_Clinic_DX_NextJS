"use client"

import * as React from "react"
import { AlertCircle, Download, RefreshCw, Upload } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useExaminationDetails,
  useExaminationSummary,
  useExportExaminationDetails,
} from "../../hooks/use-examination-details"
import type {
  ExaminationStatusFilter,
  HealthExaminationBatchService,
} from "../../types"
import { isExaminationImportAllowed } from "../../utils/examination-detail-labels"
import { ExaminationDetailImportDialog } from "./examination-detail-import-dialog"
import { ExaminationDetailToolbar } from "./examination-detail-toolbar"
import { ExaminationMatrixTable } from "./examination-matrix-table"
import { ExaminationSummaryStrip } from "./examination-summary-strip"

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300

interface ExaminationDetailTabProps {
  organizationId: string
  batch: {
    id: string
    status: string
    /** The matrix columns, in display order. */
    services: HealthExaminationBatchService[]
  }
  /** UX only: the backend decides. When false nothing is requested. */
  canRead?: boolean
  /** UX only: the backend decides. Shows the import when true and the batch accepts changes. */
  canImport?: boolean
}

export function ExaminationDetailTab({
  organizationId,
  batch,
  canRead = true,
  canImport = false,
}: ExaminationDetailTabProps) {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<ExaminationStatusFilter | undefined>()
  const [page, setPage] = React.useState(1)
  const [isImportOpen, setIsImportOpen] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  const details = useExaminationDetails(
    organizationId,
    batch.id,
    { search: debouncedSearch, statusFilter, page, pageSize: PAGE_SIZE },
    { enabled: canRead }
  )
  const summary = useExaminationSummary(organizationId, batch.id, { enabled: canRead })
  const exportDetails = useExportExaminationDetails(organizationId, batch.id)

  const importAllowed = canImport && isExaminationImportAllowed(batch.status)
  const items = details.data?.data ?? []
  const filtered = Boolean(debouncedSearch.trim() || statusFilter)

  const handleExport = () => exportDetails.mutate()

  const actions = (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exportDetails.isPending}
      >
        <Download className="mr-1.5 size-3.5" />
        {exportDetails.isPending ? "Đang xuất..." : "Xuất Excel"}
      </Button>
      {importAllowed && (
        <Button type="button" size="sm" onClick={() => setIsImportOpen(true)}>
          <Upload className="mr-1.5 size-3.5" />
          Nhập Excel
        </Button>
      )}
    </>
  )

  if (!canRead) {
    return (
      <div role="status" className="rounded-lg border border-border bg-muted p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Không có quyền xem</p>
        <p className="mt-1">Tài khoản của bạn chưa được cấp quyền xem chi tiết khám của đợt khám này.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ExaminationSummaryStrip summary={summary.data} isLoading={summary.isLoading} />

      <ExaminationDetailToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value)
          setPage(1)
        }}
        actions={actions}
      />

      {exportDetails.isError && (
        <p role="alert" className="text-xs text-destructive">
          {exportDetails.error.message || "Không thể xuất file Excel."}
        </p>
      )}

      {details.isError ? (
        <div className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">Không thể tải chi tiết khám.</p>
          <p role="alert" className="mx-auto max-w-sm text-xs text-muted-foreground">
            {details.error instanceof Error && details.error.message
              ? details.error.message
              : "Đã xảy ra lỗi khi tải chi tiết khám của đợt khám này. Vui lòng thử lại."}
          </p>
          <Button variant="outline" size="sm" onClick={() => void details.refetch()} className="h-8 text-xs">
            <RefreshCw className="mr-1.5 size-3.5" />
            Thử lại
          </Button>
        </div>
      ) : details.isLoading ? (
        <div className="space-y-3">
          <div className="space-y-3 overflow-hidden rounded-lg border border-border bg-card p-4">
            <Skeleton className="h-9 w-full rounded-md" />
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </div>
      ) : (
        <ExaminationMatrixTable
          services={batch.services}
          items={items}
          totalItems={details.data?.total ?? 0}
          currentPage={page}
          pageSize={PAGE_SIZE}
          totalPages={details.data?.totalPages || 1}
          onPageChange={setPage}
          filtered={filtered}
        />
      )}

      {importAllowed && (
        <ExaminationDetailImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          organizationId={organizationId}
          batchId={batch.id}
          onExport={handleExport}
          isExporting={exportDetails.isPending}
        />
      )}
    </div>
  )
}
