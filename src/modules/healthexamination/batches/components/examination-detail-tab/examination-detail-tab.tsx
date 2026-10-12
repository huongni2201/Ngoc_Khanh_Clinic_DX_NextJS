"use client"

import * as React from "react"
import { AlertCircle, Download, FileSpreadsheet, RefreshCw, Upload } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDownloadExaminationDetailTemplate,
  useExaminationDetails,
  useExaminationSummary,
  useExportExaminationDetails,
} from "../../hooks/use-examination-details"
import type {
  ExaminationDetailRow,
  ExaminationStatusFilter,
  HealthExaminationBatchService,
} from "../../types"
import { isExaminationEditAllowed } from "../../utils/examination-detail-labels"
import { ExaminationDetailEntrySheet } from "./examination-detail-entry-sheet"
import { ExaminationDetailImportDialog } from "./examination-detail-import-dialog"
import { ExaminationDetailToolbar } from "./examination-detail-toolbar"
import { ExaminationMatrixTable } from "./examination-matrix-table"
import { ExaminationSummaryStrip } from "./examination-summary-strip"

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300
const HIGHLIGHT_MS = 1500

interface ExaminationDetailTabProps {
  organizationId: string
  batch: {
    id: string
    status: string
    /** The matrix columns, in display order. */
    services: HealthExaminationBatchService[]
    /** First examination day: the lower limit of the actual date in the manual entry. */
    startDate?: string
  }
  /** UX only: the backend decides. When false nothing is requested. */
  canRead?: boolean
  /** UX only: the backend decides. Shows the import when true and the batch accepts changes. */
  canImport?: boolean
  /** UX only: shows "Tải file mẫu" when true and the batch accepts changes. */
  canDownloadTemplate?: boolean
  /** UX only: shows the per-row manual entry when true and the batch accepts changes. */
  canRecord?: boolean
}

export function ExaminationDetailTab({
  organizationId,
  batch,
  canRead = true,
  canImport = false,
  canDownloadTemplate = false,
  canRecord = false,
}: ExaminationDetailTabProps) {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<ExaminationStatusFilter | undefined>()
  const [page, setPage] = React.useState(1)
  const [isImportOpen, setIsImportOpen] = React.useState(false)
  const [editingRowId, setEditingRowId] = React.useState<string | null>(null)
  const [highlightedRowId, setHighlightedRowId] = React.useState<string | null>(null)

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

  const downloadTemplate = useDownloadExaminationDetailTemplate(organizationId, batch.id)

  const changesAllowed = isExaminationEditAllowed(batch.status)
  const importAllowed = canImport && changesAllowed
  const templateAllowed = importAllowed && canDownloadTemplate
  const editAllowed = canRecord && changesAllowed
  const items = React.useMemo(() => details.data?.data ?? [], [details.data])
  const filtered = Boolean(debouncedSearch.trim() || statusFilter)
  const editingIndex = editingRowId ? items.findIndex((item) => item.id === editingRowId) : -1
  const editingRow = editingIndex >= 0 ? items[editingIndex] : null
  const nextRow = editingIndex >= 0 ? (items[editingIndex + 1] ?? null) : null

  React.useEffect(() => {
    if (!highlightedRowId) return
    const timer = setTimeout(() => setHighlightedRowId(null), HIGHLIGHT_MS)
    return () => clearTimeout(timer)
  }, [highlightedRowId])

  const handleExport = () => exportDetails.mutate()
  const handleDownloadTemplate = () => downloadTemplate.mutate()
  // Without the template permission the import dialog falls back to the export, which carries the
  // same content.
  const dialogDownload = templateAllowed ? handleDownloadTemplate : handleExport
  const dialogDownloading = templateAllowed
    ? downloadTemplate.isPending
    : exportDetails.isPending

  const handleSaved = (saved: ExaminationDetailRow) => {
    setHighlightedRowId(saved.id)
  }
  const handleSaveAndNext = (saved: ExaminationDetailRow) => {
    setHighlightedRowId(saved.id)
    setEditingRowId(nextRow?.id ?? null)
  }

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
      {templateAllowed && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          disabled={downloadTemplate.isPending}
        >
          <FileSpreadsheet className="mr-1.5 size-3.5" />
          {downloadTemplate.isPending ? "Đang tải..." : "Tải file mẫu"}
        </Button>
      )}
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

      {downloadTemplate.isError && (
        <p role="alert" className="text-xs text-destructive">
          {downloadTemplate.error instanceof Error && downloadTemplate.error.message
            ? downloadTemplate.error.message
            : "Không thể tải file mẫu. Vui lòng thử lại."}
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
          onEditRow={editAllowed ? (row) => setEditingRowId(row.id) : undefined}
          highlightedRowId={highlightedRowId}
        />
      )}

      {editAllowed && (
        <ExaminationDetailEntrySheet
          open={editingRow !== null}
          onOpenChange={(next) => {
            if (!next) setEditingRowId(null)
          }}
          organizationId={organizationId}
          batchId={batch.id}
          startDate={batch.startDate}
          services={batch.services}
          row={editingRow}
          onSaved={handleSaved}
          onSaveAndNext={nextRow ? handleSaveAndNext : undefined}
          onReload={() => details.refetch()}
        />
      )}

      {importAllowed && (
        <ExaminationDetailImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          organizationId={organizationId}
          batchId={batch.id}
          onDownloadTemplate={dialogDownload}
          isDownloadingTemplate={dialogDownloading}
        />
      )}
    </div>
  )
}
