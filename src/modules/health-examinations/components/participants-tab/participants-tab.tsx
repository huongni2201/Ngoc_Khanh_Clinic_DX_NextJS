"use client"

import * as React from "react"
import { ParticipantsToolbar } from "./participants-toolbar"
import { ParticipantsTable } from "./participants-table"
import { EmptyParticipantsState } from "./empty-participants-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useHealthExaminationBatchParticipants } from "../../hooks/use-health-examination-batches"

interface ParticipantsTabProps {
  batchId: string
  organizationId?: string
  totalBatchParticipants: number
  onImportClick: () => void
  onDownloadTemplateClick: () => void
}

export function ParticipantsTab({
  batchId,
  organizationId,
  totalBatchParticipants,
  onImportClick,
  onDownloadTemplateClick,
}: ParticipantsTabProps) {
  const [search, setSearch] = React.useState("")
  const [organizationUnit, setDepartment] = React.useState("ALL")
  const [profileStatus, setProfileStatus] = React.useState("ALL")
  const [page, setPage] = React.useState(1)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleDepartmentChange = (val: string) => {
    setDepartment(val)
    setPage(1)
  }

  const handleProfileStatusChange = (val: string) => {
    setProfileStatus(val)
    setPage(1)
  }

  const { data, isLoading } = useHealthExaminationBatchParticipants(batchId, {
    search,
    organizationUnit,
    profileStatus,
    page,
    pageSize: 10,
  })

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

  // Show empty state if the batch truly has 0 participants and no search filter is applied
  if (totalBatchParticipants === 0 && !search && organizationUnit === "ALL" && profileStatus === "ALL") {
    return (
      <EmptyParticipantsState
        onImportClick={onImportClick}
        onDownloadTemplateClick={onDownloadTemplateClick}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* 1. Toolbar */}
      <ParticipantsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        organizationUnit={organizationUnit}
        onDepartmentChange={handleDepartmentChange}
        profileStatus={profileStatus}
        onProfileStatusChange={handleProfileStatusChange}
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



