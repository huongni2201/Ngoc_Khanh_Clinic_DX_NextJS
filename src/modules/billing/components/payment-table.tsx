"use client"

import { ArrowRight, Banknote, CreditCard, Eye, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatVND } from "@/shared/ui"
import type { Invoice } from "../types"
import { PaymentStatusBadge } from "./payment-status-badge"

interface PaymentTableProps {
  invoices: Invoice[]
  isLoading: boolean
  onSelect: (invoice: Invoice) => void
}

function actionLabel(status: Invoice["paymentStatus"], paymentMethod: Invoice["paymentMethod"]) {
  if (status === "PENDING" && paymentMethod !== "VIETQR") return "Thu phí"
  if (status === "PENDING" || status === "PAID") return "Xem thanh toán"
  return "Xử lý"
}

export function PaymentTable({ invoices, isLoading, onSelect }: PaymentTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Lượt khám / bệnh nhân</TableHead>
            <TableHead className="text-right">Số tiền</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Cập nhật</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }, (_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 7 }, (_, cell) => (
                  <TableCell key={cell}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-36 text-center">
                <div className="text-sm font-medium text-foreground">Không có thanh toán phù hợp</div>
                <div className="mt-1 text-xs text-muted-foreground">Thử đổi trạng thái hoặc từ khóa tìm kiếm.</div>
              </TableCell>
            </TableRow>
          ) : invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {new Date(invoice.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
              </TableCell>
              <TableCell>
                <div className="font-medium text-foreground">{invoice.patientName}</div>
                <div className="text-xs text-muted-foreground">{invoice.patientCode} · {invoice.encounterCode}</div>
              </TableCell>
              <TableCell className="text-right font-mono text-sm font-semibold">{formatVND(invoice.total)}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  {invoice.paymentMethod === "VIETQR" || invoice.paymentMethod === "BANK_TRANSFER" ? <CreditCard className="size-3.5" /> : invoice.paymentMethod === "CASH" ? <Banknote className="size-3.5" /> : null}
                  {invoice.paymentMethod === "VIETQR" || invoice.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản" : invoice.paymentMethod === "CASH" ? "Tiền mặt" : "Chưa chọn"}
                </span>
              </TableCell>
              <TableCell><PaymentStatusBadge status={invoice.paymentStatus} paymentMethod={invoice.paymentMethod} /></TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {new Date(invoice.updatedAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => onSelect(invoice)}>
                  {invoice.paymentStatus === "PENDING" ? <ArrowRight className="size-3.5" /> : invoice.paymentStatus === "PAID" ? <Eye className="size-3.5" /> : <Wrench className="size-3.5" />}
                  {actionLabel(invoice.paymentStatus, invoice.paymentMethod)}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
