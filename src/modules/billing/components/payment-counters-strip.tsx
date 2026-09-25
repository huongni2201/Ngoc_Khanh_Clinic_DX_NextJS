"use client"

import { AlertCircle, CheckCircle2, Hourglass, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PaymentCounters, PaymentStatusFilter } from "../types"

interface PaymentCountersStripProps {
  counters?: PaymentCounters
  isLoading: boolean
  activeStatus: PaymentStatusFilter
  onFilter: (status: PaymentStatusFilter) => void
}

const cards = [
  { key: "PENDING" as const, label: "Chờ thu tiền", icon: Hourglass, value: "pending" as const },
  { key: "ATTENTION" as const, label: "Cần kiểm tra", icon: AlertCircle, value: "attention" as const },
  { key: "PAID_TODAY" as const, label: "Đã thanh toán hôm nay", icon: CheckCircle2, value: "paidToday" as const },
]

export function PaymentCountersStrip({ counters, isLoading, activeStatus, onFilter }: PaymentCountersStripProps) {
  return <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{cards.map(({ key, label, icon: Icon, value }) => <Card key={key} className={activeStatus === key ? "border-primary ring-1 ring-primary/20" : "border-border"}><CardContent className="p-0"><Button variant="ghost" className="h-auto w-full justify-start gap-3 rounded-lg p-4 text-left" aria-pressed={activeStatus === key} onClick={() => onFilter(activeStatus === key ? "ALL" : key)}><span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-primary"><Icon className="size-4" /></span><span className="min-w-0"><span className="block truncate text-xs text-muted-foreground">{label}</span><span className="mt-1 block text-xl font-semibold text-foreground">{isLoading ? <Loader2 className="size-4 animate-spin" /> : counters?.[value] ?? 0}</span></span></Button></CardContent></Card>)}</div>
}
