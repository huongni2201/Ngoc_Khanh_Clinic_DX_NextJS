import { AlertCircle, CheckCircle2, Clock3, Hourglass, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { PaymentMethod, PaymentStatus } from "../types"

const statusConfig: Record<PaymentStatus, { label: string; icon: typeof Clock3; className: string }> = {
  PENDING: { label: "Chờ thu tiền", icon: Hourglass, className: "border-border bg-muted text-muted-foreground" },
  PAID: { label: "Đã thanh toán", icon: CheckCircle2, className: "border-border bg-muted text-foreground" },
  FAILED: { label: "Cần kiểm tra", icon: AlertCircle, className: "border-destructive/30 bg-destructive/10 text-destructive" },
  CANCELLED: { label: "Đã hủy", icon: XCircle, className: "border-destructive/30 bg-destructive/10 text-destructive" },
  REFUNDED: { label: "Đã hoàn tiền", icon: XCircle, className: "border-border bg-muted text-muted-foreground" },
}

export function PaymentStatusBadge({ status, paymentMethod }: { status: PaymentStatus; paymentMethod?: PaymentMethod }) {
  const config = statusConfig[status]
  const Icon = config.icon
  const label = status === "PENDING" && paymentMethod === "VIETQR" ? "Đang chờ chuyển khoản" : config.label
  return <Badge variant="outline" className={config.className}><Icon className="size-3.5" />{label}</Badge>
}
