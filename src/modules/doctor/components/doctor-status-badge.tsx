import * as React from "react"
import { DoctorEncounterStatus } from "../types"
import { cn } from "@/lib/utils"

interface DoctorStatusBadgeProps {
  status: DoctorEncounterStatus
  className?: string
}

export function DoctorStatusBadge({
  status,
  className,
}: DoctorStatusBadgeProps) {
  switch (status) {
    case "WAITING_EXAM":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-status-warning-bg text-status-warning border border-status-warning/20",
            className
          )}
        >
          <span className="size-1.5 rounded-full bg-status-warning shrink-0" aria-hidden="true" />
          <span>Chờ khám</span>
        </span>
      )
    case "EXAMINING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-status-in-progress-bg text-status-in-progress border border-status-in-progress/20",
            className
          )}
        >
          <span className="size-1.5 rounded-full bg-status-in-progress shrink-0 animate-pulse" aria-hidden="true" />
          <span>Đang khám</span>
        </span>
      )
    case "WAITING_DIAGNOSTIC_RESULTS":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-status-diagnostic-bg text-status-diagnostic border border-status-diagnostic/20",
            className
          )}
        >
          <span className="size-1.5 rounded-full bg-status-diagnostic shrink-0" aria-hidden="true" />
          <span>Chờ kết quả</span>
        </span>
      )
    case "WAITING_CONCLUSION":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-status-conclusion-bg text-status-conclusion border border-status-conclusion/20",
            className
          )}
        >
          <span className="size-1.5 rounded-full bg-status-conclusion shrink-0" aria-hidden="true" />
          <span>Chờ kết luận</span>
        </span>
      )
    case "COMPLETED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-status-success-bg text-status-success border border-status-success/20",
            className
          )}
        >
          <span className="size-1.5 rounded-full bg-status-success shrink-0" aria-hidden="true" />
          <span>Hoàn tất</span>
        </span>
      )
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground border border-border",
            className
          )}
        >
          <span>{status}</span>
        </span>
      )
  }
}
