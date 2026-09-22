"use client"

import * as React from "react"
import { useEnterpriseExamBatches } from "@/modules/health-check-batches"
import { ExamBatchToolbar } from "./exam-batch-toolbar"
import { ExamBatchTable } from "./exam-batch-table"

interface EnterpriseExamBatchesTabProps {
  enterpriseId: string
  onCreateBatchClick?: () => void
}

export function EnterpriseExamBatchesTab({
  enterpriseId,
  onCreateBatchClick,
}: EnterpriseExamBatchesTabProps) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("ALL")

  const { data, isLoading } = useEnterpriseExamBatches(enterpriseId, {
    search,
    status,
  })

  const batches = data?.data || []

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <ExamBatchToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      {/* Batches Table matching reference visual */}
      <ExamBatchTable
        enterpriseId={enterpriseId}
        batches={batches}
        isLoading={isLoading}
        onCreateClick={onCreateBatchClick}
      />
    </div>
  )
}
