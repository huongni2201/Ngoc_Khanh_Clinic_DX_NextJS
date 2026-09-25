import { beforeEach, describe, expect, it } from "vitest"
import {
  fetchInvoiceByEncounter,
  fetchPaymentCounters,
  fetchPayments,
  processCashPayment,
  recordTransferConfirmation,
  resetBillingStore,
  startTransferPayment,
} from "../api"
import { initialEncounters, processPayment, resetReceptionStore } from "@/modules/reception/api"

const waitingEncounter = initialEncounters.find(
  (encounter) => encounter.paymentStatus === "PENDING"
)!

describe("billing API facade", () => {
  beforeEach(() => {
    resetReceptionStore()
    resetBillingStore()
  })

  it("persists a pending transfer so it can be listed after the dialog closes", async () => {
    const pending = await startTransferPayment({ encounter: waitingEncounter })
    const reopened = await fetchInvoiceByEncounter(waitingEncounter)
    const list = await fetchPayments({ status: "PENDING", page: 1, pageSize: 10 })

    expect(pending.paymentStatus).toBe("PENDING")
    expect(reopened.id).toBe(pending.id)
    expect(list.data.map((invoice) => invoice.id)).toContain(pending.id)
    expect(pending.transferIntent?.qrCodeUrl).toBeUndefined()
  })

  it("finalizes cash only once and reports the paid counter", async () => {
    await fetchInvoiceByEncounter(waitingEncounter)
    const [paid, repeated] = await Promise.all([
      processCashPayment({ encounterId: waitingEncounter.id }),
      processCashPayment({ encounterId: waitingEncounter.id }),
    ])
    const counters = await fetchPaymentCounters()

    expect(repeated.id).toBe(paid.id)
    expect(repeated.paidAt).toBe(paid.paidAt)
    expect(paid.payment?.status).toBe("PAID")
    expect(paid.paymentReceipt?.receiptNumber).toMatch(/^PT-/)
    expect(counters.paidToday).toBe(1)
  })

  it("moves a confirmed transfer encounter out of waiting payment", async () => {
    const pending = await startTransferPayment({ encounter: waitingEncounter })
    const paid = await recordTransferConfirmation({ encounterId: pending.encounterId, transactionReference: "tx-001" })
    const encounters = await (await import("@/modules/reception/api")).fetchReceptionWorklist()

    expect(paid.paymentStatus).toBe("PAID")
    expect(encounters.find((encounter) => encounter.id === waitingEncounter.id)?.diagnosticWorkflowStatus).toBe("IN_PROGRESS")
  })

  it("reconciles an externally finalized source invoice on the next read", async () => {
    await startTransferPayment({ encounter: waitingEncounter })
    await processPayment({ encounterId: waitingEncounter.id, paymentMethod: "TRANSFER" })

    const refreshed = await fetchInvoiceByEncounter(waitingEncounter)

    expect(refreshed.paymentStatus).toBe("PAID")
  })
})
