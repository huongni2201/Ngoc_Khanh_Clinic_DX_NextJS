import * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { Invoice } from "../types"

const queryState = vi.hoisted(() => ({ paidInvoices: [] as Invoice[] }))
vi.mock("../hooks/use-billing", () => ({
  usePayments: () => ({
    data: { data: queryState.paidInvoices, page: 1, pageSize: 10, total: queryState.paidInvoices.length, totalPages: 1 },
    isSuccess: true,
  }),
}))

const invoice: Invoice = {
  id: "inv-paid-1",
  encounterId: "enc-paid-1",
  encounterCode: "LK-260925-001",
  patientId: "pat-paid-1",
  patientName: "Nguyễn Văn Thành",
  patientCode: "BN001999",
  examinationType: "Khám tổng quát",
  items: [],
  subtotal: 150000,
  discount: 0,
  total: 150000,
  paymentStatus: "PAID",
  paymentMethod: "CASH",
  createdAt: "2026-09-25T08:00:00Z",
  updatedAt: "2026-09-25T08:02:00Z",
  paidAt: "2026-09-25T08:02:00Z",
}

describe("PaymentCompletionNotifier", () => {
  it("announces only payments that become paid after mount", async () => {
    const { PaymentCompletionNotifier } = await import("../components/payment-completion-notifier")
    const { rerender } = render(<PaymentCompletionNotifier />)
    expect(screen.queryByRole("status")).not.toBeInTheDocument()

    queryState.paidInvoices = [invoice]
    rerender(<PaymentCompletionNotifier />)

    expect(await screen.findByRole("status")).toHaveTextContent("Thanh toán thành công")
    expect(screen.getByRole("status")).toHaveTextContent(invoice.patientName)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Xem danh sách" })).toHaveAttribute("href", "/billing?status=PAID")
  })
})
