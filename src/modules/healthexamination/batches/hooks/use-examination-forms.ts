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
import { useHealthExaminationBatchParticipants } from "./use-health-examination-batches"

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

export interface ExaminationDayPrintCounts {
  /** Active Participants of the day who have not been examined yet: printed by default. */
  pending?: number
  /** Active Participants of the day who already attended: printed only for a reprint. */
  attended?: number
  isLoading: boolean
  isError: boolean
}

/**
 * How many forms a day print would hold. Only totals are read (one row per page), so the answer is
 * cheap; the backend chooses the real list when the job is created.
 */
export function useExaminationDayPrintCounts(
  organizationId: string,
  batchId: string,
  batchDayId: string | undefined
): ExaminationDayPrintCounts {
  const enabled = Boolean(batchDayId)
  const base = { rosterStatus: "ACTIVE", batchDayId, page: 1, pageSize: 1 } as const
  const pending = useHealthExaminationBatchParticipants(
    organizationId,
    batchId,
    { ...base, attendanceStatus: "UNCONFIRMED" },
    { enabled }
  )
  const attended = useHealthExaminationBatchParticipants(
    organizationId,
    batchId,
    { ...base, attendanceStatus: "ATTENDED" },
    { enabled }
  )
  return {
    pending: pending.data?.total,
    attended: attended.data?.total,
    isLoading: enabled && (pending.isLoading || attended.isLoading),
    isError: pending.isError || attended.isError,
  }
}

/**
 * The active Participants of a day, to put names to the people a day print skipped. A day print
 * never sends names to the dialog, so they are read only when there is something to explain.
 */
export function useExaminationDayPrintEntries(
  organizationId: string,
  batchId: string,
  batchDayId: string | undefined,
  options: { enabled: boolean }
) {
  return useQuery<PrintableParticipants>({
    queryKey: [
      ...healthExaminationKeys.participantsRoot(organizationId, batchId),
      "day-print-entries",
      batchDayId ?? "",
    ],
    queryFn: ({ signal }) =>
      fetchPrintableParticipants(organizationId, batchId, { batchDayId }, signal),
    meta: { requiresAuth: true },
    enabled: Boolean(organizationId && batchId && batchDayId) && options.enabled,
    retry: false,
    staleTime: 60_000,
  })
}
