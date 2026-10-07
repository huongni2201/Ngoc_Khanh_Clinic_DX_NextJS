import { apiClient } from "@/shared/api/api-client"
import type {
  HealthExaminationParticipant,
  ImportParticipantsRequest,
  ParticipantImportResult,
  ParticipantListFilterParams,
  ParticipantListResponse,
} from "../types"
import {
  participantImportResponseSchema,
  participantPageResponseSchema,
  type ParticipantSummaryResponseDto,
} from "../types/transport"

export const PARTICIPANT_IMPORT_MAX_BYTES = 5 * 1024 * 1024
export const PARTICIPANT_TEMPLATE_FALLBACK_FILE_NAME = "mau-nhap-nguoi-kham.xlsx"

function participantsEndpoint(organizationId: string, batchId: string) {
  return `/api/v1/organizations/${encodeURIComponent(organizationId)}/health-examination-batches/${encodeURIComponent(batchId)}/participants`
}

export function buildParticipantListUrl(
  organizationId: string,
  batchId: string,
  params: ParticipantListFilterParams = {}
) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    size: String(params.pageSize ?? 10),
    sortKey: params.sortKey ?? "id",
    sortBy: params.sortBy ?? "ASC",
  })
  const search = params.search?.trim()
  if (search) query.set("searchKey", search)
  if (params.rosterStatus) query.set("rosterStatus", params.rosterStatus)
  if (params.attendanceStatus) query.set("attendanceStatus", params.attendanceStatus)
  if (params.reconciliationStatus) query.set("reconciliationStatus", params.reconciliationStatus)

  return `${participantsEndpoint(organizationId, batchId)}?${query.toString()}`
}

export function buildParticipantTemplateUrl(organizationId: string, batchId: string) {
  return `${participantsEndpoint(organizationId, batchId)}/import-template`
}

export function buildParticipantImportUrl(organizationId: string, batchId: string) {
  return `${participantsEndpoint(organizationId, batchId)}/imports`
}

function mapParticipant(participant: ParticipantSummaryResponseDto): HealthExaminationParticipant {
  return {
    id: participant.id,
    batchId: participant.batchId,
    batchDayId: participant.batchDayId,
    examinationDate: participant.examinationDate,
    participantCode: participant.participantCode ?? undefined,
    fullName: participant.fullName,
    dateOfBirth: participant.dateOfBirth,
    sex: participant.sex,
    identificationNumberMasked: participant.identificationNumberMasked,
    departmentName: participant.departmentName,
    positionName: participant.positionName,
    rosterStatus: participant.rosterStatus,
    attendanceStatus: participant.attendanceStatus,
    reconciliationStatus: participant.reconciliationStatus,
    actualExaminationDate: participant.actualExaminationDate ?? undefined,
    preparedAt: participant.preparedAt ?? undefined,
    rowVersion: participant.rowVersion,
  }
}

export async function fetchHealthExaminationBatchParticipants(
  organizationId: string,
  batchId: string,
  params?: ParticipantListFilterParams,
  signal?: AbortSignal
): Promise<ParticipantListResponse> {
  const response = await apiClient.get<unknown>(
    buildParticipantListUrl(organizationId, batchId, params),
    { signal }
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi danh sách người khám không có dữ liệu.")
  }

  const page = participantPageResponseSchema.parse(response.data)
  return {
    data: page.items.map(mapParticipant),
    total: page.totalElements,
    page: page.page,
    pageSize: page.size,
    totalPages: page.totalPages,
  }
}

export interface ParticipantImportTemplate {
  blob: Blob
  fileName: string
}

/** The template is tied to the batch's current `rowVersion` and examination days. */
export async function fetchParticipantImportTemplate(
  organizationId: string,
  batchId: string,
  signal?: AbortSignal
): Promise<ParticipantImportTemplate> {
  const { blob } = await apiClient.getBlob(buildParticipantTemplateUrl(organizationId, batchId), {
    signal,
  })
  return { blob, fileName: PARTICIPANT_TEMPLATE_FALLBACK_FILE_NAME }
}

/**
 * Uploads the workbook as multipart form data. The import is all-or-nothing: the backend adds
 * every row or none. A retry with the same `idempotencyKey` returns the stored result instead of
 * importing twice.
 */
export async function importHealthExaminationBatchParticipants(
  request: ImportParticipantsRequest
): Promise<ParticipantImportResult> {
  const body = new FormData()
  body.append("file", request.file, request.file.name)
  body.append("rowVersion", String(request.rowVersion))

  const response = await apiClient.post<FormData, unknown>(
    buildParticipantImportUrl(request.organizationId, request.batchId),
    body,
    { headers: { "Idempotency-Key": request.idempotencyKey } }
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi nhập danh sách người khám không có dữ liệu.")
  }

  return participantImportResponseSchema.parse(response.data)
}
