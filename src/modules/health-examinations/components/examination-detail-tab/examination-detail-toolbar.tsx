"use client"

import type { ReactNode } from "react"
import { Search } from "@/shared/ui/product-icon"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ExaminationStatusFilter } from "../../types"
import { EXAMINATION_STATUS_FILTER_LABELS } from "../../utils/examination-detail-labels"

const ALL = "ALL"
export const EXAMINATION_MAX_SEARCH_LENGTH = 100

const STATUS_ITEMS = { [ALL]: "Tất cả trạng thái", ...EXAMINATION_STATUS_FILTER_LABELS }

interface ExaminationDetailToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter?: ExaminationStatusFilter
  onStatusFilterChange: (value: ExaminationStatusFilter | undefined) => void
  /** Export and import actions; omitted when the account cannot use them. */
  actions?: ReactNode
}

export function ExaminationDetailToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  actions,
}: ExaminationDetailToolbarProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            maxLength={EXAMINATION_MAX_SEARCH_LENGTH}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Tìm người khám trong chi tiết khám"
            placeholder="Tìm theo mã người khám, họ tên, đơn vị..."
            className="h-9 w-full rounded-lg border-border bg-card pl-9 pr-4 text-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <Select
          items={STATUS_ITEMS}
          value={statusFilter ?? ALL}
          onValueChange={(value) =>
            onStatusFilterChange(
              value && value !== ALL ? (value as ExaminationStatusFilter) : undefined
            )
          }
        >
          <SelectTrigger aria-label="Lọc theo trạng thái khám" className="h-9 bg-card text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_ITEMS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      <p className="select-none text-xs text-muted-foreground">X = đã khám hạng mục</p>
    </div>
  )
}
