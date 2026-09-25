"use client"

import * as React from "react"
import { Search, Filter, ChevronDown } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface HealthExaminationBatchToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (status: string) => void
  onFilterClick?: () => void
}

export function HealthExaminationBatchToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onFilterClick,
}: HealthExaminationBatchToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm đợt khám..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-9 text-xs sm:text-sm bg-background "
        />
      </div>

      {/* Filter controls */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-9 appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-xs font-medium text-foreground  outline-none hover:border-input focus:border-primary focus:ring-1 focus:ring-primary/20"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="IN_PROGRESS">Đang khám</option>
            <option value="COMPLETED">Đã hoàn thành</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onFilterClick}
          className="h-9 rounded-lg px-3 text-xs font-medium text-foreground hover:bg-hover "
        >
          <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
          Bộ lọc
        </Button>
      </div>
    </div>
  )
}
