import {
  Clock,
  Stethoscope,
  CreditCard,
  FlaskConical,
  CheckCircle2,
  XCircle,
} from "@/shared/ui/product-icon"
import { Badge } from "@/components/ui/badge"
import type { ReceptionWorklistStage } from "../lib/reception-worklist-stage"
import { cn } from "@/lib/utils"

interface ReceptionWorklistStageBadgeProps {
  stage: ReceptionWorklistStage
  className?: string
}

export function ReceptionWorklistStageBadge({ stage, className }: ReceptionWorklistStageBadgeProps) {
  switch (stage) {
    case "WAITING_CHECK_IN":
      return <Badge variant="outline" className={cn("bg-status-warning-bg text-status-warning border-status-warning/30 font-medium gap-1 text-[11px] px-2 py-0.5", className)}><Clock className="size-3 text-status-warning" /><span>Chờ tiếp nhận</span></Badge>
    case "WAITING_EXAMINATION":
      return <Badge variant="outline" className={cn("bg-status-in-progress-bg text-status-in-progress border-status-in-progress/30 font-medium gap-1 text-[11px] px-2 py-0.5", className)}><Clock className="size-3 text-status-in-progress" /><span>Chờ khám</span></Badge>
    case "IN_EXAMINATION":
      return <Badge variant="outline" className={cn("bg-selected text-primary border-primary/30 font-medium gap-1 text-[11px] px-2 py-0.5", className)}><Stethoscope className="size-3 text-primary animate-pulse" /><span>Đang khám</span></Badge>
    case "WAITING_PAYMENT":
      return <Badge variant="outline" className={cn("bg-status-warning-bg text-status-warning border-status-warning/30 font-medium gap-1 text-[11px] px-2 py-0.5", className)}><CreditCard className="size-3 text-status-warning" /><span>Chờ thu phí</span></Badge>
    case "WAITING_DIAGNOSTIC_RESULTS":
      return <Badge variant="outline" className={cn("bg-surface-alt text-secondary-foreground border-border font-medium gap-1 text-[11px] px-2 py-0.5", className)}><FlaskConical className="size-3 text-secondary-foreground" /><span>Chờ kết quả</span></Badge>
    case "READY_FOR_CONCLUSION":
      return <Badge variant="outline" className={cn("bg-surface-alt text-secondary-foreground border-border font-medium gap-1 text-[11px] px-2 py-0.5", className)}><FlaskConical className="size-3 text-secondary-foreground" /><span>Chờ kết luận</span></Badge>
    case "COMPLETED":
      return <Badge variant="outline" className={cn("bg-status-success-bg text-status-success border-status-success/30 font-medium gap-1 text-[11px] px-2 py-0.5", className)}><CheckCircle2 className="size-3 text-status-success" /><span>Hoàn tất</span></Badge>
    case "CANCELLED":
      return <Badge variant="outline" className={cn("bg-status-danger-bg text-status-danger border-status-danger/30 font-medium gap-1 text-[11px] px-2 py-0.5", className)}><XCircle className="size-3 text-status-danger" /><span>Đã hủy</span></Badge>
  }
}
