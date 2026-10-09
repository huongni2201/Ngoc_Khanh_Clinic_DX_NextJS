"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  downloadExaminationDetailExport,
  fetchExaminationDetails,
  fetchExaminationSummary,
  importExaminationDetails,
} from "../api/examination-details"
import { downloadPaymentSummaryDocx, fetchPaymentSummaryReport } from "../api/reports"
import { healthExaminationKeys } from "../query-keys"
import type {
  DownloadedFile,
  ExaminationDetailImportResult,
  ExaminationDetailListFilterParams,
  ExaminationDetailListResponse,
  ExaminationSummary,
  ImportExaminationDetailsRequest,
  PaymentSummaryReport,
} from "../types"
import { saveBlobAs } from "../utils/download-blob"

interface QueryOptions {
  enabled?: boolean
}

export function useExaminationDetails(
  organizationId: string,
  batchId: string,
  params: ExaminationDetailListFilterParams,
  options?: QueryOptions
) {
  return useQuery<ExaminationDetailListResponse>({
    queryKey: healthExaminationKeys.examinationDetails(organizationId, batchId, params),
    queryFn: ({ signal }) => fetchExaminationDetails(organizationId, batchId, params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && batchId) && (options?.enabled ?? true),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

export function useExaminationSummary(
  organizationId: string,
  batchId: string,
  options?: QueryOptions
) {
  return useQuery<ExaminationSummary>({
    queryKey: healthExaminationKeys.examinationSummary(organizationId, batchId),
    queryFn: ({ signal }) => fetchExaminationSummary(organizationId, batchId, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && batchId) && (options?.enabled ?? true),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

/** Downloads the examination detail workbook and offers it as a file. It never retries. */
export function useExportExaminationDetails(organizationId: string, batchId: string) {
  return useMutation<DownloadedFile, Error, void>({
    mutationFn: async () => {
      const file = await downloadExaminationDetailExport(organizationId, batchId)
      saveBlobAs(file.blob, file.fileName)
      return file
    },
    retry: false,
  })
}

/**
 * Imports the reconciliation workbook. It never retries on its own: the caller resends with the
 * same idempotency key, which the backend answers with the stored result instead of writing twice.
 * A success refreshes everything that shows examination data of the batch.
 */
export function useImportExaminationDetails() {
  const queryClient = useQueryClient()

  return useMutation<ExaminationDetailImportResult, Error, ImportExaminationDetailsRequest>({
    mutationFn: (request) => importExaminationDetails(request),
    retry: false,
    onSuccess: (_result, request) => {
      const { organizationId, batchId } = request
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.examinationDetailsRoot(organizationId, batchId),
      })
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.paymentReport(organizationId, batchId),
      })
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantsRoot(organizationId, batchId),
      })
    },
  })
}

export function usePaymentSummaryReport(
  organizationId: string,
  batchId: string,
  options?: QueryOptions
) {
  return useQuery<PaymentSummaryReport>({
    queryKey: healthExaminationKeys.paymentReport(organizationId, batchId),
    queryFn: ({ signal }) => fetchPaymentSummaryReport(organizationId, batchId, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && batchId) && (options?.enabled ?? true),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

/** Downloads the Word payment summary and offers it as a file. It never retries. */
export function useExportPaymentSummaryDocx(organizationId: string, batchId: string) {
  return useMutation<DownloadedFile, Error, void>({
    mutationFn: async () => {
      const file = await downloadPaymentSummaryDocx(organizationId, batchId)
      saveBlobAs(file.blob, file.fileName)
      return file
    },
    retry: false,
  })
}
