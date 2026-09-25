"use client"

import * as React from "react"
import {
  Banknote,
  QrCode,
  AlertCircle,
  Loader2,
  CheckCircle2,
  User,
  Copy,
  Check,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useInvoice, useProcessPayment } from "../hooks/use-reception"
import { Encounter, Invoice } from "../types"
import { cn } from "@/lib/utils"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  encounter: Encounter | null
  onSuccess?: (paidInvoice: Invoice, shouldPrintReceipt: boolean) => void
}

export function PaymentDialog({
  open,
  onOpenChange,
  encounter,
  onSuccess,
}: PaymentDialogProps) {
  const { data: invoice, isLoading: isLoadingInvoice } = useInvoice(
    encounter?.id
  )
  const paymentMutation = useProcessPayment()

  const [paymentMethod, setPaymentMethod] = React.useState<"CASH" | "TRANSFER">(
    "CASH"
  )
  const [printReceipt, setPrintReceipt] = React.useState<boolean>(true)
  const [isConfirming, setIsConfirming] = React.useState<boolean>(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [hasCopiedContent, setHasCopiedContent] = React.useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsConfirming(false)
      setServerError(null)
      setHasCopiedContent(false)
    }
    onOpenChange(isOpen)
  }

  if (!encounter) return null

  const formatCurrency = (val?: number) => {
    if (typeof val !== "number") return "0 đ"
    return new Intl.NumberFormat("vi-VN").format(val) + " đ"
  }

  const handleCopyTransferContent = () => {
    if (encounter?.encounterCode) {
      navigator.clipboard.writeText(encounter.encounterCode)
      setHasCopiedContent(true)
      setTimeout(() => setHasCopiedContent(false), 2000)
    }
  }

  const handleProceedPayment = async () => {
    if (!encounter) return
    try {
      setServerError(null)
      const paid = await paymentMutation.mutateAsync({
        encounterId: encounter.id,
        paymentMethod,
        printReceipt,
      })

      setIsConfirming(false)
      onOpenChange(false)
      if (onSuccess) {
        onSuccess(paid, printReceipt)
      }
    } catch (err) {
      setServerError((err as Error)?.message || "Không thể xử lý thu phí")
      setIsConfirming(false)
    }
  }

  const isPending = paymentMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-w-[calc(100%-2rem)] p-6 sm:p-7 max-h-[92vh] flex flex-col gap-0 rounded-2xl shadow-xl overflow-hidden bg-card border-border">
        {/* Header */}
        <DialogHeader className="pb-4 shrink-0 text-left border-b border-border/80">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Thu phí khám bệnh
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Xác nhận các khoản phí do bác sĩ / phòng khám chỉ định và thu tiền
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 -mr-1">
          {serverError && (
            <Alert variant="destructive" className="py-2.5 text-xs">
              <AlertCircle className="size-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Patient Context Summary Banner */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-surface-alt/50 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                <User className="size-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {encounter.patientName}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-card text-primary font-mono text-[10px] px-2 py-0 border-primary/30"
                  >
                    {encounter.patientCode}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary-foreground flex-wrap">
                  <span>
                    SĐT: <strong className="text-foreground font-medium">{encounter.phoneNumber}</strong>
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span>
                    Lượt khám:{" "}
                    <strong className="text-foreground font-mono font-medium">
                      {encounter.encounterCode}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                invoice?.isPaid
                  ? "bg-status-success-bg text-status-success border-status-success/30"
                  : "bg-status-warning-bg text-status-warning border-status-warning/30",
                "text-[11px] font-medium px-3 py-1"
              )}
            >
              {invoice?.isPaid ? "Đã thanh toán" : "Chờ thu phí"}
            </Badge>
          </div>

          {/* Two Column Layout: Left Invoice (7 cols) / Right Payment Options (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (7 cols): Billable Items & Calculation */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Danh mục dịch vụ & viện phí (Bác sĩ chỉ định):
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Không thể sửa đổi chỉ định chuyên môn
                </span>
              </div>

              {/* Invoice Breakdown Card */}
              <div className="border border-border rounded-xl overflow-hidden bg-card shadow-2xs">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface-alt/70 hover:bg-surface-alt/70 border-b border-border">
                      <TableHead className="text-[11px] font-semibold text-foreground h-8 px-3">
                        Dịch vụ
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold text-foreground h-8 px-3 text-right">
                        Đơn giá
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold text-foreground h-8 px-3 text-center w-12">
                        SL
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold text-foreground h-8 px-3 text-right">
                        Thành tiền
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingInvoice ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-24 text-center text-xs text-muted-foreground"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="size-4 animate-spin text-primary" />
                            <span>Đang tải danh mục chi phí...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : invoice?.items && invoice.items.length > 0 ? (
                      invoice.items.map((item) => (
                        <TableRow
                          key={item.id}
                          className="border-b border-border/40 hover:bg-hover/30"
                        >
                          <TableCell className="px-3 py-2.5 text-xs font-medium text-foreground">
                            {item.name}
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-xs text-secondary-foreground text-right font-mono">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-xs text-center text-secondary-foreground font-mono">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-xs font-semibold text-foreground text-right font-mono">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-16 text-center text-xs text-muted-foreground"
                        >
                          Chưa có khoản thu nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Integrated Financial Summary */}
                <div className="p-3.5 bg-surface-alt/40 border-t border-border space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-secondary-foreground">
                    <span>Tạm tính:</span>
                    <span className="font-mono font-medium text-foreground">
                      {formatCurrency(invoice?.subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-secondary-foreground">
                    <span>Giảm giá / Ưu đãi:</span>
                    <span className="font-mono text-status-success font-medium">
                      {formatCurrency(invoice?.discount || 0)}
                    </span>
                  </div>
                  <div className="border-t border-border/80 pt-2 flex items-center justify-between">
                    <span className="font-semibold text-foreground text-xs">
                      Tổng thanh toán:
                    </span>
                    <span className="text-lg text-primary font-mono font-bold tracking-tight">
                      {formatCurrency(invoice?.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Payment Options & Confirmation */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Phương thức thanh toán:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 rounded-xl border text-left cursor-pointer transition-all",
                      paymentMethod === "CASH"
                        ? "border-primary bg-selected ring-1 ring-primary text-foreground font-semibold"
                        : "border-border bg-card hover:bg-hover/60 text-secondary-foreground"
                    )}
                  >
                    <div className="size-7 rounded-lg bg-surface-alt flex items-center justify-center text-primary shrink-0">
                      <Banknote className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium">Tiền mặt</div>
                      <div className="text-[10px] text-muted-foreground font-normal">
                        Tại quầy
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("TRANSFER")}
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 rounded-xl border text-left cursor-pointer transition-all",
                      paymentMethod === "TRANSFER"
                        ? "border-primary bg-selected ring-1 ring-primary text-foreground font-semibold"
                        : "border-border bg-card hover:bg-hover/60 text-secondary-foreground"
                    )}
                  >
                    <div className="size-7 rounded-lg bg-surface-alt flex items-center justify-center text-primary shrink-0">
                      <QrCode className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium">Chuyển khoản</div>
                      <div className="text-[10px] text-muted-foreground font-normal">
                        Mã VietQR
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dynamic Payment Detail View */}
              {paymentMethod === "TRANSFER" ? (
                <div className="p-3 rounded-xl border border-primary/30 bg-selected/40 space-y-2.5 text-xs animate-in fade-in-50">
                  <div className="flex items-center justify-between pb-1 border-b border-primary/20">
                    <span className="font-semibold text-primary flex items-center gap-1.5 text-[11px]">
                      <QrCode className="size-3.5" />
                      Mã VietQR thanh toán phòng khám
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground bg-card px-1.5 py-0.5 rounded border border-border">
                      MBBank
                    </span>
                  </div>

                  <div className="flex gap-3 items-center">
                    {/* Visual QR Code Display */}
                    <div className="size-20 rounded-lg bg-card p-1 border border-border shrink-0 flex items-center justify-center shadow-2xs">
                      <svg className="size-full text-foreground" viewBox="0 0 100 100" fill="currentColor">
                        {/* Top-left corner finder */}
                        <rect x="10" y="10" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="17" y="17" width="10" height="10" rx="1" fill="currentColor" />
                        {/* Top-right corner finder */}
                        <rect x="66" y="10" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="73" y="17" width="10" height="10" rx="1" fill="currentColor" />
                        {/* Bottom-left corner finder */}
                        <rect x="10" y="66" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="17" y="73" width="10" height="10" rx="1" fill="currentColor" />
                        {/* QR Matrix simulation */}
                        <rect x="42" y="12" width="6" height="6" />
                        <rect x="52" y="18" width="6" height="6" />
                        <rect x="42" y="28" width="6" height="6" />
                        <rect x="12" y="42" width="6" height="6" />
                        <rect x="22" y="52" width="6" height="6" />
                        <rect x="42" y="42" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                        <rect x="47" y="47" width="6" height="6" fill="#2563eb" />
                        <rect x="68" y="42" width="6" height="6" />
                        <rect x="78" y="52" width="6" height="6" />
                        <rect x="42" y="68" width="6" height="6" />
                        <rect x="52" y="78" width="6" height="6" />
                        <rect x="68" y="68" width="8" height="8" />
                        <rect x="80" y="78" width="8" height="8" />
                      </svg>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1 text-[11px]">
                      <div className="text-secondary-foreground truncate">
                        STK: <strong className="font-mono text-foreground">024 3833 6688</strong>
                      </div>
                      <div className="text-secondary-foreground truncate">
                        Chủ TK: <strong className="text-foreground">PK DAKHOA NGOC KHANH</strong>
                      </div>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-muted-foreground">Nội dung:</span>
                        <span className="font-mono font-bold text-primary bg-card px-1.5 py-0.5 rounded border border-primary/20">
                          {encounter.encounterCode}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyTransferContent}
                          className="size-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Sao chép nội dung chuyển khoản"
                        >
                          {hasCopiedContent ? (
                            <Check className="size-3 text-status-success" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-border/80 bg-surface-alt/40 space-y-1.5 text-xs animate-in fade-in-50">
                  <div className="flex items-center justify-between text-secondary-foreground">
                    <span>Số tiền cần thu tại quầy:</span>
                    <span className="font-mono font-bold text-primary text-sm">
                      {formatCurrency(invoice?.total)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Thu tiền mặt trực tiếp từ người bệnh và bàn giao phiếu thu/biên lai sau khi thu.
                  </p>
                </div>
              )}

              {/* Receipt Toggle */}
              <div className="flex items-center space-x-2 p-2.5 rounded-xl border border-border/80 bg-card">
                <Checkbox
                  id="printReceipt"
                  checked={printReceipt}
                  onCheckedChange={(checked) => setPrintReceipt(!!checked)}
                  disabled={isPending}
                />
                <label
                  htmlFor="printReceipt"
                  className="text-xs text-foreground cursor-pointer select-none font-medium"
                >
                  In biên lai thu tiền sau khi xác nhận
                </label>
              </div>

              {/* Double-check Confirmation Prompt */}
              {isConfirming && (
                <Alert className="bg-selected border-primary/40 p-3 text-xs rounded-xl animate-in fade-in-50">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <AlertDescription className="text-foreground leading-relaxed text-[11px]">
                    Bạn có chắc chắn muốn xác nhận đã thu số tiền{" "}
                    <strong className="text-primary font-mono text-xs">
                      {formatCurrency(invoice?.total)}
                    </strong>{" "}
                    bằng{" "}
                    <strong>
                      {paymentMethod === "CASH" ? "Tiền mặt" : "Chuyển khoản"}
                    </strong>{" "}
                    từ bệnh nhân {encounter.patientName}?
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="pt-4 mt-2 border-t border-border flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium border-border/80 hover:bg-hover rounded-lg shadow-2xs cursor-pointer"
          >
            Hủy
          </Button>

          {!isConfirming ? (
            <Button
              type="button"
              onClick={() => setIsConfirming(true)}
              disabled={isPending || invoice?.isPaid}
              className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium rounded-lg shadow-xs cursor-pointer"
            >
              {invoice?.isPaid ? "Đã thanh toán" : "Xác nhận thu tiền"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleProceedPayment}
              disabled={isPending}
              className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium rounded-lg shadow-xs cursor-pointer"
            >
              {isPending && <Loader2 className="size-3.5 mr-2 animate-spin" />}
              {isPending ? "Đang ghi nhận..." : "Đồng ý thu tiền"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
