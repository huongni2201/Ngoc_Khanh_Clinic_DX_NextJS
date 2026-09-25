import { describe, expect, it } from "vitest"
import type { PaymentMethod, PaymentReceipt, PaymentStatus } from "../types"
import { fetchInvoiceByEncounter, resetBillingStore } from "../api"

describe("billing payment terminology", () => {
  it("supports the canonical payment methods and statuses", () => {
    const methods: PaymentMethod[] = ["CASH", "VIETQR", "BANK_TRANSFER", "CARD_POS"]
    const statuses: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"]

    expect(methods).toHaveLength(4)
    expect(statuses).toHaveLength(5)
  })

  it("models a receipt separately from the invoice transaction", () => {
    const receipt: PaymentReceipt = {
      id: "receipt-001",
      paymentId: "payment-001",
      invoiceId: "invoice-001",
      receiptNumber: "PT-260925-001",
      amount: 150000,
      paymentMethod: "CASH",
      issuedAt: "2026-09-25T08:00:00Z",
    }

    expect(receipt.receiptNumber).toBe("PT-260925-001")
    expect(receipt).not.toHaveProperty("isPaid")
  })

  it("maps the reception isPaid transport flag into the billing payment status", async () => {
    resetBillingStore()
    const invoice = await fetchInvoiceByEncounter({
      id: "enc-003",
      encounterCode: "LK-260924-003",
      patientId: "pat-003",
      patientCode: "BN001312",
      patientName: "Lê Đức Anh",
      examinationType: "Khám cơ xương khớp",
    })

    expect(invoice.paymentStatus).toBe("PENDING")
    expect(invoice).not.toHaveProperty("isPaid")
  })
})
