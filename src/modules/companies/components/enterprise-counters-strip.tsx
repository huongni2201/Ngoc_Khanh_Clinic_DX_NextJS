import * as React from "react"
import { EnterpriseCounters } from "../types"
import { cn } from "@/lib/utils"

interface EnterpriseCountersStripProps {
  counters?: EnterpriseCounters
  isLoading?: boolean
  onFilterStatus?: (statusKey: string) => void
  activeStatusKey?: string
}

export function EnterpriseCountersStrip({
  counters,
  isLoading,
  onFilterStatus,
  activeStatusKey = "ALL",
}: EnterpriseCountersStripProps) {
  const items = [
    {
      key: "ALL",
      label: "Tổng doanh nghiệp",
      count: counters?.total ?? 32,
      borderColor: "border-border",
      hoverBorder: "hover:border-primary/40",
      activeRing: "ring-1 ring-primary border-primary/60",
      filterable: true,
    },
    {
      key: "IN_PROGRESS",
      label: "Đang tổ chức khám",
      count: counters?.inProgress ?? 12,
      borderColor: "border-border",
      hoverBorder: "hover:border-status-in-progress/40",
      activeRing: "ring-1 ring-status-in-progress border-status-in-progress/60",
      filterable: true,
    },
    {
      key: "COMPLETED",
      label: "Đã hoàn tất đợt khám",
      count: counters?.completed ?? 20,
      borderColor: "border-border",
      hoverBorder: "hover:border-status-success/40",
      activeRing: "ring-1 ring-status-success border-status-success/60",
      filterable: true,
    },
    {
      key: "BATCHES",
      label: "Tổng số đợt khám",
      count: counters?.totalBatches ?? 68,
      borderColor: "border-border",
      hoverBorder: "hover:border-status-warning/40",
      activeRing: "ring-1 ring-status-warning border-status-warning/60",
      filterable: false,
    },
    {
      key: "EMPLOYEES",
      label: "Nhân sự dự kiến khám",
      count: counters?.estimatedEmployees
        ? counters.estimatedEmployees.toLocaleString("vi-VN")
        : "1.420",
      borderColor: "border-border",
      hoverBorder: "hover:border-border",
      activeRing: "ring-1 ring-secondary-foreground border-border",
      filterable: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item, index) => {
        // In Reception & Appointments, default ALL state does not show an active ring on the first card
        const isActive = activeStatusKey === item.key && activeStatusKey !== "ALL"

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              if (item.filterable && onFilterStatus) {
                onFilterStatus(item.key)
              }
            }}
            className={cn(
              "flex h-[72px] items-center border bg-card px-4 py-3 text-left transition-colors",
              item.filterable ? "cursor-pointer" : "cursor-default",
              item.borderColor,
              item.hoverBorder,
              isActive && item.activeRing,
              index > 0 && "-ml-px"
            )}
          >
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xl font-bold text-foreground leading-none tracking-tight">
                {isLoading ? (
                  <span className="inline-block size-5 bg-surface-alt animate-pulse rounded" />
                ) : (
                  item.count
                )}
              </span>
              <span className="text-xs text-secondary-foreground mt-1 truncate font-medium">
                {item.label}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
