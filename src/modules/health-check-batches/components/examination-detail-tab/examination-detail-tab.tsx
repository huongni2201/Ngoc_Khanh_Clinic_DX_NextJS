"use client"

import * as React from "react"
import { ExaminationDetailToolbar } from "./examination-detail-toolbar"
import { ExaminationMatrixTable } from "./examination-matrix-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useExamBatchMatrix } from "../../hooks/use-exam-batches"

interface ExaminationDetailTabProps {
  batchId: string
}

export function ExaminationDetailTab({ batchId }: ExaminationDetailTabProps) {
  const [search, setSearch] = React.useState("")
  const [department, setDepartment] = React.useState("ALL")
  const [examStatus, setExamStatus] = React.useState("ALL")
  const [page, setPage] = React.useState(1)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleDepartmentChange = (val: string) => {
    setDepartment(val)
    setPage(1)
  }

  const handleExamStatusChange = (val: string) => {
    setExamStatus(val)
    setPage(1)
  }

  const { data, isLoading } = useExamBatchMatrix(batchId, {
    search,
    department,
    examStatus,
    page,
    pageSize: 10,
  })

  const items = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAll = () => {
    const currentIds = items.map((i) => i.id)
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
      <ExaminationDetailToolbar
        search={search}
        onSearchChange={handleSearchChange}
        department={department}
        onDepartmentChange={handleDepartmentChange}
        examStatus={examStatus}
        onExamStatusChange={handleExamStatusChange}
      />

      {/* 2. Matrix Table / Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-96 w-full rounded-xl" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
      ) : (
        <ExaminationMatrixTable
          items={items}
          totalItems={total}
          currentPage={page}
          pageSize={10}
          totalPages={totalPages}
          onPageChange={setPage}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
      )}
    </div>
  )
}
