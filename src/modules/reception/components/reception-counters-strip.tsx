import * as React from "react"
import {
  Users,
  Stethoscope,
  CreditCard,
  FlaskConical,
  CheckCircle2,
} from "lucide-react"
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
      key: "WAITING_RECEPTION",
      label: "Chờ tiếp nhận",
      count: counters?.waitingReception ?? 8,
      icon: Users,
      iconColor: "text-status-warning",
      bgColor: "bg-card",
      borderColor: "border-border",
      hoverBorder: "hover:border-status-warning/40",
      activeRing: "ring-1 ring-status-warning border-status-warning/60",
    },
    {
      key: "EXAMINING",
      label: "Đang khám",
      count: counters?.examining ?? 3,
      icon: Stethoscope,
      iconColor: "text-primary",
      bgColor: "bg-card",
      borderColor: "border-border",
      hoverBorder: "hover:border-primary/40",
      activeRing: "ring-1 ring-primary border-primary/60",
    },
    {
      key: "WAITING_PAYMENT",
      label: "Chờ thu phí",
      count: counters?.waitingPayment ?? 2,
      icon: CreditCard,
      iconColor: "text-status-warning",
      bgColor: "bg-card",
      borderColor: "border-border",
      hoverBorder: "hover:border-status-warning/40",
      activeRing: "ring-1 ring-status-warning border-status-warning/60",
    },
    {
      key: "WAITING_RESULT",
      label: "Chờ kết quả",
      count: counters?.waitingResult ?? 1,
      icon: FlaskConical,
      iconColor: "text-secondary-foreground",
      bgColor: "bg-card",
      borderColor: "border-border",
      hoverBorder: "hover:border-border",
      activeRing: "ring-1 ring-secondary-foreground border-border",
    },
    {
      key: "COMPLETED",
      label: "Hoàn tất hôm nay",
      count: counters?.completedToday ?? 28,
      icon: CheckCircle2,
      iconColor: "text-status-success",
      bgColor: "bg-card",
      borderColor: "border-border",
      hoverBorder: "hover:border-status-success/40",
      activeRing: "ring-1 ring-status-success border-status-success/60",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeStatusKey === item.key

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onFilterStatus && onFilterStatus(item.key)}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl border bg-card text-left transition-all h-[76px] cursor-pointer",
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
