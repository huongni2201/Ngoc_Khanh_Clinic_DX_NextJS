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
  batchId: string,
  participantId: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery<DownloadedFile>({
    queryKey: healthExaminationKeys.examinationForm(organizationId, batchId, participantId ?? ""),
    queryFn: ({ signal }) =>
      fetchExaminationForm(organizationId, batchId, participantId as string, signal),
    meta: { requiresAuth: true },
    enabled: Boolean(organizationId && batchId && participantId) && (options?.enabled ?? true),
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
export function useSelectPrintableParticipants(organizationId: string, batchId: string) {
  return useMutation<
    PrintableParticipants,
    Error,
    Omit<ParticipantListFilterParams, "page" | "pageSize" | "rosterStatus">
  >({
    mutationFn: (filter) => fetchPrintableParticipants(organizationId, batchId, filter),
    retry: false,
  })
}
