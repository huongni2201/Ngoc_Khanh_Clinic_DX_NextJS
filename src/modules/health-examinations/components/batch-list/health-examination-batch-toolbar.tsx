"use client"

import { Plus, Search } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          maxLength={BATCH_MAX_SEARCH_LENGTH}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo mã hoặc tên đợt khám..."
          aria-label="Tìm đợt khám"
          className="h-9 bg-background pl-9 text-xs sm:text-sm"
        />
      </div>
      <Button type="button" onClick={onCreateClick}>
        <Plus className="mr-1.5 size-3.5" />
        Tạo đợt khám
      </Button>
    </div>
  )
}
