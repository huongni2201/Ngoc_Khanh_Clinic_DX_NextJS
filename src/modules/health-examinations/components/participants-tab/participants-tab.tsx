"use client"

import * as React from "react"
import { ParticipantsToolbar } from "./participants-toolbar"
import { ParticipantsTable } from "./participants-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useHealthExaminationBatchParticipants } from "../../hooks/use-health-examination-batches"

interface ParticipantsTabProps {
  batchId: string
  organizationId: string
}

export function ParticipantsTab({
  batchId,
  organizationId,
}: ParticipantsTabProps) {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const { data, isLoading, isError, error, refetch } = useHealthExaminationBatchParticipants(
    organizationId,
    batchId,
    {
      search,
      page,
      pageSize: 10,
    }
  )

  const participants = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  // Handle row selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Handle select all currently rendered rows
  const handleToggleSelectAll = () => {
    const currentIds = participants.map((e) => e.id)
    const isAllSelected = currentIds.every((id) => selectedIds.includes(id))

    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])))
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. Toolbar */}
      <ParticipantsToolbar
        search={search}
        onSearchChange={handleSearchChange}
      />

      {/* 2. Table / Loading Skeleton */}
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
            Không thể tải danh sách nhân viên.
          </p>
          <p className="text-xs text-muted-foreground">
            {(error as Error)?.message || "Đã xảy ra lỗi kết nối API."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-medium text-primary hover:underline"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <ParticipantsTable
          participants={participants}
          totalItems={total}
          currentPage={page}
          pageSize={10}
          totalPages={totalPages}
          onPageChange={setPage}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          batchId={batchId}
          organizationId={organizationId}
        />
      )}
    </div>
  )
}



