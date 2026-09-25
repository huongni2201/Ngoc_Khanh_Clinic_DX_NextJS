import {
  fetchInvoiceByEncounter as fetchReceptionInvoice,
  fetchReceptionWorklist,
  fetchReceptionInvoices,
  processPayment as processReceptionPayment,
} from "@/modules/reception/api"
import type { LegacyReceptionInvoice as ReceptionInvoice } from "@/modules/reception/types"
import type {
  BillableEncounter,
  ConfirmTransferPaymentDto,
  Invoice,
  PaymentCounters,
  PaymentListParams,
  PaymentListResult,
  PaymentMethod,
  PaymentReceipt,
  Payment,
  ProcessCashPaymentDto,
  StartTransferPaymentDto,
} from "../types"

const paymentStore = new Map<string, Invoice>()
const finalizationLocks = new Map<string, Promise<Invoice>>()

const now = () => new Date().toISOString()

function mapLegacyPaymentMethod(method?: ReceptionInvoice["paymentMethod"]): PaymentMethod | undefined {
  if (method === "TRANSFER") return "BANK_TRANSFER"
  return method
}

function createPaymentReceipt(
  payment: Payment,
  cashierName?: string,
): PaymentReceipt {
  return {
    id: `receipt-${payment.id}`,
    paymentId: payment.id,
    invoiceId: payment.invoiceId,
    receiptNumber: `PT-${payment.id.replace(/\D/g, "").slice(-8).padStart(8, "0")}`,
    amount: payment.amount,
    paymentMethod: payment.method,
    issuedAt: payment.paidAt ?? payment.createdAt,
    cashierName,
  }
}

function mapReceptionInvoice(
  invoice: ReceptionInvoice,
  encounter?: { examinationType: string; createdAt: string; phoneNumber?: string }
): Invoice {
  const timestamp = invoice.paidAt ?? encounter?.createdAt ?? now()
  return {
    id: invoice.id,
    encounterId: invoice.encounterId,
    encounterCode: invoice.encounterCode,
    patientId: invoice.patientId,
    patientName: invoice.patientName,
    patientCode: invoice.patientCode,
    phoneNumber: encounter?.phoneNumber,
    examinationType: encounter?.examinationType ?? "Khám bệnh",
    items: invoice.items,
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    total: invoice.total,
    paymentStatus: invoice.isPaid ? "PAID" : "PENDING",
    paymentMethod: mapLegacyPaymentMethod(invoice.paymentMethod),
    createdAt: encounter?.createdAt ?? timestamp,
    updatedAt: timestamp,
    paidAt: invoice.paidAt,
    cashierName: invoice.cashierName,
  }
}

async function ensureInvoice(encounter: BillableEncounter): Promise<Invoice> {
  const existing = paymentStore.get(encounter.id)
  const receptionInvoice = await fetchReceptionInvoice(encounter.id)
  const mapped = mapReceptionInvoice(receptionInvoice, {
    examinationType: encounter.examinationType,
    createdAt: now(),
    phoneNumber: encounter.phoneNumber,
  })
  if (existing && mapped.paymentStatus !== "PAID") return existing
  const refreshed = existing
    ? { ...mapped, transferIntent: existing.transferIntent, transactionReference: existing.transactionReference }
    : mapped
  paymentStore.set(encounter.id, refreshed)
  return refreshed
}

export async function fetchInvoiceByEncounter(
  encounter: BillableEncounter
): Promise<Invoice> {
  return ensureInvoice(encounter)
}

export async function fetchPayments(
  params: PaymentListParams = {}
): Promise<PaymentListResult> {
  const receptionInvoices = await fetchReceptionInvoices()
  const receptionEncounters = await fetchReceptionWorklist()
  const encounters = receptionInvoices.map((invoice) => {
    const encounter = receptionEncounters.find((item) => item.id === invoice.encounterId)
    return {
      id: invoice.encounterId,
      encounterCode: invoice.encounterCode,
      patientId: invoice.patientId,
      patientCode: invoice.patientCode,
      patientName: invoice.patientName,
      phoneNumber: encounter?.phoneNumber,
      examinationType: encounter?.examinationType ?? "Khám bệnh",
    }
  })

  for (const encounter of encounters) await ensureInvoice(encounter)

  const query = params.search?.trim().toLowerCase()
  const status = params.status && params.status !== "ALL" ? params.status : undefined
  const all = [...paymentStore.values()]
    .filter((invoice) => {
      if (!status) return true
      if (status === "ATTENTION") return invoice.paymentStatus === "FAILED"
      if (status === "PAID_TODAY") return invoice.paymentStatus === "PAID" && invoice.paidAt?.slice(0, 10) === now().slice(0, 10)
      return invoice.paymentStatus === status
    })
    .filter((invoice) => {
      if (!query) return true
      return [invoice.patientName, invoice.patientCode, invoice.encounterCode, invoice.phoneNumber ?? ""]
        .some((value) => value.toLowerCase().includes(query))
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const pageSize = Math.max(1, params.pageSize ?? 10)
  const total = all.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(1, params.page ?? 1), totalPages)
  const start = (page - 1) * pageSize
  return { data: all.slice(start, start + pageSize), page, pageSize, total, totalPages }
}

export async function fetchPaymentCounters(): Promise<PaymentCounters> {
  const result = await fetchPayments({ page: 1, pageSize: 1000 })
  return {
    pending: result.data.filter((invoice) => invoice.paymentStatus === "PENDING").length,
    attention: result.data.filter((invoice) => invoice.paymentStatus === "FAILED").length,
    paidToday: result.data.filter((invoice) => invoice.paymentStatus === "PAID" && invoice.paidAt?.slice(0, 10) === now().slice(0, 10)).length,
  }
}

export async function startTransferPayment(dto: StartTransferPaymentDto): Promise<Invoice> {
  const current = await ensureInvoice(dto.encounter)
  if (current.paymentStatus === "PAID" || (current.paymentStatus === "PENDING" && current.paymentMethod === "VIETQR")) return current
  const updated: Invoice = {
    ...current,
    paymentStatus: "PENDING",
    paymentMethod: "VIETQR",
    transferIntent: { transferContent: dto.encounter.encounterCode },
    updatedAt: now(),
  }
  paymentStore.set(dto.encounter.id, updated)
  return updated
}

async function processCashPaymentInternal(dto: ProcessCashPaymentDto): Promise<Invoice> {
  const current = paymentStore.get(dto.encounterId)
  const fallback = current ?? await ensureInvoice({
    id: dto.encounterId,
    encounterCode: dto.encounterId,
    patientId: "",
    patientCode: "",
    patientName: "",
    examinationType: "Khám bệnh",
  })
  if (fallback.paymentStatus === "PAID") return fallback
  const paidReceptionInvoice = await processReceptionPayment({
    encounterId: dto.encounterId,
    paymentMethod: "CASH",
  })
  const paid = {
    ...mapReceptionInvoice(paidReceptionInvoice),
    phoneNumber: fallback.phoneNumber,
    examinationType: fallback.examinationType,
    createdAt: fallback.createdAt,
    updatedAt: paidReceptionInvoice.paidAt ?? now(),
    paymentStatus: "PAID" as const,
    paymentMethod: "CASH" as const,
  }
  const payment: Payment = {
    id: `payment-${paid.id}`,
    invoiceId: paid.id,
    encounterId: paid.encounterId,
    amount: paid.total,
    method: "CASH",
    status: "PAID",
    createdAt: paid.createdAt,
    paidAt: paid.paidAt,
  }
  paid.payment = payment
  paid.paymentReceipt = createPaymentReceipt(payment, paid.cashierName)
  paymentStore.set(dto.encounterId, paid)
  return paid
}

export async function processCashPayment(dto: ProcessCashPaymentDto): Promise<Invoice> {
  const inFlight = finalizationLocks.get(dto.encounterId)
  if (inFlight) return inFlight
  const request = processCashPaymentInternal(dto)
  finalizationLocks.set(dto.encounterId, request)
  try {
    return await request
  } finally {
    finalizationLocks.delete(dto.encounterId)
  }
}

async function recordTransferConfirmationInternal(dto: ConfirmTransferPaymentDto): Promise<Invoice> {
  const current = paymentStore.get(dto.encounterId)
  if (!current) throw new Error("Không tìm thấy thanh toán")
  if (current.paymentStatus === "PAID") return current
  await processReceptionPayment({
    encounterId: dto.encounterId,
    paymentMethod: "TRANSFER",
  })
  const paid: Invoice = {
    ...current,
    paymentStatus: "PAID",
    paymentMethod: "BANK_TRANSFER",
    paidAt: now(),
    updatedAt: now(),
    transactionReference: dto.transactionReference,
  }
  const payment: Payment = {
    id: `payment-${paid.id}`,
    invoiceId: paid.id,
    encounterId: paid.encounterId,
    amount: paid.total,
    method: "BANK_TRANSFER",
    status: "PAID",
    createdAt: paid.createdAt,
    paidAt: paid.paidAt,
    transactionReference: dto.transactionReference,
  }
  paid.payment = payment
  paid.paymentReceipt = createPaymentReceipt(payment, paid.cashierName)
  paymentStore.set(dto.encounterId, paid)
  return paid
}

export async function recordTransferConfirmation(dto: ConfirmTransferPaymentDto): Promise<Invoice> {
  const inFlight = finalizationLocks.get(dto.encounterId)
  if (inFlight) return inFlight
  const request = recordTransferConfirmationInternal(dto)
  finalizationLocks.set(dto.encounterId, request)
  try {
    return await request
  } finally {
    finalizationLocks.delete(dto.encounterId)
  }
}

export function resetBillingStore() {
  paymentStore.clear()
  finalizationLocks.clear()
}
