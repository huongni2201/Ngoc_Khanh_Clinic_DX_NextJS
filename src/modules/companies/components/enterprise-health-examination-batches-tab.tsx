"use client"

import * as React from "react"
import { useEnterpriseHealthExaminationBatches } from "@/modules/health-examinations"
import { HealthExaminationBatchToolbar } from "./health-examination-batch-toolbar"
import { HealthExaminationBatchTable } from "./health-examination-batch-table"

interface EnterpriseHealthExaminationBatchesTabProps {
  enterpriseId: string
  onCreateBatchClick?: () => void
}

export function EnterpriseHealthExaminationBatchesTab({
  enterpriseId,
  onCreateBatchClick,
}: EnterpriseHealthExaminationBatchesTabProps) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("ALL")

  const { data, isLoading } = useEnterpriseHealthExaminationBatches(enterpriseId, {
    search,
    status,
  })

  const batches = data?.data || []

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <HealthExaminationBatchToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      {/* Batches Table matching reference visual */}
      <HealthExaminationBatchTable
        enterpriseId={enterpriseId}
        batches={batches}
        isLoading={isLoading}
        onCreateClick={onCreateBatchClick}
      />
    </div>
  )
}
