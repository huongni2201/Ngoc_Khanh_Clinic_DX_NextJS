import * as React from "react"
import {
  Clock,
  UserCheck,
  Stethoscope,
  CreditCard,
  FlaskConical,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ReceptionStatus } from "../types"
import { cn } from "@/lib/utils"

interface ReceptionStatusBadgeProps {
  status: ReceptionStatus
  className?: string
}

export function ReceptionStatusBadge({
  status,
  className,
}: ReceptionStatusBadgeProps) {
  switch (status) {
    case "WAITING_RECEPTION":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-status-warning-bg text-status-warning border-status-warning/30 font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <Clock className="size-3 text-status-warning" />
          <span>Chờ tiếp nhận</span>
        </Badge>
      )
    case "RECEIVED":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-status-in-progress-bg text-status-in-progress border-status-in-progress/30 font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <UserCheck className="size-3 text-status-in-progress" />
          <span>Đã tiếp nhận</span>
        </Badge>
      )
    case "WAITING_EXAM":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-status-in-progress-bg text-status-in-progress border-status-in-progress/30 font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <Clock className="size-3 text-status-in-progress" />
          <span>Chờ khám</span>
        </Badge>
      )
    case "EXAMINING":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-selected text-primary border-primary/30 font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <Stethoscope className="size-3 text-primary animate-pulse" />
          <span>Đang khám</span>
        </Badge>
      )
    case "WAITING_PAYMENT":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-status-warning-bg text-status-warning border-status-warning/30 font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <CreditCard className="size-3 text-status-warning" />
          <span>Chờ thu phí</span>
        </Badge>
      )
    case "WAITING_RESULT":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-surface-alt text-secondary-foreground border-border font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <FlaskConical className="size-3 text-secondary-foreground" />
          <span>Chờ kết quả</span>
        </Badge>
      )
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-status-success-bg text-status-success border-status-success/30 font-medium gap-1 text-[11px] px-2 py-0.5",
            className
          )}
        >
          <CheckCircle2 className="size-3 text-status-success" />
          <span>Hoàn tất</span>
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
    default:
      return (
        <Badge variant="outline" className={cn("text-[11px] px-2 py-0.5", className)}>
          <span>{status}</span>
        </Badge>
      )
  }
}
