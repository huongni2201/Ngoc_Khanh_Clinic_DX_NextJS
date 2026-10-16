"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import {
  createExaminationFormPrintJob,
  fetchExaminationForm,
  fetchPrintableParticipants,
  type PrintableParticipants,
} from "../api/examination-forms"
import { healthExaminationKeys } from "../query-keys"
import type {
  CreateExaminationFormPrintJobRequest,
  DownloadedFile,
  ExaminationFormPrintJob,
  ParticipantListFilterParams,
} from "../types"

/**
 * The PDF form of one Participant while its preview is open. The backend renders it on every
 * request and marks it `no-store`; the bytes are dropped as soon as the preview closes.
 */
export function useExaminationForm(
  organizationId: string,
  agreementId: string,
  participantId: string | undefined,
  options?: { enabled?: boolean; sessionId?: string }
) {
  return useQuery<DownloadedFile>({
    queryKey: [
      ...healthExaminationKeys.examinationForm(organizationId, agreementId, participantId ?? ""),
      options?.sessionId ?? "",
    ],
    queryFn: ({ signal }) =>
      fetchExaminationForm(
        organizationId,
        agreementId,
        participantId as string,
        signal,
        options?.sessionId
      ),
    meta: { requiresAuth: true },
    enabled: Boolean(organizationId && agreementId && participantId) && (options?.enabled ?? true),
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })
}

/** Queues a bulk print job. It never retries on its own; a manual retry reuses the same key. */
export function useCreateExaminationFormPrintJob() {
  return useMutation<ExaminationFormPrintJob, Error, CreateExaminationFormPrintJobRequest>({
    mutationFn: (request) => createExaminationFormPrintJob(request),
    retry: false,
  })
}

/** Reads every active Participant matching the list filter, to select them all for printing. */
export function useSelectPrintableParticipants(organizationId: string, agreementId: string) {
  return useMutation<
    PrintableParticipants,
    Error,
    Omit<ParticipantListFilterParams, "page" | "pageSize" | "rosterStatus">
  >({
    mutationFn: (filter) => fetchPrintableParticipants(organizationId, agreementId, filter),
    retry: false,
  })
}

/**
 * The active Participants of a session, to put names to the people a session print skipped. A
 * session print never sends names to the dialog, so they are read only when there is something to
 * explain.
 */
export function useExaminationSessionPrintEntries(
  organizationId: string,
  agreementId: string,
  sessionId: string | undefined,
  options: { enabled: boolean }
) {
  return useQuery<PrintableParticipants>({
    queryKey: [
      ...healthExaminationKeys.participantsRoot(organizationId, agreementId),
      "session-print-entries",
      sessionId ?? "",
    ],
    queryFn: ({ signal }) =>
      fetchPrintableParticipants(organizationId, agreementId, { sessionId }, signal),
    meta: { requiresAuth: true },
    enabled: Boolean(organizationId && agreementId && sessionId) && options.enabled,
    retry: false,
    staleTime: 60_000,
  })
}
