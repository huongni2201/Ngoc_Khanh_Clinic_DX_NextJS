"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/shared/ui/toaster"
import {
  downloadExaminationDetailExport,
  downloadExaminationDetailTemplate,
  fetchExaminationDetails,
  fetchExaminationSummary,
  importExaminationDetails,
  recordExaminationDetail,
} from "../api/examination-details"
import { downloadPaymentSummaryDocx, fetchPaymentSummaryReport } from "../api/reports"
import { healthExaminationKeys } from "../query-keys"
import type {
  DownloadedFile,
  ExaminationDetailImportResult,
  ExaminationDetailListFilterParams,
  ExaminationDetailListResponse,
  ExaminationDetailRow,
  ExaminationSummary,
  ImportExaminationDetailsRequest,
  PaymentSummaryReport,
  PaymentSummaryReportRange,
  RecordExaminationDetailRequest,
} from "../types"
import { saveBlobAs } from "../utils/download-blob"

interface QueryOptions {
  enabled?: boolean
}

export function useExaminationDetails(
  organizationId: string,
  agreementId: string,
  params: ExaminationDetailListFilterParams,
  options?: QueryOptions
) {
  return useQuery<ExaminationDetailListResponse>({
    queryKey: healthExaminationKeys.examinationDetails(organizationId, agreementId, params),
    queryFn: ({ signal }) => fetchExaminationDetails(organizationId, agreementId, params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && agreementId) && (options?.enabled ?? true),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

export function useExaminationSummary(
  organizationId: string,
  agreementId: string,
  options?: QueryOptions
) {
  return useQuery<ExaminationSummary>({
    queryKey: healthExaminationKeys.examinationSummary(organizationId, agreementId),
    queryFn: ({ signal }) => fetchExaminationSummary(organizationId, agreementId, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && agreementId) && (options?.enabled ?? true),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

/** Downloads the examination detail workbook and offers it as a file. It never retries. */
export function useExportExaminationDetails(organizationId: string, agreementId: string) {
  return useMutation<DownloadedFile, Error, void>({
    mutationFn: async () => {
      const file = await downloadExaminationDetailExport(organizationId, agreementId)
      saveBlobAs(file.blob, file.fileName)
      return file
    },
    retry: false,
    onSuccess: (file) => toast.success("Đã xuất tệp chi tiết khám.", { description: file.fileName }),
    onError: (error) => toast.error(error.message || "Không thể xuất tệp Excel."),
  })
}

/** Downloads the pre-filled import template and offers it as a file. It never retries. */
export function useDownloadExaminationDetailTemplate(organizationId: string, agreementId: string) {
  return useMutation<DownloadedFile, Error, void>({
    mutationFn: async () => {
      const file = await downloadExaminationDetailTemplate(organizationId, agreementId)
      saveBlobAs(file.blob, file.fileName)
      return file
    },
    retry: false,
  })
}

/**
 * Records one Participant by hand. It never retries on its own: a resend after a lost response is
 * safe because the backend answers a request that equals the stored state with the stored row. On
 * success the returned row replaces the cached one on every cached page (the screen updates at
 * once), and the counters, the payment report and the roster are refreshed.
 */
export function useRecordExaminationDetail() {
  const queryClient = useQueryClient()

  return useMutation<ExaminationDetailRow, Error, RecordExaminationDetailRequest>({
    mutationFn: (request) => recordExaminationDetail(request),
    retry: false,
    onSuccess: (row, request) => {
      const { organizationId, agreementId } = request
      queryClient.setQueriesData<ExaminationDetailListResponse>(
        { queryKey: [...healthExaminationKeys.examinationDetailsRoot(organizationId, agreementId), "list"] },
        (cached) =>
          cached
            ? { ...cached, data: cached.data.map((item) => (item.id === row.id ? row : item)) }
            : cached
      )
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.examinationSummary(organizationId, agreementId),
      })
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.paymentReport(organizationId, agreementId),
      })
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantsRoot(organizationId, agreementId),
      })
    },
  })
}

/**
 * Imports the reconciliation workbook. It never retries on its own: the caller resends with the
 * same idempotency key, which the backend answers with the stored result instead of writing twice.
 * A success refreshes everything that shows examination data of the agreement.
 */
export function useImportExaminationDetails() {
  const queryClient = useQueryClient()

  return useMutation<ExaminationDetailImportResult, Error, ImportExaminationDetailsRequest>({
    mutationFn: (request) => importExaminationDetails(request),
    retry: false,
    onSuccess: (_result, request) => {
      const { organizationId, agreementId } = request
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.examinationDetailsRoot(organizationId, agreementId),
      })
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.paymentReport(organizationId, agreementId),
      })
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantsRoot(organizationId, agreementId),
      })
    },
  })
}

/** `range` limits the figures to the sessions of that date range; omitted counts the whole agreement. */
export function usePaymentSummaryReport(
  organizationId: string,
  agreementId: string,
  options?: QueryOptions,
  range?: PaymentSummaryReportRange
) {
  return useQuery<PaymentSummaryReport>({
    queryKey: healthExaminationKeys.paymentReport(organizationId, agreementId, range),
    queryFn: ({ signal }) => fetchPaymentSummaryReport(organizationId, agreementId, range, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && agreementId) && (options?.enabled ?? true),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

/** Downloads the Word payment summary and offers it as a file. It never retries. */
export function useExportPaymentSummaryDocx(
  organizationId: string,
  agreementId: string,
  range?: PaymentSummaryReportRange
) {
  return useMutation<DownloadedFile, Error, void>({
    mutationFn: async () => {
      const file = await downloadPaymentSummaryDocx(organizationId, agreementId, range)
      saveBlobAs(file.blob, file.fileName)
      return file
    },
    retry: false,
    onSuccess: (file) => toast.success("Đã xuất báo cáo Word.", { description: file.fileName }),
    onError: (error) => toast.error(error.message || "Không thể xuất báo cáo Word."),
  })
}
