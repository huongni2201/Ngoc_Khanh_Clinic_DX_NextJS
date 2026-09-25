"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatVND } from "@/shared/ui"
import { usePayments } from "../hooks/use-billing"
import type { Invoice } from "../types"

export function PaymentCompletionNotifier() {
  const { data, isSuccess } = usePayments({ status: "PAID", page: 1, pageSize: 10 })
  const seenRef = React.useRef<Set<string> | null>(null)
  const [notification, setNotification] = React.useState<Invoice | null>(null)

  React.useEffect(() => {
    if (!isSuccess || !data) return
    const ids = data.data.map((invoice) => invoice.id)
    if (!seenRef.current) {
      seenRef.current = new Set(ids)
      return
    }
    const unseen = data.data.find((invoice) => !seenRef.current?.has(invoice.id))
    ids.forEach((id) => seenRef.current?.add(id))
    if (unseen) setNotification(unseen)
  }, [data, isSuccess])

  React.useEffect(() => {
    if (!notification) return
    const timer = window.setTimeout(() => setNotification(null), 8000)
    return () => window.clearTimeout(timer)
  }, [notification])

  if (!notification) return null
  return <div role="status" aria-live="polite" className="fixed right-5 bottom-5 z-40 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4 shadow-lg"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Thanh toán thành công</p><p className="mt-1 truncate text-xs text-muted-foreground">{notification.patientName} · {formatVND(notification.total)}</p><div className="mt-3 flex items-center gap-2"><Button size="sm" nativeButton={false} render={<Link href="/billing?status=PAID" />}>Xem danh sách</Button><Button size="sm" variant="ghost" onClick={() => setNotification(null)}>Đóng</Button></div></div><Button size="icon-xs" variant="ghost" aria-label="Đóng thông báo thanh toán" onClick={() => setNotification(null)}><X className="size-4" /></Button></div></div>
}
