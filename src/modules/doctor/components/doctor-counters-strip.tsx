import * as React from "react"
import {
  Clock,
  Stethoscope,
  FlaskConical,
  ClipboardList,
  CheckCircle2,
} from "@/shared/ui/product-icon"
import { DoctorCounters, DoctorEncounterStatus } from "../types"
import { cn } from "@/lib/utils"

interface DoctorCountersStripProps {
  counters?: DoctorCounters
  isLoading?: boolean
  activeStatus?: DoctorEncounterStatus | "ALL"
  onSelectStatus?: (status: DoctorEncounterStatus | "ALL") => void
}

interface CounterItem {
  key: DoctorEncounterStatus
  label: string
  count: number
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  activeRing: string
}

export function DoctorCountersStrip({
  counters,
  isLoading,
  activeStatus,
  onSelectStatus,
}: DoctorCountersStripProps) {
  const items: CounterItem[] = [
    {
      key: "WAITING_EXAM",
      label: "Chờ khám",
      count: counters?.waitingExam ?? 12,
      icon: Clock,
      iconBg: "bg-status-warning-bg",
      iconColor: "text-status-warning",
      activeRing: "ring-2 ring-status-warning/60 border-status-warning/40",
    },
    {
      key: "EXAMINING",
      label: "Đang khám",
      count: counters?.examining ?? 3,
      icon: Stethoscope,
      iconBg: "bg-status-in-progress-bg",
      iconColor: "text-status-in-progress",
      activeRing: "ring-2 ring-status-in-progress/60 border-status-in-progress/40",
    },
    {
      key: "WAITING_CLS",
      label: "Chờ CLS",
      count: counters?.waitingCls ?? 6,
      icon: FlaskConical,
      iconBg: "bg-status-cls-bg",
      iconColor: "text-status-cls",
      activeRing: "ring-2 ring-status-cls/60 border-status-cls/40",
    },
    {
      key: "WAITING_CONCLUSION",
      label: "Chờ kết luận",
      count: counters?.waitingConclusion ?? 4,
      icon: ClipboardList,
      iconBg: "bg-status-conclusion-bg",
      iconColor: "text-status-conclusion",
      activeRing: "ring-2 ring-status-conclusion/60 border-status-conclusion/40",
    },
    {
      key: "COMPLETED",
      label: "Hoàn tất",
      count: counters?.completed ?? 18,
      icon: CheckCircle2,
      iconBg: "bg-status-success-bg",
      iconColor: "text-status-success",
      activeRing: "ring-2 ring-status-success/60 border-status-success/40",
    },
  ]

  return (
    <div
      role="region"
      aria-label="Tổng quan tiến độ trong ngày"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      {items.map((item) => {
        const IconComponent = item.icon
        const isActive = activeStatus === item.key

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              if (onSelectStatus) {
                onSelectStatus(isActive ? "ALL" : item.key)
              }
            }}
            aria-pressed={isActive}
            className={cn(
              "flex items-center gap-3.5 rounded-xl border bg-card p-3.5 text-left transition-all hover:bg-hover/30 hover:border-border/80 cursor-pointer shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
              isActive ? item.activeRing : "border-border"
            )}
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg transition-transform",
                item.iconBg,
                item.iconColor
              )}
            >
              <IconComponent className="size-5" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-muted-foreground truncate">
                {item.label}
              </span>
              <span className="text-2xl font-bold tracking-tight text-foreground leading-none mt-1">
                {isLoading ? (
                  <span className="inline-block h-6 w-8 bg-muted animate-pulse rounded" />
                ) : (
                  item.count
                )}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
