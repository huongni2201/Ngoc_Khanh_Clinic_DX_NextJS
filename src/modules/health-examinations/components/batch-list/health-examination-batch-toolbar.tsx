"use client"

import { Plus } from "@/shared/ui/product-icon"
import { SearchField } from "@/shared/ui"
import { Button } from "@/components/ui/button"
import { BATCH_MAX_SEARCH_LENGTH } from "../../utils/batch-list-params"

interface HealthExaminationBatchToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  onCreateClick: () => void
}

export function HealthExaminationBatchToolbar({
  search,
  onSearchChange,
  onCreateClick,
}: HealthExaminationBatchToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <SearchField
        value={search}
        maxLength={BATCH_MAX_SEARCH_LENGTH}
        onChange={onSearchChange}
        placeholder="Tìm theo mã hoặc tên đợt khám..."
        label="Tìm đợt khám"
      />
      <Button type="button" onClick={onCreateClick}>
        <Plus className="size-4" />
        Tạo đợt khám
      </Button>
    </div>
  )
}
