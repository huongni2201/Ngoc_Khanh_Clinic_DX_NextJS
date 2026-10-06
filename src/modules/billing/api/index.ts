import { unavailableApi } from "@/shared/api/api-unavailable"
import type {
  BillableEncounter,
  ConfirmTransferPaymentDto,
  Invoice,
  PaymentCounters,
  PaymentListParams,
  PaymentListResult,
  ProcessCashPaymentDto,
  StartTransferPaymentDto,
} from "../types"

export function fetchInvoiceByEncounter(encounter: BillableEncounter): Promise<Invoice> {
  void encounter
  return unavailableApi("hóa đơn lượt khám")
}

export function fetchPayments(params?: PaymentListParams): Promise<PaymentListResult> {
  void params
  return unavailableApi("danh sách thanh toán")
}

export function fetchPaymentCounters(): Promise<PaymentCounters> {
  return unavailableApi("thống kê thanh toán")
}

export function startTransferPayment(dto: StartTransferPaymentDto): Promise<Invoice> {
  void dto
  return unavailableApi("khởi tạo thanh toán chuyển khoản")
}

export function processCashPayment(dto: ProcessCashPaymentDto): Promise<Invoice> {
  void dto
  return unavailableApi("thu tiền mặt")
}

export function recordTransferConfirmation(dto: ConfirmTransferPaymentDto): Promise<Invoice> {
  void dto
  return unavailableApi("xác nhận thanh toán chuyển khoản")
}
