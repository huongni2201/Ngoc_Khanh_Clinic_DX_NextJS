import * as React from "react"
import {
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  Stethoscope,
  XCircle,
  AlertTriangle,
} from "@/shared/ui/product-icon"
import { Badge } from "@/components/ui/badge"
import { AppointmentStatus } from "../types"
import { cn } from "@/lib/utils"

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus
  className?: string
}

export function AppointmentStatusBadge({
  status,
  className,
}: AppointmentStatusBadgeProps) {
  switch (status) {
    case "BOOKED":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-status-warning-bg text-status-warning border-status-warning/30 font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <Clock className="size-3 text-status-warning" />
          <span>Đang chờ</span>
        </Badge>
      )
    case "CONFIRMED":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-selected text-primary border-primary/30 font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <Calendar className="size-3 text-primary" />
          <span>Đã hẹn</span>
        </Badge>
      )
    case "ARRIVED":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-status-success-bg text-status-success border-status-success/30 font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <UserCheck className="size-3 text-status-success" />
          <span>Đã đến</span>
        </Badge>
      )
    case "CHECKED_IN":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-status-in-progress-bg text-status-in-progress border-status-in-progress/30 font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <CheckCircle2 className="size-3 text-status-in-progress" />
          <span>Đã tiếp nhận</span>
        </Badge>
      )
    case "EXAMINED":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-status-success-bg text-status-success border-status-success/30 font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <Stethoscope className="size-3 text-status-success" />
          <span>Đã khám</span>
        </Badge>
      )
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-status-danger-bg text-status-danger border-status-danger/30 font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <XCircle className="size-3 text-status-danger" />
          <span>Đã hủy</span>
        </Badge>
      )
    case "NO_SHOW":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-surface-alt text-muted-foreground border-border font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <AlertTriangle className="size-3 text-muted-foreground" />
          <span>Không đến</span>
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className={cn("text-[11px] px-2 py-0.5", className)}>
          <span>{status}</span>
        </Badge>
      )
  }
}
