import { unavailableDevelopmentApi } from "@/shared/api/development-fixture-error"

type BillingApi = typeof import("../__tests__/fixtures/api-fixtures")

export function fetchInvoiceByEncounter(
  ...args: Parameters<BillingApi["fetchInvoiceByEncounter"]>
): ReturnType<BillingApi["fetchInvoiceByEncounter"]> {
  void args
  return unavailableDevelopmentApi("hóa đơn lượt khám")
}

export function fetchPayments(
  ...args: Parameters<BillingApi["fetchPayments"]>
): ReturnType<BillingApi["fetchPayments"]> {
  void args
  return unavailableDevelopmentApi("danh sách thanh toán")
}

export function fetchPaymentCounters(
  ...args: Parameters<BillingApi["fetchPaymentCounters"]>
): ReturnType<BillingApi["fetchPaymentCounters"]> {
  void args
  return unavailableDevelopmentApi("thống kê thanh toán")
}

export function startTransferPayment(
  ...args: Parameters<BillingApi["startTransferPayment"]>
): ReturnType<BillingApi["startTransferPayment"]> {
  void args
  return unavailableDevelopmentApi("khởi tạo thanh toán chuyển khoản")
}

export function processCashPayment(
  ...args: Parameters<BillingApi["processCashPayment"]>
): ReturnType<BillingApi["processCashPayment"]> {
  void args
  return unavailableDevelopmentApi("thu tiền mặt")
}

export function recordTransferConfirmation(
  ...args: Parameters<BillingApi["recordTransferConfirmation"]>
): ReturnType<BillingApi["recordTransferConfirmation"]> {
  void args
  return unavailableDevelopmentApi("xác nhận thanh toán chuyển khoản")
}
