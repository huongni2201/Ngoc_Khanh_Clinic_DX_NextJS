"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/shared/ui/toaster"
import { fetchHealthExaminationAgreementsByOrganization, fetchHealthExaminationAgreementById, createHealthExaminationAgreement, updateHealthExaminationAgreement, deleteHealthExaminationAgreement, activateHealthExaminationAgreement, endHealthExaminationAgreement, fetchHealthExaminationAgreementMatrix, fetchHealthExaminationAgreementReport, fetchExaminationDetailExportData, fetchExaminationSummaryExportData } from "../api"
import {
  cancelParticipant,
  createParticipant,
  fetchHealthExaminationAgreementParticipants,
  fetchParticipantDetail,
  fetchParticipantImportTemplate,
  importHealthExaminationAgreementParticipants,
  reactivateParticipant,
  updateParticipant,
} from "../api/participants"
import { healthExaminationKeys } from "../query-keys"
import { saveBlobAs } from "../utils/download-blob"
import { sanitizeFileName } from "../utils/file-name"
import { describeParticipantWriteError } from "../utils/participant-write-errors"
import { CreateHealthExaminationAgreementRequest, DeleteHealthExaminationAgreementRequest, ActivateHealthExaminationAgreementRequest, EndHealthExaminationAgreementRequest, UpdateHealthExaminationAgreementRequest, HealthExaminationAgreementFilterParams, HealthExaminationAgreement, HealthExaminationAgreementListResponse, ParticipantListFilterParams, ParticipantListResponse, ParticipantDetail, CreateParticipantRequest, UpdateParticipantRequest, CancelParticipantRequest, ReactivateParticipantRequest, HealthExaminationParticipant, ImportParticipantsRequest, ParticipantImportResult, ExaminationProgressFilterParams, ExaminationProgressResponse, HealthExaminationAgreementReportSummary } from "../types"

export function useOrganizationHealthExaminationAgreements(
  organizationId: string,
  params?: HealthExaminationAgreementFilterParams
) {
  return useQuery<HealthExaminationAgreementListResponse>({
    queryKey: healthExaminationKeys.agreementList(organizationId, params),
    queryFn: ({ signal }) =>
      fetchHealthExaminationAgreementsByOrganization(organizationId, params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId),
    staleTime: 15_000,
  })
}

export function useHealthExaminationAgreementDetail(
  organizationId: string,
  agreementId: string
) {
  return useQuery<HealthExaminationAgreement>({
    queryKey: healthExaminationKeys.agreement(organizationId, agreementId),
    queryFn: ({ signal }) => fetchHealthExaminationAgreementById(organizationId, agreementId, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && agreementId),
  })
}

/** Re-reads one agreement after a 409 and replaces the cached detail. It never resends a mutation. */
export function useReloadHealthExaminationAgreement(organizationId: string, agreementId: string) {
  const queryClient = useQueryClient()

  return useMutation<HealthExaminationAgreement, Error, void>({
    mutationFn: () => fetchHealthExaminationAgreementById(organizationId, agreementId),
    onSuccess: (agreement) => {
      queryClient.setQueryData(healthExaminationKeys.agreement(organizationId, agreementId), agreement)
    },
  })
}

export function useCreateHealthExaminationAgreement() {
  const queryClient = useQueryClient()

  return useMutation<HealthExaminationAgreement, Error, CreateHealthExaminationAgreementRequest>({
    mutationFn: (request) => createHealthExaminationAgreement(request),
    retry: false,
    onSuccess: (agreement, request) => {
      queryClient.setQueryData(
        healthExaminationKeys.agreement(request.organizationId, agreement.id),
        agreement
      )
      void queryClient.invalidateQueries({
        queryKey: [...healthExaminationKeys.agreements(request.organizationId), "list"],
      })
    },
  })
}

export function useUpdateHealthExaminationAgreement() {
  const queryClient = useQueryClient()

  return useMutation<HealthExaminationAgreement, Error, UpdateHealthExaminationAgreementRequest>({
    mutationFn: (request) => updateHealthExaminationAgreement(request),
    retry: false,
    onSuccess: (agreement, request) => {
      queryClient.setQueryData(
        healthExaminationKeys.agreement(request.organizationId, request.agreementId),
        agreement
      )
      void queryClient.invalidateQueries({
        queryKey: [...healthExaminationKeys.agreements(request.organizationId), "list"],
      })
    },
  })
}

/** Replaces the cached detail of an agreement and refreshes the organization's list. */
function useAgreementChange<TRequest extends { organizationId: string; agreementId: string }>(
  mutationFn: (request: TRequest) => Promise<HealthExaminationAgreement>
) {
  const queryClient = useQueryClient()

  return useMutation<HealthExaminationAgreement, Error, TRequest>({
    // Wrapped so the API function receives only the request, not the mutation context.
    mutationFn: (request) => mutationFn(request),
    retry: false,
    onSuccess: (agreement, request) => {
      queryClient.setQueryData(
        healthExaminationKeys.agreement(request.organizationId, request.agreementId),
        agreement
      )
      void queryClient.invalidateQueries({
        queryKey: [...healthExaminationKeys.agreements(request.organizationId), "list"],
      })
    },
  })
}

/** Activates a draft agreement. It never retries; a 409 is shown with a reload action instead. */
export function useActivateHealthExaminationAgreement() {
  return useAgreementChange<ActivateHealthExaminationAgreementRequest>(
    activateHealthExaminationAgreement
  )
}

/** Ends an active agreement. It never retries. */
export function useEndHealthExaminationAgreement() {
  return useAgreementChange<EndHealthExaminationAgreementRequest>(endHealthExaminationAgreement)
}

export function useDeleteHealthExaminationAgreement() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeleteHealthExaminationAgreementRequest>({
    mutationFn: (request) => deleteHealthExaminationAgreement(request),
    retry: false,
    // The detail cache entry is dropped by the page that shows it, once it stops observing it.
    onSuccess: (_result, request) => {
      void queryClient.invalidateQueries({
        queryKey: [...healthExaminationKeys.agreements(request.organizationId), "list"],
      })
    },
  })
}

export function useHealthExaminationAgreementParticipants(
  organizationId: string,
  agreementId: string,
  params?: ParticipantListFilterParams,
  options?: { enabled?: boolean }
) {
  return useQuery<ParticipantListResponse>({
    queryKey: healthExaminationKeys.participants(
      organizationId,
      agreementId,
      params ?? {}
    ),
    queryFn: ({ signal }) =>
      fetchHealthExaminationAgreementParticipants(organizationId, agreementId, params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && agreementId) && (options?.enabled ?? true),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

/** Downloads the Excel template of one agreement and offers it as a file. It never retries. */
export function useDownloadParticipantImportTemplate(organizationId: string, agreementId: string) {
  return useMutation<{ fileName: string }, Error, { agreementCode?: string } | void>({
    mutationFn: async (input) => {
      const template = await fetchParticipantImportTemplate(organizationId, agreementId)
      const code = sanitizeFileName(input?.agreementCode ?? "")
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
export function useImportHealthExaminationAgreementParticipants() {
  const queryClient = useQueryClient()

  return useMutation<ParticipantImportResult, Error, ImportParticipantsRequest>({
    mutationFn: (request) => importHealthExaminationAgreementParticipants(request),
    retry: false,
    onSuccess: (_result, request) => {
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantsRoot(request.organizationId, request.agreementId),
      })
      // Scheduling at import changes the session counts and its Participant list.
      if (request.sessionId) {
        void queryClient.invalidateQueries({
          queryKey: healthExaminationKeys.sessionsRoot(request.organizationId),
        })
      }
    },
  })
}

/**
 * The complete Participant for the edit form. It is always fetched fresh when the dialog opens: the
 * list only carries the masked CCCD, and an old copy could hold a stale `rowVersion`.
 */
export function useParticipantDetail(
  organizationId: string,
  agreementId: string,
  participantId: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery<ParticipantDetail>({
    queryKey: healthExaminationKeys.participantDetail(
      organizationId,
      agreementId,
      participantId ?? ""
    ),
    queryFn: ({ signal }) =>
      fetchParticipantDetail(organizationId, agreementId, participantId ?? "", signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && agreementId && participantId) && (options?.enabled ?? true),
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
        queryKey: healthExaminationKeys.participantsRoot(request.organizationId, request.agreementId),
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
        queryKey: healthExaminationKeys.participantsRoot(request.organizationId, request.agreementId),
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
        queryKey: healthExaminationKeys.participantsRoot(request.organizationId, request.agreementId),
      })
    },
  })
}

export interface CancelParticipantsRequest {
  organizationId: string
  agreementId: string
  /** The ticked Participants with the version each cancellation is based on. */
  participants: ReadonlyArray<{ id: string; rowVersion: number }>
}

export interface CancelParticipantsResult {
  cancelled: string[]
  /** Participants the backend refused, with Vietnamese guidance. */
  failed: Array<{ id: string; message: string }>
  /** Not tried: the run stopped on a failure every other request would repeat (session, rights, network). */
  notAttempted: string[]
}

/**
 * Cancels the ticked Participants one request at a time (the backend has no bulk endpoint, and each
 * cancellation checks its own version). A failure that would repeat for everyone stops the run.
 * The list is reloaded once at the end. It never retries.
 */
export function useCancelParticipants() {
  const queryClient = useQueryClient()

  return useMutation<CancelParticipantsResult, Error, CancelParticipantsRequest>({
    mutationFn: async ({ organizationId, agreementId, participants }) => {
      const result: CancelParticipantsResult = { cancelled: [], failed: [], notAttempted: [] }
      for (const [index, participant] of participants.entries()) {
        try {
          await cancelParticipant({
            organizationId,
            agreementId,
            participantId: participant.id,
            rowVersion: participant.rowVersion,
          })
          result.cancelled.push(participant.id)
        } catch (error) {
          const described = describeParticipantWriteError(error, "cancel")
          result.failed.push({ id: participant.id, message: described.message })
          if (
            described.kind === "forbidden" ||
            described.kind === "unauthenticated" ||
            described.kind === "network"
          ) {
            result.notAttempted = participants.slice(index + 1).map((rest) => rest.id)
            break
          }
        }
      }
      return result
    },
    retry: false,
    onSettled: (_result, _error, request) => {
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.participantsRoot(request.organizationId, request.agreementId),
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
        queryKey: healthExaminationKeys.participantsRoot(request.organizationId, request.agreementId),
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
    { organizationId: string; agreementId: string; identificationNumber: string }
  >({
    mutationFn: async ({ organizationId, agreementId, identificationNumber }) => {
      const result = await fetchHealthExaminationAgreementParticipants(organizationId, agreementId, {
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

export function useHealthExaminationAgreementMatrix(
  agreementId: string,
  params?: ExaminationProgressFilterParams
) {
  return useQuery<ExaminationProgressResponse>({
    queryKey: healthExaminationKeys.agreementMatrix(agreementId, params),
    queryFn: () => fetchHealthExaminationAgreementMatrix(agreementId, params),
    enabled: Boolean(agreementId),
  })
}

export function useHealthExaminationAgreementReport(agreementId: string) {
  return useQuery<HealthExaminationAgreementReportSummary>({
    queryKey: healthExaminationKeys.agreementReport(agreementId),
    queryFn: () => fetchHealthExaminationAgreementReport(agreementId),
    enabled: Boolean(agreementId),
  })
}

/**
 * Organization-level exports have no backend yet: both mutations reject as unavailable without
 * sending a request. The agreement screens use the real exports in `use-examination-details`.
 */
export function useExportExamDetail() {
  return useMutation<void, Error, { agreementId: string; agreementName?: string }>({
    mutationFn: async ({ agreementId }) => {
      await fetchExaminationDetailExportData(agreementId)
    },
    onError: (error) => toast.error(error.message || "Không thể xuất báo cáo."),
  })
}

export function useExportExamSummary() {
  return useMutation<void, Error, { agreementId: string; agreementName?: string }>({
    mutationFn: async ({ agreementId }) => {
      await fetchExaminationSummaryExportData(agreementId)
    },
    onError: (error) => toast.error(error.message || "Không thể xuất báo cáo."),
  })
}
