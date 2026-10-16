import { parseApiData } from "@/shared/api/parse-api-data"
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

function participantsEndpoint(organizationId: string, agreementId: string) {
  return `/api/v1/organizations/${encodeURIComponent(organizationId)}/agreements/${encodeURIComponent(agreementId)}/participants`
}

export function buildParticipantListUrl(
  organizationId: string,
  agreementId: string,
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
  if (params.sessionId) query.set("sessionId", params.sessionId)
  if (params.unscheduledFor) query.set("unscheduledFor", params.unscheduledFor)

  return `${participantsEndpoint(organizationId, agreementId)}?${query.toString()}`
}

export function buildParticipantTemplateUrl(organizationId: string, agreementId: string) {
  return `${participantsEndpoint(organizationId, agreementId)}/import-template`
}

export function buildParticipantImportUrl(organizationId: string, agreementId: string) {
  return `${participantsEndpoint(organizationId, agreementId)}/imports`
}

function mapParticipant(participant: ParticipantSummaryResponseDto): HealthExaminationParticipant {
  return {
    ...mapParticipantBase(participant),
    liveAssignmentCount: participant.liveAssignmentCount,
    nextSessionDate: participant.nextSessionDate ?? undefined,
    lastAttendedDate: participant.lastAttendedDate ?? undefined,
  }
}

type ParticipantBaseDto = Omit<
  ParticipantSummaryResponseDto,
  "liveAssignmentCount" | "nextSessionDate" | "lastAttendedDate"
>

function mapParticipantBase(
  participant: ParticipantBaseDto
): Omit<HealthExaminationParticipant, "liveAssignmentCount" | "nextSessionDate" | "lastAttendedDate"> {
  return {
    id: participant.id,
    agreementId: participant.agreementId,
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
    preparedAt: participant.preparedAt ?? undefined,
    rowVersion: participant.rowVersion,
  }
}

export function buildParticipantItemUrl(
  organizationId: string,
  agreementId: string,
  participantId: string
) {
  return `${participantsEndpoint(organizationId, agreementId)}/${encodeURIComponent(participantId)}`
}

export function buildParticipantCancelUrl(
  organizationId: string,
  agreementId: string,
  participantId: string,
  rowVersion: number
) {
  return `${buildParticipantItemUrl(organizationId, agreementId, participantId)}?rowVersion=${encodeURIComponent(
    String(rowVersion)
  )}`
}

export function buildParticipantReactivateUrl(
  organizationId: string,
  agreementId: string,
  participantId: string
) {
  return `${buildParticipantItemUrl(organizationId, agreementId, participantId)}/reactivate`
}

function mapParticipantDetail(participant: ParticipantDetailResponseDto): ParticipantDetail {
  return {
    ...mapParticipantBase(participant),
    identificationNumber: participant.identificationNumber,
    identificationIssueDate: participant.identificationIssueDate ?? undefined,
    identificationIssuePlace: participant.identificationIssuePlace ?? undefined,
    ethnicity: participant.ethnicity ?? undefined,
    phone: participant.phone ?? undefined,
    email: participant.email ?? undefined,
    address: participant.address ?? undefined,
    workplace: participant.workplace ?? undefined,
    note: participant.note ?? undefined,
    patientLinked: participant.patientLinked,
    source: participant.source,
    assignments: participant.assignments.map((assignment) => ({
      assignmentId: assignment.assignmentId,
      sessionId: assignment.sessionId,
      sessionDate: assignment.sessionDate,
      activity: assignment.activity,
      siteType: assignment.siteType,
      siteAddress: assignment.siteAddress ?? undefined,
      sessionStatus: assignment.sessionStatus,
      status: assignment.status,
      replacedByAssignmentId: assignment.replacedByAssignmentId ?? undefined,
      attendedAt: assignment.attendedAt ?? undefined,
      note: assignment.note ?? undefined,
      rowVersion: assignment.rowVersion,
    })),
    createdAt: participant.createdAt,
    updatedAt: participant.updatedAt,
  }
}

/** Optional text that was left blank is sent as `null`, never as an empty string. */
function toWriteBody(input: ParticipantInput): ParticipantWriteRequestDto {
  return {
    fullName: input.fullName.trim(),
    dateOfBirth: input.dateOfBirth,
    sex: input.sex,
    identificationNumber: input.identificationNumber.trim(),
    identificationIssueDate: input.identificationIssueDate?.trim() || null,
    identificationIssuePlace: input.identificationIssuePlace?.trim() || null,
    ethnicity: input.ethnicity?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    address: input.address?.trim() || null,
    workplace: input.workplace?.trim() || null,
    departmentName: input.departmentName.trim(),
    positionName: input.positionName.trim(),
    note: input.note?.trim() || null,
  }
}

function parseDetail(data: unknown, emptyMessage: string): ParticipantDetail {
  if (!data) throw new Error(emptyMessage)
  return mapParticipantDetail(parseApiData(participantDetailResponseSchema, data))
}

/** The complete Participant (full CCCD, phone, email) for the edit form. Requires the manage permission. */
export async function fetchParticipantDetail(
  organizationId: string,
  agreementId: string,
  participantId: string,
  signal?: AbortSignal
): Promise<ParticipantDetail> {
  const response = await apiClient.get<unknown>(
    buildParticipantItemUrl(organizationId, agreementId, participantId),
    { signal }
  )
  return parseDetail(response.data, "Phản hồi chi tiết người khám không có dữ liệu.")
}

/**
 * Adds one Participant by hand. There is no idempotency key: the backend rejects a second submit
 * with the same CCCD as a conflict.
 */
export async function createParticipant(
  request: CreateParticipantRequest
): Promise<ParticipantDetail> {
  const response = await apiClient.post<ParticipantWriteRequestDto, unknown>(
    participantsEndpoint(request.organizationId, request.agreementId),
    toWriteBody(request)
  )
  return parseDetail(response.data, "Phản hồi thêm người khám không có dữ liệu.")
}

export async function updateParticipant(
  request: UpdateParticipantRequest
): Promise<ParticipantDetail> {
  const response = await apiClient.put<ParticipantUpdateRequestDto, unknown>(
    buildParticipantItemUrl(request.organizationId, request.agreementId, request.participantId),
    { ...toWriteBody(request), rowVersion: request.rowVersion }
  )
  return parseDetail(
    response.data,
    "Phản hồi cập nhật người khám không có dữ liệu."
  )
}

/** Cancels, not deletes: the roster status becomes CANCELLED and the CCCD stays reserved. */
export async function cancelParticipant(request: CancelParticipantRequest): Promise<void> {
  await apiClient.delete<void>(
    buildParticipantCancelUrl(
      request.organizationId,
      request.agreementId,
      request.participantId,
      request.rowVersion
    )
  )
}

/**
 * Returns a cancelled Participant to the active roster: the same row becomes ACTIVE again, nothing
 * is added. The sessions it was released from are not restored; assign it again.
 */
export async function reactivateParticipant(
  request: ReactivateParticipantRequest
): Promise<ParticipantDetail> {
  const body: ParticipantReactivateRequestDto = { rowVersion: request.rowVersion }
  const response = await apiClient.post<ParticipantReactivateRequestDto, unknown>(
    buildParticipantReactivateUrl(request.organizationId, request.agreementId, request.participantId),
    body
  )
  return parseDetail(
    response.data,
    "Phản hồi khôi phục người khám không có dữ liệu."
  )
}

export async function fetchHealthExaminationAgreementParticipants(
  organizationId: string,
  agreementId: string,
  params?: ParticipantListFilterParams,
  signal?: AbortSignal
): Promise<ParticipantListResponse> {
  const response = await apiClient.get<unknown>(
    buildParticipantListUrl(organizationId, agreementId, params),
    { signal }
  )
  if (!response.data) {
    throw new Error("Phản hồi danh sách người khám không có dữ liệu.")
  }

  const page = parseApiData(participantPageResponseSchema, response.data)
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

/** The template is tied to the agreement's current `rowVersion`. */
export async function fetchParticipantImportTemplate(
  organizationId: string,
  agreementId: string,
  signal?: AbortSignal
): Promise<ParticipantImportTemplate> {
  const { blob } = await apiClient.getBlob(buildParticipantTemplateUrl(organizationId, agreementId), {
    signal,
  })
  return { blob, fileName: PARTICIPANT_TEMPLATE_FALLBACK_FILE_NAME }
}

/**
 * Uploads the workbook as multipart form data. The import is all-or-nothing: the backend adds
 * every row or none. A retry with the same `idempotencyKey` returns the stored result instead of
 * importing twice. With `sessionId` the new Participants are also put into that session in the
 * same commit, so the import never leaves them created but unscheduled.
 */
export async function importHealthExaminationAgreementParticipants(
  request: ImportParticipantsRequest
): Promise<ParticipantImportResult> {
  const body = new FormData()
  body.append("file", request.file, request.file.name)
  body.append("rowVersion", String(request.rowVersion))
  if (request.sessionId) body.append("sessionId", request.sessionId)

  const response = await apiClient.post<FormData, unknown>(
    buildParticipantImportUrl(request.organizationId, request.agreementId),
    body,
    { headers: { "Idempotency-Key": request.idempotencyKey } }
  )
  if (!response.data) {
    throw new Error("Phản hồi nhập danh sách người khám không có dữ liệu.")
  }

  const { sessionId, assignedCount, ...result } = parseApiData(
    participantImportResponseSchema,
    response.data
  )
  return sessionId ? { ...result, sessionId, assignedCount: assignedCount ?? 0 } : result
}
