import { apiClient } from "@/shared/api/api-client"
import type { DownloadedFile, PaymentSummaryReport } from "../types"
import { paymentSummaryReportResponseSchema } from "../types/transport"

export const PAYMENT_SUMMARY_DOCX_FALLBACK_FILE_NAME = "bao-cao-thanh-toan.docx"

function reportEndpoint(organizationId: string, batchId: string) {
  return `/api/v1/organizations/${encodeURIComponent(organizationId)}/health-examination-batches/${encodeURIComponent(batchId)}/reports/payment-summary`
}

export function buildPaymentSummaryUrl(organizationId: string, batchId: string) {
  return reportEndpoint(organizationId, batchId)
}

export function buildPaymentSummaryDocxUrl(organizationId: string, batchId: string) {
  return `${reportEndpoint(organizationId, batchId)}/docx`
}

export async function fetchPaymentSummaryReport(
  organizationId: string,
  batchId: string,
  signal?: AbortSignal
): Promise<PaymentSummaryReport> {
  const response = await apiClient.get<unknown>(buildPaymentSummaryUrl(organizationId, batchId), {
    signal,
  })
  if (!response.data) {
    throw new Error(response.message || "Phản hồi báo cáo thanh toán không có dữ liệu.")
  }

  const report = paymentSummaryReportResponseSchema.parse(response.data)
  return {
    ...report,
    items: report.items.map((item) => ({
      batchServiceId: item.batchServiceId,
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
  batchId: string,
  signal?: AbortSignal
): Promise<DownloadedFile> {
  const { blob, filename } = await apiClient.getBlob(
    buildPaymentSummaryDocxUrl(organizationId, batchId),
    { signal }
  )
  return { blob, fileName: filename?.trim() || PAYMENT_SUMMARY_DOCX_FALLBACK_FILE_NAME }
}
