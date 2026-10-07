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
  cancelParticipant,
  createParticipant,
  fetchHealthExaminationBatchParticipants,
  fetchParticipantDetail,
  fetchParticipantImportTemplate,
  importHealthExaminationBatchParticipants,
  reactivateParticipant,
  updateParticipant,
} from "../api/participants"
import { healthExaminationKeys } from "../query-keys"
import { saveBlobAs } from "../utils/download-blob"
import { sanitizeFileName } from "../utils/file-name"
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
  ParticipantDetail,
  CreateParticipantRequest,
  UpdateParticipantRequest,
  CancelParticipantRequest,
  ReactivateParticipantRequest,
  HealthExaminationParticipant,
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

/**
 * The complete Participant for the edit form. It is always fetched fresh when the dialog opens: the
 * list only carries the masked CCCD, and an old copy could hold a stale `rowVersion`.
 */
export function useParticipantDetail(
  organizationId: string,
  batchId: string,
  participantId: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery<ParticipantDetail>({
    queryKey: healthExaminationKeys.participantDetail(
      organizationId,
      batchId,
      participantId ?? ""
    ),
    queryFn: ({ signal }) =>
      fetchParticipantDetail(organizationId, batchId, participantId ?? "", signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && batchId && participantId) && (options?.enabled ?? true),
    staleTime: 0,
    gcTime: 0,
  })
}

/** Adds one Participant by hand. It never retries: a second submit would be a duplicate CCCD. */
export function useCreateParticipant() {
  const queryClient = useQueryClient()

  return useMutation<ParticipantDetail, Error, CreateParticipantRequest>({
    mutationFn: (request) => createParticipant(request),
    retry: false,
    onSuccess: (_result, request) => {
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantsRoot(request.organizationId, request.batchId),
      })
    },
  })
}

export function useUpdateParticipant() {
  const queryClient = useQueryClient()

  return useMutation<ParticipantDetail, Error, UpdateParticipantRequest>({
    mutationFn: (request) => updateParticipant(request),
    retry: false,
    onSuccess: (_result, request) => {
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantsRoot(request.organizationId, request.batchId),
      })
    },
  })
}

export function useCancelParticipant() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, CancelParticipantRequest>({
    mutationFn: (request) => cancelParticipant(request),
    retry: false,
    onSuccess: (_result, request) => {
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantsRoot(request.organizationId, request.batchId),
      })
    },
  })
}

/** Returns a cancelled Participant to the active roster. It never retries. */
export function useReactivateParticipant() {
  const queryClient = useQueryClient()

  return useMutation<ParticipantDetail, Error, ReactivateParticipantRequest>({
    mutationFn: (request) => reactivateParticipant(request),
    retry: false,
    onSuccess: (_result, request) => {
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantsRoot(request.organizationId, request.batchId),
      })
    },
  })
}

/**
 * Finds the cancelled Participant that holds a CCCD, after adding the same CCCD was refused as a
 * duplicate. It resolves to `null` when no cancelled Participant holds it. A lookup failure
 * rejects so the caller can fall back to the plain duplicate message.
 */
export function useFindCancelledParticipant() {
  return useMutation<
    HealthExaminationParticipant | null,
    Error,
    { organizationId: string; batchId: string; identificationNumber: string }
  >({
    mutationFn: async ({ organizationId, batchId, identificationNumber }) => {
      const result = await fetchHealthExaminationBatchParticipants(organizationId, batchId, {
        identificationNumber,
        rosterStatus: "CANCELLED",
        page: 1,
        pageSize: 1,
      })
      return result.data.find((participant) => participant.rosterStatus === "CANCELLED") ?? null
    },
    retry: false,
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

/**
 * Organization-level exports have no backend yet: both mutations reject as unavailable without
 * sending a request. The batch screens use the real exports in `use-examination-details`.
 */
export function useExportExamDetail() {
  return useMutation<void, Error, { batchId: string; batchName?: string }>({
    mutationFn: async ({ batchId }) => {
      await fetchExaminationDetailExportData(batchId)
    },
  })
}

export function useExportExamSummary() {
  return useMutation<void, Error, { batchId: string; batchName?: string }>({
    mutationFn: async ({ batchId }) => {
      await fetchExaminationSummaryExportData(batchId)
    },
  })
}
