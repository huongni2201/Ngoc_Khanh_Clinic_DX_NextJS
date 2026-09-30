"use client"

import { Search } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"

interface HealthExaminationBatchToolbarProps {
  search: string
  onSearchChange: (value: string) => void
}

export function HealthExaminationBatchToolbar({
  search,
  onSearchChange,
}: HealthExaminationBatchToolbarProps) {
  return (
    <div className="pb-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          maxLength={100}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo mã hoặc tên đợt khám..."
          className="h-9 bg-background pl-9 text-xs sm:text-sm"
        />
      </div>
    </div>
  )
}
