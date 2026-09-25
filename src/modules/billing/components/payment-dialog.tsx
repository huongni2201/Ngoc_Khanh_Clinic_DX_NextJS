"use client"

import * as React from "react"
import { AlertCircle, Banknote, CheckCircle2, Clock3, Copy, Loader2, QrCode } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatVND } from "@/shared/ui"
import { useInvoice, useProcessCashPayment, useStartTransferPayment } from "../hooks/use-billing"
import type { BillableEncounter, Invoice } from "../types"

export interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  encounter: BillableEncounter | null
  onPaid?: (invoice: Invoice) => void
}

export function PaymentDialog({ open, onOpenChange, encounter, onPaid }: PaymentDialogProps) {
  const { data: invoice, isLoading, isError, error, refetch } = useInvoice(encounter, open)
  const cashMutation = useProcessCashPayment()
  const transferMutation = useStartTransferPayment()
  const [method, setMethod] = React.useState<"CASH" | "VIETQR">("CASH")
  const [copied, setCopied] = React.useState(false)
  const [mutationError, setMutationError] = React.useState<string | null>(null)
  const announcedPaidRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (invoice?.paymentStatus === "PAID") {
      const paidKey = `${invoice.id}:${invoice.paidAt ?? invoice.updatedAt}`
      if (announcedPaidRef.current !== paidKey) {
        announcedPaidRef.current = paidKey
        onPaid?.(invoice)
      }
    }
  }, [invoice, onPaid])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCopied(false)
      setMethod("CASH")
      setMutationError(null)
      announcedPaidRef.current = null
    }
    onOpenChange(nextOpen)
  }

  if (!encounter) return null

  const isMutating = cashMutation.isPending || transferMutation.isPending
  const handleCopy = async () => {
    if (!invoice?.transferIntent?.transferContent) return
    try {
      await navigator.clipboard?.writeText(invoice.transferIntent.transferContent)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setMutationError("Không thể sao chép nội dung chuyển khoản")
    }
  }

  const handleCash = async () => {
    try {
      setMutationError(null)
      await cashMutation.mutateAsync({ encounterId: encounter.id })
    } catch (caught) {
      setMutationError(caught instanceof Error ? caught.message : "Không thể xác nhận thanh toán")
    }
  }

  const handleTransfer = async () => {
    try {
      setMutationError(null)
      await transferMutation.mutateAsync({ encounter })
    } catch (caught) {
      setMutationError(caught instanceof Error ? caught.message : "Không thể tạo yêu cầu chuyển khoản")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex w-full max-w-[calc(100%-2rem)] max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl md:max-w-4xl">
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle className="text-xl">Thu phí khám bệnh</DialogTitle>
          <DialogDescription>Theo dõi trạng thái xác nhận từ hệ thống thanh toán.</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-x-hidden overflow-y-auto lg:grid-cols-[1.35fr_1fr]">
          <section className="min-w-0 space-y-4 border-b border-border p-6 lg:border-r lg:border-b-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{encounter.patientName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {encounter.patientCode} · Lượt khám {encounter.encounterCode}
                </p>
              </div>
              {invoice && (
                <Badge variant="outline">
                  {invoice.paymentStatus === "PAID" ? "Đã thanh toán" : invoice.paymentStatus === "PENDING" && invoice.paymentMethod === "VIETQR" ? "Đang chờ chuyển khoản" : "Chờ thu tiền"}
                </Badge>
              )}
            </div>

            {isLoading && <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Đang tải chi tiết khoản thu...</div>}
            {isError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Không thể tải khoản thu</AlertTitle>
                <AlertDescription className="flex items-center justify-between gap-3">
                  <span>{(error as Error)?.message ?? "Vui lòng thử lại."}</span>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>Thử lại</Button>
                </AlertDescription>
              </Alert>
            )}
            {invoice && (
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader><TableRow><TableHead>Dịch vụ</TableHead><TableHead className="text-right">Thành tiền</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-normal break-words"><div className="font-medium">{item.name}</div><div className="text-xs text-muted-foreground">SL {item.quantity}</div></TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatVND(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="space-y-2 border-t border-border bg-muted/40 p-4 text-sm">
                  <div className="flex justify-between text-muted-foreground"><span>Tạm tính</span><span>{formatVND(invoice.subtotal)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Giảm giá</span><span>{formatVND(invoice.discount)}</span></div>
                  <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Tổng thanh toán</span><span className="font-mono text-base text-primary">{formatVND(invoice.total)}</span></div>
                </div>
              </div>
            )}
          </section>

          <section className="min-w-0 space-y-4 p-6">
            {mutationError && <Alert variant="destructive"><AlertCircle className="size-4" /><AlertTitle>Không thể xử lý thanh toán</AlertTitle><AlertDescription>{mutationError}</AlertDescription></Alert>}
            {invoice?.paymentStatus === "PAID" && (
              <Alert className="border-border bg-muted/40">
                <CheckCircle2 className="size-4 text-primary" />
                <AlertTitle>Thanh toán thành công</AlertTitle>
                <AlertDescription>Khoản thu đã được hệ thống xác nhận{invoice.paidAt ? ` lúc ${new Date(invoice.paidAt).toLocaleString("vi-VN")}` : ""}.</AlertDescription>
              </Alert>
            )}

            {invoice?.paymentStatus === "PENDING" && invoice.paymentMethod === "VIETQR" && (
              <div className="space-y-4 rounded-lg border border-border bg-muted/40 p-4">
                <div className="flex items-start gap-3"><Clock3 className="mt-0.5 size-5 text-primary" /><div><p className="font-semibold">Đang chờ ngân hàng xác nhận</p><p className="mt-1 text-xs text-muted-foreground">Bạn có thể đóng màn hình và tiếp tục phục vụ bệnh nhân khác. Trạng thái sẽ được cập nhật tự động.</p></div></div>
                {invoice.transferIntent?.qrCodeUrl ? (
                  // The QR URL is supplied by the payment backend and may be a data URL.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={invoice.transferIntent.qrCodeUrl} alt="Mã QR thanh toán" className="mx-auto size-44 rounded-md border border-border bg-card p-2" />
                ) : <div className="rounded-md border border-dashed border-border bg-card p-4 text-center text-sm text-muted-foreground">Chưa nhận được mã QR từ hệ thống thanh toán.</div>}
                <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Nội dung chuyển khoản</span><span className="font-mono font-medium">{invoice.transferIntent?.transferContent}</span></div>{invoice.transferIntent?.bankName && <div className="flex justify-between"><span className="text-muted-foreground">Ngân hàng</span><span>{invoice.transferIntent.bankName}</span></div>}</div>
                <Button variant="outline" className="w-full" onClick={handleCopy}><Copy className="size-4" />{copied ? "Đã sao chép" : "Sao chép nội dung"}</Button>
              </div>
            )}

            {invoice?.paymentStatus === "PENDING" && invoice.paymentMethod !== "VIETQR" && (
              <>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Phương thức thanh toán">
                  <Button type="button" variant={method === "CASH" ? "default" : "outline"} onClick={() => setMethod("CASH")} aria-pressed={method === "CASH"}><Banknote className="size-4" />Tiền mặt</Button>
                  <Button type="button" variant={method === "VIETQR" ? "default" : "outline"} onClick={() => setMethod("VIETQR")} aria-pressed={method === "VIETQR"}><QrCode className="size-4" />Chuyển khoản</Button>
                </div>
                {method === "CASH" ? <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm"><p className="text-muted-foreground">Số tiền cần thu tại quầy</p><p className="mt-1 font-mono text-xl font-semibold text-primary">{formatVND(invoice.total)}</p></div> : <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">Tạo yêu cầu để hệ thống cung cấp thông tin chuyển khoản. Không tự xác nhận thủ công.</div>}
              </>
            )}

            {invoice?.paymentStatus === "FAILED" && <Alert variant="destructive"><AlertCircle className="size-4" /><AlertTitle>Cần kiểm tra thanh toán</AlertTitle><AlertDescription>Yêu cầu chuyển khoản không còn hiệu lực. Vui lòng tạo lại yêu cầu mới.</AlertDescription></Alert>}
          </section>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          {invoice?.paymentStatus === "PENDING" && invoice.paymentMethod === "VIETQR" ? <Button onClick={() => onOpenChange(false)}>Đóng và tiếp tục</Button> : invoice?.paymentStatus === "PAID" ? <Button onClick={() => onOpenChange(false)}>Hoàn tất</Button> : invoice?.paymentStatus === "PENDING" && method === "VIETQR" ? <Button onClick={handleTransfer} disabled={isMutating}>{transferMutation.isPending && <Loader2 className="size-4 animate-spin" />}Tạo yêu cầu chuyển khoản</Button> : invoice?.paymentStatus === "PENDING" ? <Button onClick={handleCash} disabled={isMutating}>{cashMutation.isPending && <Loader2 className="size-4 animate-spin" />}Xác nhận thu tiền</Button> : invoice?.paymentStatus === "FAILED" ? <Button onClick={handleTransfer} disabled={isMutating}>{transferMutation.isPending && <Loader2 className="size-4 animate-spin" />}Tạo lại yêu cầu chuyển khoản</Button> : null}
          {invoice?.paymentStatus !== "PENDING" && invoice?.paymentStatus !== "PAID" && <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMutating}>Hủy</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
