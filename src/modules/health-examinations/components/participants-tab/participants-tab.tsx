"use client"

import * as React from "react"
import { Download, Upload } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDownloadParticipantImportTemplate,
  useHealthExaminationBatchParticipants,
} from "../../hooks/use-health-examination-batches"
import type {
  ParticipantAttendanceStatus,
  ParticipantRosterStatus,
  ParticipantSortKey,
} from "../../types"
import { isParticipantImportAllowed } from "../../utils/participant-labels"
import { EmptyParticipantsState } from "./empty-participants-state"
import { ParticipantImportDialog } from "./participant-import-dialog"
import { ParticipantsTable } from "./participants-table"
import { ParticipantsToolbar } from "./participants-toolbar"

const PAGE_SIZE = 10

interface ParticipantsTabProps {
  batchId: string
  organizationId: string
  batch: {
    code: string
    status: string
    /** Version the Excel template is prepared for; sent back with the upload. */
    rowVersion: number
  }
  /** UX only: the backend decides. When false the list is not requested at all. */
  canRead?: boolean
  /** UX only: the backend decides. Hides the template and import actions when false. */
  canImport?: boolean
}

export function ParticipantsTab({
  batchId,
  organizationId,
  batch,
  canRead = true,
  canImport = false,
}: ParticipantsTabProps) {
  const [search, setSearch] = React.useState("")
  const [rosterStatus, setRosterStatus] = React.useState<ParticipantRosterStatus | undefined>()
  const [attendanceStatus, setAttendanceStatus] = React.useState<
    ParticipantAttendanceStatus | undefined
  >()
  const [page, setPage] = React.useState(1)
  const [sortKey, setSortKey] = React.useState<ParticipantSortKey>("id")
  const [sortBy, setSortBy] = React.useState<"ASC" | "DESC">("ASC")
  const [isImportOpen, setIsImportOpen] = React.useState(false)

  const { data, isLoading, isError, error, refetch } = useHealthExaminationBatchParticipants(
    organizationId,
    batchId,
    { search, rosterStatus, attendanceStatus, page, pageSize: PAGE_SIZE, sortKey, sortBy },
    { enabled: canRead }
  )
  const templateDownload = useDownloadParticipantImportTemplate(organizationId, batchId)

  const importAllowed = canImport && isParticipantImportAllowed(batch.status)
  const hasFilter = Boolean(search.trim() || rosterStatus || attendanceStatus)
  const participants = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages || 1
  const isEmpty = !isLoading && !isError && total === 0 && !hasFilter

  const resetPage = <T,>(set: (value: T) => void) => (value: T) => {
    set(value)
    setPage(1)
  }

  const handleSortChange = (key: ParticipantSortKey) => {
    if (key === sortKey) setSortBy((current) => (current === "ASC" ? "DESC" : "ASC"))
    else {
      setSortKey(key)
      setSortBy("ASC")
    }
    setPage(1)
  }

  const handleDownloadTemplate = () =>
    templateDownload.mutate({ batchCode: batch.code })

  const actions = importAllowed ? (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDownloadTemplate}
        disabled={templateDownload.isPending}
      >
        <Download className="mr-1.5 size-3.5" />
        {templateDownload.isPending ? "Đang tải..." : "Tải file mẫu"}
      </Button>
      <Button type="button" size="sm" onClick={() => setIsImportOpen(true)}>
        <Upload className="mr-1.5 size-3.5" />
        Nhập từ Excel
      </Button>
    </>
  ) : undefined

  if (!canRead) {
    return (
      <div role="status" className="rounded-lg border border-border bg-muted p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Không có quyền xem</p>
        <p className="mt-1">Tài khoản của bạn chưa được cấp quyền xem danh sách người khám.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!isEmpty && (
        <ParticipantsToolbar
          search={search}
          onSearchChange={resetPage(setSearch)}
          rosterStatus={rosterStatus}
          onRosterStatusChange={resetPage(setRosterStatus)}
          attendanceStatus={attendanceStatus}
          onAttendanceStatusChange={resetPage(setAttendanceStatus)}
          actions={actions}
        />
      )}

      {templateDownload.isError && (
        <p role="alert" className="text-xs text-destructive">
          Không thể tải file mẫu. Vui lòng thử lại.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">
            Không thể tải danh sách người khám.
          </p>
          <p role="alert" className="text-xs text-muted-foreground">
            {error instanceof Error ? error.message : "Đã xảy ra lỗi kết nối API."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-medium text-primary hover:underline"
          >
            Thử lại
          </button>
        </div>
      ) : isEmpty ? (
        <EmptyParticipantsState
          actions={actions}
          note={
            importAllowed || !canImport
              ? undefined
              : "Đợt khám này không còn nhận danh sách người khám mới."
          }
        />
      ) : (
        <ParticipantsTable
          participants={participants}
          totalItems={total}
          currentPage={page}
          pageSize={PAGE_SIZE}
          totalPages={totalPages}
          onPageChange={setPage}
          sortKey={sortKey}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      )}

      {importAllowed && (
        <ParticipantImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          organizationId={organizationId}
          batchId={batchId}
          rowVersion={batch.rowVersion}
          onDownloadTemplate={handleDownloadTemplate}
          isDownloadingTemplate={templateDownload.isPending}
        />
      )}
    </div>
  )
}
