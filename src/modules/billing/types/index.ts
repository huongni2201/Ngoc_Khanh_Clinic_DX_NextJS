export type PaymentMethod = "CASH" | "VIETQR" | "BANK_TRANSFER" | "CARD_POS"
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED"
export type PaymentStatusFilter = "ALL" | PaymentStatus | "ATTENTION" | "PAID_TODAY"

export interface BillableEncounter {
  id: string
  encounterCode: string
  patientId: string
  patientCode: string
  patientName: string
  phoneNumber?: string
  examinationType: string
}

export interface TransferIntent {
  transferContent: string
  qrCodeUrl?: string
  bankName?: string
  accountName?: string
  accountNumber?: string
  expiresAt?: string
}

export interface Payment {
  id: string
  invoiceId: string
  encounterId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  createdAt: string
  paidAt?: string
  transactionReference?: string
}

export interface PaymentReceipt {
  id: string
  paymentId: string
  invoiceId: string
  receiptNumber: string
  amount: number
  paymentMethod: PaymentMethod
  issuedAt: string
  cashierName?: string
}

export interface BillableItem {
  id: string
  name: string
  unitPrice: number
  quantity: number
  amount: number
  category?: string
}

export interface Invoice {
  id: string
  encounterId: string
  encounterCode: string
  patientId: string
  patientName: string
  patientCode: string
  phoneNumber?: string
  examinationType: string
  items: BillableItem[]
  subtotal: number
  discount: number
  total: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  createdAt: string
  updatedAt: string
  paidAt?: string
  cashierName?: string
  transactionReference?: string
  transferIntent?: TransferIntent
  payment?: Payment
  paymentReceipt?: PaymentReceipt
}

export interface PaymentListParams {
  status?: PaymentStatusFilter
  search?: string
  page?: number
  pageSize?: number
}

export interface PaymentListResult {
  data: Invoice[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaymentCounters {
  pending: number
  attention: number
  paidToday: number
}

export interface StartTransferPaymentDto {
  encounter: BillableEncounter
}

export interface ProcessCashPaymentDto {
  encounterId: string
}

export interface ConfirmTransferPaymentDto {
  encounterId: string
  transactionReference?: string
}
