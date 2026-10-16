import { apiClient } from "@/shared/api/api-client"
import type { DownloadedFile, PaymentSummaryReport, PaymentSummaryReportRange } from "../types"
import { paymentSummaryReportResponseSchema } from "../types/transport"

export const PAYMENT_SUMMARY_DOCX_FALLBACK_FILE_NAME = "bao-cao-thanh-toan.docx"

function reportEndpoint(organizationId: string, agreementId: string) {
  return `/api/v1/organizations/${encodeURIComponent(organizationId)}/agreements/${encodeURIComponent(agreementId)}/reports/payment-summary`
}

/** `from`/`to` (yyyy-MM-dd, inclusive) limit the figures to the sessions of that date range. */
function rangeQuery(range?: PaymentSummaryReportRange) {
  const query = new URLSearchParams()
  if (range?.from) query.set("from", range.from)
  if (range?.to) query.set("to", range.to)
  const text = query.toString()
  return text ? `?${text}` : ""
}

export function buildPaymentSummaryUrl(
  organizationId: string,
  agreementId: string,
  range?: PaymentSummaryReportRange
) {
  return `${reportEndpoint(organizationId, agreementId)}${rangeQuery(range)}`
}

export function buildPaymentSummaryDocxUrl(
  organizationId: string,
  agreementId: string,
  range?: PaymentSummaryReportRange
) {
  return `${reportEndpoint(organizationId, agreementId)}/docx${rangeQuery(range)}`
}

export async function fetchPaymentSummaryReport(
  organizationId: string,
  agreementId: string,
  range?: PaymentSummaryReportRange,
  signal?: AbortSignal
): Promise<PaymentSummaryReport> {
  const response = await apiClient.get<unknown>(
    buildPaymentSummaryUrl(organizationId, agreementId, range),
    { signal }
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi báo cáo thanh toán không có dữ liệu.")
  }

  const report = paymentSummaryReportResponseSchema.parse(response.data)
  return {
    ...report,
    validFrom: report.validFrom ?? undefined,
    validTo: report.validTo ?? undefined,
    rangeFrom: report.rangeFrom ?? undefined,
    rangeTo: report.rangeTo ?? undefined,
    items: report.items.map((item) => ({
      agreementServiceId: item.agreementServiceId,
      serviceCode: item.serviceCode ?? undefined,
      serviceName: item.serviceName ?? undefined,
      displayOrder: item.displayOrder,
      unitPrice: item.unitPrice,
      examinedCount: item.examinedCount,
      amount: item.amount,
    })),
  }
}

/** The Word payment summary: generated on demand with the same figures as the screen. */
export async function downloadPaymentSummaryDocx(
  organizationId: string,
  agreementId: string,
  range?: PaymentSummaryReportRange,
  signal?: AbortSignal
): Promise<DownloadedFile> {
  const { blob, filename } = await apiClient.getBlob(
    buildPaymentSummaryDocxUrl(organizationId, agreementId, range),
    { signal }
  )
  return { blob, fileName: filename?.trim() || PAYMENT_SUMMARY_DOCX_FALLBACK_FILE_NAME }
}
