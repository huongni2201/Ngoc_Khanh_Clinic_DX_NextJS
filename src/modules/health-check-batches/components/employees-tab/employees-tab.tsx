"use client"

import * as React from "react"
import { EmployeesToolbar } from "./employees-toolbar"
import { EmployeesTable } from "./employees-table"
import { EmptyEmployeesState } from "./empty-employees-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useHealthExaminationBatchEmployees } from "../../hooks/use-health-examination-batches"

interface EmployeesTabProps {
  batchId: string
  enterpriseId?: string
  totalBatchEmployees: number
  onImportClick: () => void
  onDownloadTemplateClick: () => void
}

export function EmployeesTab({
  batchId,
  enterpriseId,
  totalBatchEmployees,
  onImportClick,
  onDownloadTemplateClick,
}: EmployeesTabProps) {
  const [search, setSearch] = React.useState("")
  const [department, setDepartment] = React.useState("ALL")
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

  const { data, isLoading } = useHealthExaminationBatchEmployees(batchId, {
    search,
    department,
    profileStatus,
    page,
    pageSize: 10,
  })

  const employees = data?.data || []
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
    const currentIds = employees.map((e) => e.id)
    const isAllSelected = currentIds.every((id) => selectedIds.includes(id))

    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])))
    }
  }

  // Show empty state if the batch truly has 0 employees and no search filter is applied
  if (totalBatchEmployees === 0 && !search && department === "ALL" && profileStatus === "ALL") {
    return (
      <EmptyEmployeesState
        onImportClick={onImportClick}
        onDownloadTemplateClick={onDownloadTemplateClick}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* 1. Toolbar */}
      <EmployeesToolbar
        search={search}
        onSearchChange={handleSearchChange}
        department={department}
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
        <EmployeesTable
          employees={employees}
          totalItems={total}
          currentPage={page}
          pageSize={10}
          totalPages={totalPages}
          onPageChange={setPage}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          batchId={batchId}
          enterpriseId={enterpriseId}
        />
      )}
    </div>
  )
}
