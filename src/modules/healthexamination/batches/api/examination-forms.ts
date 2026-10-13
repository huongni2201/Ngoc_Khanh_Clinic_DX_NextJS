import { apiClient } from "@/shared/api/api-client"
import type {
  CreateExaminationFormPrintJobRequest,
  DownloadedFile,
  ExaminationFormPrintEntry,
  ExaminationFormPrintJob,
  ParticipantListFilterParams,
} from "../types"
import {
  examinationFormPrintJobResponseSchema,
  type ExaminationFormPrintJobRequestDto,
} from "../types/transport"
import { fetchHealthExaminationBatchParticipants } from "./participants"

/** Records one print job may hold (`nkc.document.jobs.max-records`). */
export const EXAMINATION_FORM_PRINT_JOB_MAX_RECORDS = 1000
/** The backend fills the template and converts it to PDF before answering (Gotenberg: 15 s). */
export const EXAMINATION_FORM_RENDER_TIMEOUT_MS = 45_000
export const EXAMINATION_FORM_FALLBACK_FILE_NAME = "phieu-kham.pdf"
/** Largest page the Participant list returns. */
const LIST_PAGE_SIZE = 100

function participantsEndpoint(organizationId: string, batchId: string) {
  return `/api/v1/organizations/${encodeURIComponent(organizationId)}/health-examination-batches/${encodeURIComponent(batchId)}/participants`
}

export function buildExaminationFormUrl(
  organizationId: string,
  batchId: string,
  participantId: string
) {
  return `${participantsEndpoint(organizationId, batchId)}/${encodeURIComponent(participantId)}/examination-form`
}

export function buildExaminationFormPrintJobsUrl(organizationId: string, batchId: string) {
  return `${participantsEndpoint(organizationId, batchId)}/examination-form-print-jobs`
}

/**
 * The blank examination form of one Participant as a PDF, rendered on demand and never stored.
 * The administrative part is pre-filled; the clinical part stays empty for the doctor.
 */
export async function fetchExaminationForm(
  organizationId: string,
  batchId: string,
  participantId: string,
  signal?: AbortSignal
): Promise<DownloadedFile> {
  const { blob, filename } = await apiClient.getBlob(
    buildExaminationFormUrl(organizationId, batchId, participantId),
    { signal, timeoutMs: EXAMINATION_FORM_RENDER_TIMEOUT_MS }
  )
  return { blob, fileName: filename?.trim() || EXAMINATION_FORM_FALLBACK_FILE_NAME }
}

/**
 * Queues the forms of many Participants in a background job (202). The same `idempotencyKey` with
 * the same body returns the job already queued instead of a second one.
 */
export async function createExaminationFormPrintJob(
  request: CreateExaminationFormPrintJobRequest
): Promise<ExaminationFormPrintJob> {
  const response = await apiClient.post<ExaminationFormPrintJobRequestDto, unknown>(
    buildExaminationFormPrintJobsUrl(request.organizationId, request.batchId),
    { participantIds: request.participantIds },
    { headers: { "Idempotency-Key": request.idempotencyKey } }
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi tạo lệnh in không có dữ liệu.")
  }
  return examinationFormPrintJobResponseSchema.parse(response.data)
}

export interface PrintableParticipants {
  /** Participants on the active roster that match the filter, in list order. */
  entries: ExaminationFormPrintEntry[]
  /** Matching Participants on the active roster. */
  total: number
  /** More than one print job may hold: nothing was collected beyond the first page. */
  tooMany: boolean
}

/**
 * Collects every active Participant that matches the list filter, page by page in the list order.
 * Cancelled Participants are never printable, so the roster filter is always `ACTIVE`.
 */
export async function fetchPrintableParticipants(
  organizationId: string,
  batchId: string,
  filter: Omit<ParticipantListFilterParams, "page" | "pageSize" | "rosterStatus">,
  signal?: AbortSignal,
  maxRecords: number = EXAMINATION_FORM_PRINT_JOB_MAX_RECORDS
): Promise<PrintableParticipants> {
  const entries: ExaminationFormPrintEntry[] = []
  let page = 1
  for (;;) {
    const result = await fetchHealthExaminationBatchParticipants(
      organizationId,
      batchId,
      { ...filter, rosterStatus: "ACTIVE", page, pageSize: LIST_PAGE_SIZE },
      signal
    )
    if (result.total > maxRecords) return { entries: [], total: result.total, tooMany: true }
    for (const participant of result.data) {
      entries.push({
        id: participant.id,
        participantCode: participant.participantCode,
        fullName: participant.fullName,
        departmentName: participant.departmentName,
      })
    }
    if (result.data.length === 0 || page >= result.totalPages) {
      return { entries: uniqueById(entries), total: result.total, tooMany: false }
    }
    page += 1
  }
}

/** A row added between two page reads can shift the next page; keep the first occurrence only. */
function uniqueById(entries: ExaminationFormPrintEntry[]): ExaminationFormPrintEntry[] {
  const seen = new Set<string>()
  return entries.filter((entry) => (seen.has(entry.id) ? false : (seen.add(entry.id), true)))
}
