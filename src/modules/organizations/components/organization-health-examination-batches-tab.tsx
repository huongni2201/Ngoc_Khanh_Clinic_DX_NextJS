"use client"

import * as React from "react"
import { useOrganizationHealthExaminationBatches } from "@/modules/health-examinations"
import { HealthExaminationBatchToolbar } from "./health-examination-batch-toolbar"
import { HealthExaminationBatchTable } from "./health-examination-batch-table"

interface OrganizationHealthExaminationBatchesTabProps {
  organizationId: string
  onCreateBatchClick?: () => void
}

export function OrganizationHealthExaminationBatchesTab({
  organizationId,
  onCreateBatchClick,
}: OrganizationHealthExaminationBatchesTabProps) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("ALL")

  const { data, isLoading } = useOrganizationHealthExaminationBatches(organizationId, {
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
        organizationId={organizationId}
        batches={batches}
        isLoading={isLoading}
        onCreateClick={onCreateBatchClick}
      />
    </div>
  )
}

