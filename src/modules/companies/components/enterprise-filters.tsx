"use client"

import * as React from "react"
import { Search, Filter } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

interface EnterpriseFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  onToggleAdvancedFilter?: () => void
}

export function EnterpriseFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onToggleAdvancedFilter,
}: EnterpriseFiltersProps) {
  // Local state for debounced search
  const [searchValue, setSearchValue] = React.useState(search)
  const [prevSearch, setPrevSearch] = React.useState(search)

  if (search !== prevSearch) {
    setPrevSearch(search)
    setSearchValue(search)
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== search) {
        onSearchChange(searchValue)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, search, onSearchChange])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Tìm theo tên doanh nghiệp, mã, người liên hệ..."
          className="h-10 w-full rounded-lg border-border bg-card pl-10 pr-4 text-xs text-foreground  placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Right Filters */}
      <div className="flex items-center gap-3">
        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(val) => onStatusChange(val || "ALL")}
        >
          <SelectTrigger className="h-10 min-w-36 rounded-lg border-border bg-card px-3 text-xs text-foreground ">
            <SelectValue placeholder="Trạng thái">
              {status === "IN_PROGRESS"
                ? "Đang khám"
                : status === "COMPLETED"
                ? "Đã khám"
                : "Trạng thái"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end" className="text-xs">
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="IN_PROGRESS">Đang khám</SelectItem>
            <SelectItem value="COMPLETED">Đã khám</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Button */}
        <Button
          type="button"
          variant="outline"
          onClick={onToggleAdvancedFilter}
          className="h-10 rounded-lg border-border bg-card px-3.5 text-xs font-medium text-secondary-foreground  hover:bg-hover hover:text-foreground"
        >
          <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
          Bộ lọc
        </Button>
      </div>
    </div>
  )
}
