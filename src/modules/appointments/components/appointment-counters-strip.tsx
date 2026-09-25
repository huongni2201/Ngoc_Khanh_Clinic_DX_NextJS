import * as React from "react"
import {
  Calendar,
  CheckCircle2,
  UserCheck,
  Building2,
  Stethoscope,
} from "lucide-react"
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
      icon: Calendar,
      iconColor: "text-primary",
      borderColor: "border-border",
      hoverBorder: "hover:border-primary/40",
      activeRing: "ring-1 ring-primary border-primary/60",
    },
    {
      key: "CONFIRMED",
      label: "Đã xác nhận",
      count: counters?.confirmed ?? 0,
      icon: CheckCircle2,
      iconColor: "text-status-warning",
      borderColor: "border-border",
      hoverBorder: "hover:border-status-warning/40",
      activeRing: "ring-1 ring-status-warning border-status-warning/60",
    },
    {
      key: "ARRIVED",
      label: "Đã đến phòng khám",
      count: counters?.arrived ?? 0,
      icon: UserCheck,
      iconColor: "text-status-success",
      borderColor: "border-border",
      hoverBorder: "hover:border-status-success/40",
      activeRing: "ring-1 ring-status-success border-status-success/60",
    },
    {
      key: "ENTERPRISE",
      label: "Đoàn doanh nghiệp",
      count: counters?.enterprise ?? 0,
      icon: Building2,
      iconColor: "text-primary",
      borderColor: "border-border",
      hoverBorder: "hover:border-primary/40",
      activeRing: "ring-1 ring-primary border-primary/60",
    },
    {
      key: "EXAMINED",
      label: "Đã khám / Tiếp nhận",
      count: counters?.examined ?? 0,
      icon: Stethoscope,
      iconColor: "text-secondary-foreground",
      borderColor: "border-border",
      hoverBorder: "hover:border-border",
      activeRing: "ring-1 ring-secondary-foreground border-border",
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
