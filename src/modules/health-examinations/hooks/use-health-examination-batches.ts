"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchClinicalServiceCatalog,
  fetchHealthExaminationBatchesByOrganization,
  fetchHealthExaminationBatchById,
  createHealthExaminationBatch,
  updateHealthExaminationBatch,
  deleteHealthExaminationBatch,
  fetchHealthExaminationBatchMatrix,
  fetchHealthExaminationBatchReport,
  fetchExaminationDetailExportData,
  fetchExaminationSummaryExportData,
} from "@/modules/health-examinations/api"
import {
  fetchHealthExaminationBatchParticipants,
  fetchParticipantImportTemplate,
  importHealthExaminationBatchParticipants,
} from "../api/participants"
import { healthExaminationKeys } from "../query-keys"
import {
  downloadFile,
  generateDetailHorizontalCSV,
  generateSummaryVerticalCSV,
  sanitizeFileName,
} from "../utils/export-excel"
import { saveBlobAs } from "../utils/download-blob"
import {
  CreateHealthExaminationBatchRequest,
  DeleteHealthExaminationBatchRequest,
  UpdateHealthExaminationBatchRequest,
  HealthExaminationBatchFilterParams,
  HealthExaminationBatch,
  ClinicalService,
  HealthExaminationBatchListResponse,
  ParticipantListFilterParams,
  ParticipantListResponse,
  ImportParticipantsRequest,
  ParticipantImportResult,
  ExaminationProgressFilterParams,
  ExaminationProgressResponse,
  HealthExaminationBatchReportSummary,
} from "../types"

/** The catalog is only requested while a form that needs it is open. */
export function useClinicalServices(enabled = true) {
  return useQuery<ClinicalService[]>({
    queryKey: healthExaminationKeys.clinicalServices(),
    queryFn: ({ signal }) => fetchClinicalServiceCatalog(signal),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useOrganizationHealthExaminationBatches(
  organizationId: string,
  params?: HealthExaminationBatchFilterParams
) {
  return useQuery<HealthExaminationBatchListResponse>({
    queryKey: healthExaminationKeys.batchList(organizationId, params),
    queryFn: ({ signal }) =>
      fetchHealthExaminationBatchesByOrganization(organizationId, params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId),
    staleTime: 15_000,
  })
}

export function useHealthExaminationBatchDetail(
  organizationId: string,
  batchId: string
) {
  return useQuery<HealthExaminationBatch>({
    queryKey: healthExaminationKeys.batch(organizationId, batchId),
    queryFn: ({ signal }) => fetchHealthExaminationBatchById(organizationId, batchId, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && batchId),
  })
}

/** Re-reads one batch after a 409 and replaces the cached detail. It never resends a mutation. */
export function useReloadHealthExaminationBatch(organizationId: string, batchId: string) {
  const queryClient = useQueryClient()

  return useMutation<HealthExaminationBatch, Error, void>({
    mutationFn: () => fetchHealthExaminationBatchById(organizationId, batchId),
    onSuccess: (batch) => {
      queryClient.setQueryData(healthExaminationKeys.batch(organizationId, batchId), batch)
    },
  })
}

export function useCreateHealthExaminationBatch() {
  const queryClient = useQueryClient()

  return useMutation<HealthExaminationBatch, Error, CreateHealthExaminationBatchRequest>({
    mutationFn: (request) => createHealthExaminationBatch(request),
    retry: false,
    onSuccess: (batch, request) => {
      queryClient.setQueryData(
        healthExaminationKeys.batch(request.organizationId, batch.id),
        batch
      )
      void queryClient.invalidateQueries({
        queryKey: [...healthExaminationKeys.batches(request.organizationId), "list"],
      })
    },
  })
}

export function useUpdateHealthExaminationBatch() {
  const queryClient = useQueryClient()

  return useMutation<HealthExaminationBatch, Error, UpdateHealthExaminationBatchRequest>({
    mutationFn: (request) => updateHealthExaminationBatch(request),
    retry: false,
    onSuccess: (batch, request) => {
      queryClient.setQueryData(
        healthExaminationKeys.batch(request.organizationId, request.batchId),
        batch
      )
      void queryClient.invalidateQueries({
        queryKey: [...healthExaminationKeys.batches(request.organizationId), "list"],
      })
    },
  })
}

export function useDeleteHealthExaminationBatch() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeleteHealthExaminationBatchRequest>({
    mutationFn: (request) => deleteHealthExaminationBatch(request),
    retry: false,
    // The detail cache entry is dropped by the page that shows it, once it stops observing it.
    onSuccess: (_result, request) => {
      void queryClient.invalidateQueries({
        queryKey: [...healthExaminationKeys.batches(request.organizationId), "list"],
      })
    },
  })
}

export function useHealthExaminationBatchParticipants(
  organizationId: string,
  batchId: string,
  params?: ParticipantListFilterParams,
  options?: { enabled?: boolean }
) {
  return useQuery<ParticipantListResponse>({
    queryKey: healthExaminationKeys.participants(
      organizationId,
      batchId,
      params ?? {}
    ),
    queryFn: ({ signal }) =>
      fetchHealthExaminationBatchParticipants(organizationId, batchId, params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && batchId) && (options?.enabled ?? true),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

/** Downloads the Excel template of one batch and offers it as a file. It never retries. */
export function useDownloadParticipantImportTemplate(organizationId: string, batchId: string) {
  return useMutation<{ fileName: string }, Error, { batchCode?: string } | void>({
    mutationFn: async (input) => {
      const template = await fetchParticipantImportTemplate(organizationId, batchId)
      const code = sanitizeFileName(input?.batchCode ?? "")
      const fileName = code ? `mau-nhap-nguoi-kham-${code}.xlsx` : template.fileName
      saveBlobAs(template.blob, fileName)
      return { fileName }
    },
    retry: false,
  })
}

/**
 * Imports a roster workbook. It never retries on its own: the caller resends with the same
 * idempotency key, which the backend answers with the stored result instead of importing again.
 */
export function useImportHealthExaminationBatchParticipants() {
  const queryClient = useQueryClient()

  return useMutation<ParticipantImportResult, Error, ImportParticipantsRequest>({
    mutationFn: (request) => importHealthExaminationBatchParticipants(request),
    retry: false,
    onSuccess: (_result, request) => {
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantsRoot(request.organizationId, request.batchId),
      })
    },
  })
}

export function useHealthExaminationBatchMatrix(
  batchId: string,
  params?: ExaminationProgressFilterParams
) {
  return useQuery<ExaminationProgressResponse>({
    queryKey: healthExaminationKeys.batchMatrix(batchId, params),
    queryFn: () => fetchHealthExaminationBatchMatrix(batchId, params),
    enabled: Boolean(batchId),
  })
}

export function useHealthExaminationBatchReport(batchId: string) {
  return useQuery<HealthExaminationBatchReportSummary>({
    queryKey: healthExaminationKeys.batchReport(batchId),
    queryFn: () => fetchHealthExaminationBatchReport(batchId),
    enabled: Boolean(batchId),
  })
}

export function useExportExamDetail() {
  return useMutation<
    { filename: string; rowCount: number },
    Error,
    { batchId: string; batchName?: string }
  >({
    mutationFn: async ({ batchId, batchName }) => {
      const data = await fetchExaminationDetailExportData(batchId)
      const csv = generateDetailHorizontalCSV(data)
      const sanitized =
        sanitizeFileName(batchName || data.batchName) || data.batchCode || batchId
      const filename = `chi-tiet-kham-${sanitized}.csv`
      downloadFile(csv, filename)
      return { filename, rowCount: data.rows.length }
    },
  })
}

export function useExportExamSummary() {
  return useMutation<
    { filename: string; itemCount: number },
    Error,
    { batchId: string; batchName?: string }
  >({
    mutationFn: async ({ batchId, batchName }) => {
      const data = await fetchExaminationSummaryExportData(batchId)
      const csv = generateSummaryVerticalCSV(data)
      const sanitized =
        sanitizeFileName(batchName || data.batchName) || data.batchCode || batchId
      const filename = `bao-cao-tong-hop-${sanitized}.csv`
      downloadFile(csv, filename)
      return { filename, itemCount: data.items.length }
    },
  })
}



