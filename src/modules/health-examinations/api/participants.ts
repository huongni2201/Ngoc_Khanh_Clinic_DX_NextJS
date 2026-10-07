import { apiClient } from "@/shared/api/api-client"
import type {
  CancelParticipantRequest,
  CreateParticipantRequest,
  HealthExaminationParticipant,
  ImportParticipantsRequest,
  ParticipantDetail,
  ParticipantImportResult,
  ParticipantInput,
  ParticipantListFilterParams,
  ParticipantListResponse,
  ReactivateParticipantRequest,
  UpdateParticipantRequest,
} from "../types"
import {
  participantDetailResponseSchema,
  participantImportResponseSchema,
  participantPageResponseSchema,
  type ParticipantDetailResponseDto,
  type ParticipantReactivateRequestDto,
  type ParticipantSummaryResponseDto,
  type ParticipantUpdateRequestDto,
  type ParticipantWriteRequestDto,
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
  const identificationNumber = params.identificationNumber?.trim()
  if (identificationNumber) query.set("identificationNumber", identificationNumber)
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

export function buildParticipantItemUrl(
  organizationId: string,
  batchId: string,
  participantId: string
) {
  return `${participantsEndpoint(organizationId, batchId)}/${encodeURIComponent(participantId)}`
}

export function buildParticipantCancelUrl(
  organizationId: string,
  batchId: string,
  participantId: string,
  rowVersion: number
) {
  return `${buildParticipantItemUrl(organizationId, batchId, participantId)}?rowVersion=${encodeURIComponent(
    String(rowVersion)
  )}`
}

export function buildParticipantReactivateUrl(
  organizationId: string,
  batchId: string,
  participantId: string
) {
  return `${buildParticipantItemUrl(organizationId, batchId, participantId)}/reactivate`
}

function mapParticipantDetail(participant: ParticipantDetailResponseDto): ParticipantDetail {
  return {
    ...mapParticipant(participant),
    identificationNumber: participant.identificationNumber,
    phone: participant.phone ?? undefined,
    email: participant.email ?? undefined,
    patientLinked: participant.patientLinked,
    source: participant.source,
    createdAt: participant.createdAt,
    updatedAt: participant.updatedAt,
  }
}

/** Optional text that was left blank is sent as `null`, never as an empty string. */
function toWriteBody(input: ParticipantInput): ParticipantWriteRequestDto {
  return {
    participantCode: input.participantCode?.trim() || null,
    fullName: input.fullName.trim(),
    dateOfBirth: input.dateOfBirth,
    sex: input.sex,
    identificationNumber: input.identificationNumber.trim(),
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    departmentName: input.departmentName.trim(),
    positionName: input.positionName.trim(),
    batchDayId: input.batchDayId,
  }
}

function parseDetail(data: unknown, emptyMessage: string): ParticipantDetail {
  if (!data) throw new Error(emptyMessage)
  return mapParticipantDetail(participantDetailResponseSchema.parse(data))
}

/** The complete Participant (full CCCD, phone, email) for the edit form. Requires the manage permission. */
export async function fetchParticipantDetail(
  organizationId: string,
  batchId: string,
  participantId: string,
  signal?: AbortSignal
): Promise<ParticipantDetail> {
  const response = await apiClient.get<unknown>(
    buildParticipantItemUrl(organizationId, batchId, participantId),
    { signal }
  )
  return parseDetail(response.data, response.message || "Phản hồi chi tiết người khám không có dữ liệu.")
}

/**
 * Adds one Participant by hand. There is no idempotency key: the backend rejects a second submit
 * with the same CCCD as a conflict.
 */
export async function createParticipant(
  request: CreateParticipantRequest
): Promise<ParticipantDetail> {
  const response = await apiClient.post<ParticipantWriteRequestDto, unknown>(
    participantsEndpoint(request.organizationId, request.batchId),
    toWriteBody(request)
  )
  return parseDetail(response.data, response.message || "Phản hồi thêm người khám không có dữ liệu.")
}

export async function updateParticipant(
  request: UpdateParticipantRequest
): Promise<ParticipantDetail> {
  const response = await apiClient.put<ParticipantUpdateRequestDto, unknown>(
    buildParticipantItemUrl(request.organizationId, request.batchId, request.participantId),
    { ...toWriteBody(request), rowVersion: request.rowVersion }
  )
  return parseDetail(
    response.data,
    response.message || "Phản hồi cập nhật người khám không có dữ liệu."
  )
}

/** Cancels, not deletes: the roster status becomes CANCELLED and the CCCD stays reserved. */
export async function cancelParticipant(request: CancelParticipantRequest): Promise<void> {
  await apiClient.delete<void>(
    buildParticipantCancelUrl(
      request.organizationId,
      request.batchId,
      request.participantId,
      request.rowVersion
    )
  )
}

/**
 * Returns a cancelled Participant to the active roster: the same row becomes ACTIVE again, nothing
 * is added. Without `batchDayId` the Participant keeps the day it had when it was cancelled.
 */
export async function reactivateParticipant(
  request: ReactivateParticipantRequest
): Promise<ParticipantDetail> {
  const body: ParticipantReactivateRequestDto = { rowVersion: request.rowVersion }
  if (request.batchDayId) body.batchDayId = request.batchDayId
  const response = await apiClient.post<ParticipantReactivateRequestDto, unknown>(
    buildParticipantReactivateUrl(request.organizationId, request.batchId, request.participantId),
    body
  )
  return parseDetail(
    response.data,
    response.message || "Phản hồi khôi phục người khám không có dữ liệu."
  )
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
