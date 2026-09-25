import * as React from "react"
import { AppointmentCounters } from "../types"
import { cn } from "@/lib/utils"

interface AppointmentCountersStripProps {
  counters?: AppointmentCounters
  isLoading?: boolean
  onFilterStatus?: (statusKey: string) => void
  activeStatusKey?: string
}

export function AppointmentCountersStrip({
  counters,
  isLoading,
  onFilterStatus,
  activeStatusKey,
}: AppointmentCountersStripProps) {
  const items = [
    {
      key: "TODAY",
      label: "Lịch hẹn hôm nay",
      count: counters?.today ?? 0,
      borderColor: "border-border",
      hoverBorder: "hover:border-primary/40",
      activeRing: "ring-1 ring-primary border-primary/60",
    },
    {
      key: "CONFIRMED",
      label: "Đã xác nhận",
      count: counters?.confirmed ?? 0,
      borderColor: "border-border",
      hoverBorder: "hover:border-status-warning/40",
      activeRing: "ring-1 ring-status-warning border-status-warning/60",
    },
    {
      key: "ARRIVED",
      label: "Đã đến phòng khám",
      count: counters?.arrived ?? 0,
      borderColor: "border-border",
      hoverBorder: "hover:border-status-success/40",
      activeRing: "ring-1 ring-status-success border-status-success/60",
    },
    {
      key: "ORGANIZATION",
      label: "Đoàn đơn vị",
      count: counters?.organization ?? 0,
      borderColor: "border-border",
      hoverBorder: "hover:border-primary/40",
      activeRing: "ring-1 ring-primary border-primary/60",
    },
    {
      key: "EXAMINED",
      label: "Đã khám / Tiếp nhận",
      count: counters?.examined ?? 0,
      borderColor: "border-border",
      hoverBorder: "hover:border-border",
      activeRing: "ring-1 ring-secondary-foreground border-border",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item, index) => {
        const isActive = activeStatusKey === item.key

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onFilterStatus && onFilterStatus(item.key)}
            aria-pressed={isActive}
            className={cn(
              "flex h-[72px] items-center border bg-card px-4 py-3 text-left transition-colors cursor-pointer",
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

