import * as React from "react"
import { ReceptionCounters } from "../types"
import { cn } from "@/lib/utils"

interface ReceptionCountersStripProps {
  counters?: ReceptionCounters
  isLoading?: boolean
  onFilterStatus?: (statusKey: string) => void
  activeStatusKey?: string
}

export function ReceptionCountersStrip({
  counters,
  isLoading,
  onFilterStatus,
  activeStatusKey,
}: ReceptionCountersStripProps) {
  const items = [
    {
      key: "WAITING_CHECK_IN",
      label: "Chờ tiếp nhận",
      count: counters?.waitingReception ?? 8,
      borderColor: "border-border",
      hoverBorder: "hover:border-status-warning/40",
      activeRing: "ring-1 ring-status-warning border-status-warning/60",
    },
    {
      key: "IN_EXAMINATION",
      label: "Đang khám",
      count: counters?.examining ?? 3,
      borderColor: "border-border",
      hoverBorder: "hover:border-primary/40",
      activeRing: "ring-1 ring-primary border-primary/60",
    },
    {
      key: "WAITING_PAYMENT",
      label: "Chờ thu phí",
      count: counters?.waitingPayment ?? 2,
      borderColor: "border-border",
      hoverBorder: "hover:border-status-warning/40",
      activeRing: "ring-1 ring-status-warning border-status-warning/60",
    },
    {
      key: "WAITING_DIAGNOSTIC_RESULTS",
      label: "Chờ kết quả",
      count: counters?.waitingResult ?? 1,
      borderColor: "border-border",
      hoverBorder: "hover:border-border",
      activeRing: "ring-1 ring-secondary-foreground border-border",
    },
    {
      key: "COMPLETED",
      label: "Hoàn tất hôm nay",
      count: counters?.completedToday ?? 28,
      borderColor: "border-border",
      hoverBorder: "hover:border-status-success/40",
      activeRing: "ring-1 ring-status-success border-status-success/60",
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
