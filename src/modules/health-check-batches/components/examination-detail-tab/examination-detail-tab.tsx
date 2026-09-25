"use client"

import * as React from "react"
import { AlertCircle, RefreshCw } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ExaminationDetailToolbar } from "./examination-detail-toolbar"
import { ExaminationMatrixTable } from "./examination-matrix-table"
import { useHealthExaminationBatchMatrix } from "../../hooks/use-health-examination-batches"

interface ExaminationDetailTabProps {
  batchId: string
}

export function ExaminationDetailTab({ batchId }: ExaminationDetailTabProps) {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [department, setDepartment] = React.useState("ALL")
  const [examStatus, setExamStatus] = React.useState("ALL")
  const [page, setPage] = React.useState(1)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const handleSearchChange = (val: string) => {
    setSearch(val)
  }

  const handleDepartmentChange = (val: string) => {
    setDepartment(val)
    setPage(1)
  }

  const handleExamStatusChange = (val: string) => {
    setExamStatus(val)
    setPage(1)
  }

  const { data, isLoading, isError, refetch } = useHealthExaminationBatchMatrix(batchId, {
    search: debouncedSearch,
    department,
    examStatus,
    page,
    pageSize: 10,
  })

  const categoryColumns = data?.items || []
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

      {/* 2. Error State */}
      {isError ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
          <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="size-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Không thể tải chi tiết khám.
          </p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Đã xảy ra lỗi khi tải ma trận chi tiết khám của đợt khám này. Vui lòng thử lại.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs h-8 "
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Thử lại
          </Button>
        </div>
      ) : isLoading ? (
        /* 3. Loading Skeleton */
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card  overflow-hidden p-4 space-y-3">
            <Skeleton className="h-9 w-full rounded-md" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
      ) : (
        /* 4. Matrix Table */
        <ExaminationMatrixTable
          categoryColumns={categoryColumns}
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
