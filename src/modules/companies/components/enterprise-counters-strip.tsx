import * as React from "react"
import {
  Building2,
  Stethoscope,
  CheckCircle2,
  Layers,
  Users,
} from "lucide-react"
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
      icon: Building2,
      iconColor: "text-primary",
      borderColor: "border-border",
      hoverBorder: "hover:border-primary/40",
      activeRing: "ring-1 ring-primary border-primary/60",
      filterable: true,
    },
    {
      key: "IN_PROGRESS",
      label: "Đang tổ chức khám",
      count: counters?.inProgress ?? 12,
      icon: Stethoscope,
      iconColor: "text-status-in-progress",
      borderColor: "border-border",
      hoverBorder: "hover:border-status-in-progress/40",
      activeRing: "ring-1 ring-status-in-progress border-status-in-progress/60",
      filterable: true,
    },
    {
      key: "COMPLETED",
      label: "Đã hoàn tất đợt khám",
      count: counters?.completed ?? 20,
      icon: CheckCircle2,
      iconColor: "text-status-success",
      borderColor: "border-border",
      hoverBorder: "hover:border-status-success/40",
      activeRing: "ring-1 ring-status-success border-status-success/60",
      filterable: true,
    },
    {
      key: "BATCHES",
      label: "Tổng số đợt khám",
      count: counters?.totalBatches ?? 68,
      icon: Layers,
      iconColor: "text-status-warning",
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
      icon: Users,
      iconColor: "text-secondary-foreground",
      borderColor: "border-border",
      hoverBorder: "hover:border-border",
      activeRing: "ring-1 ring-secondary-foreground border-border",
      filterable: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => {
        const Icon = item.icon
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
              "flex items-center justify-between px-4 py-3 rounded-xl border bg-card text-left transition-all h-[76px]",
              item.filterable ? "cursor-pointer" : "cursor-default",
              item.borderColor,
              item.hoverBorder,
              isActive && item.activeRing,
              "hover:shadow-2xs"
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

            <div className="size-8.5 rounded-lg bg-surface-alt flex items-center justify-center shrink-0 border border-border/40">
              <Icon className={cn("size-4", item.iconColor)} />
            </div>
          </button>
        )
      })}
    </div>
  )
}
