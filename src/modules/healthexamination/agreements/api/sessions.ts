import { apiClient } from "@/shared/api/api-client"
import type {
  AssignParticipantsRequest,
  AssignParticipantsResult,
  CancelExaminationSessionRequest,
  CancelSessionAssignmentRequest,
  CreateExaminationSessionRequest,
  ExaminationSession,
  ExaminationSessionFilterParams,
  ExaminationSessionListResponse,
  MoveSessionAssignmentRequest,
  MoveSessionAssignmentsRequest,
  MoveSessionAssignmentsResult,
  RecordSessionAttendanceRequest,
  SessionAssignment,
  SessionAssignmentFilterParams,
  SessionAssignmentListResponse,
  UpdateExaminationSessionRequest,
} from "../types"
import {
  assignParticipantsResponseSchema,
  assignmentPageResponseSchema,
  assignmentResponseSchema,
  moveSessionAssignmentsResponseSchema,
  sessionPageResponseSchema,
  sessionResponseSchema,
  type AssignmentResponseDto,
  type SessionCreateRequestDto,
  type SessionResponseDto,
  type SessionUpdateRequestDto,
} from "../types/transport"

export const SESSION_ASSIGN_MAX_PARTICIPANTS = 1000

function sessionsEndpoint(organizationId: string) {
  return `/api/v1/organizations/${encodeURIComponent(organizationId)}/sessions`
}

function sessionEndpoint(organizationId: string, sessionId: string) {
  return `${sessionsEndpoint(organizationId)}/${encodeURIComponent(sessionId)}`
}

function assignmentsEndpoint(organizationId: string, sessionId: string) {
  return `${sessionEndpoint(organizationId, sessionId)}/assignments`
}

export function buildSessionListUrl(
  organizationId: string,
  params: ExaminationSessionFilterParams = {}
) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    size: String(params.pageSize ?? 10),
    sortKey: params.sortKey ?? "sessionDate",
    sortBy: params.sortBy ?? "ASC",
  })
  const search = params.search?.trim()
  if (search) query.set("searchKey", search)
  if (params.agreementId) query.set("agreementId", params.agreementId)
  if (params.from) query.set("from", params.from)
  if (params.to) query.set("to", params.to)
  if (params.activity) query.set("activity", params.activity)
  if (params.status) query.set("status", params.status)
  return `${sessionsEndpoint(organizationId)}?${query.toString()}`
}

export function buildAssignmentListUrl(
  organizationId: string,
  sessionId: string,
  params: SessionAssignmentFilterParams = {}
) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    size: String(params.pageSize ?? 20),
    sortKey: params.sortKey ?? "fullName",
    sortBy: params.sortBy ?? "ASC",
  })
  const search = params.search?.trim()
  if (search) query.set("searchKey", search)
  if (params.status) query.set("status", params.status)
  return `${assignmentsEndpoint(organizationId, sessionId)}?${query.toString()}`
}

export function buildAssignmentActionUrl(
  organizationId: string,
  sessionId: string,
  assignmentId: string,
  action: "move" | "cancel" | "attendance"
) {
  return `${assignmentsEndpoint(organizationId, sessionId)}/${encodeURIComponent(assignmentId)}/${action}`
}

function mapSession(session: SessionResponseDto): ExaminationSession {
  return {
    id: session.id,
    organizationId: session.organizationId,
    agreementId: session.agreementId ?? undefined,
    sessionDate: session.sessionDate,
    activity: session.activity,
    siteType: session.siteType,
    siteAddress: session.siteAddress || undefined,
    status: session.status,
    assignedCount: session.assignedCount,
    attendedCount: session.attendedCount,
    noShowCount: session.noShowCount,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    rowVersion: session.rowVersion,
  }
}

function mapAssignment(assignment: AssignmentResponseDto): SessionAssignment {
  return {
    id: assignment.id,
    participantId: assignment.participantId,
    sessionId: assignment.sessionId,
    status: assignment.status,
    replacedByAssignmentId: assignment.replacedByAssignmentId ?? undefined,
    attendedAt: assignment.attendedAt ?? undefined,
    note: assignment.note ?? undefined,
    rowVersion: assignment.rowVersion,
  }
}

function requireData(data: unknown, message: string) {
  if (!data) throw new Error(message)
  return data
}

export async function fetchExaminationSessions(
  organizationId: string,
  params?: ExaminationSessionFilterParams,
  signal?: AbortSignal
): Promise<ExaminationSessionListResponse> {
  const response = await apiClient.get<unknown>(buildSessionListUrl(organizationId, params), {
    signal,
  })
  const page = sessionPageResponseSchema.parse(
    requireData(response.data, response.message || "Phản hồi danh sách lịch khám không có dữ liệu.")
  )
  return {
    data: page.items.map(mapSession),
    total: page.totalElements,
    page: page.page,
    pageSize: page.size,
    totalPages: page.totalPages,
  }
}

export async function fetchExaminationSession(
  organizationId: string,
  sessionId: string,
  signal?: AbortSignal
): Promise<ExaminationSession> {
  const response = await apiClient.get<unknown>(sessionEndpoint(organizationId, sessionId), {
    signal,
  })
  return mapSession(
    sessionResponseSchema.parse(
      requireData(response.data, response.message || "Phản hồi chi tiết lịch khám không có dữ liệu.")
    )
  )
}

/** A repeated open slot (same date, site and activity) is a 409. */
export async function createExaminationSession(
  request: CreateExaminationSessionRequest
): Promise<ExaminationSession> {
  const body: SessionCreateRequestDto = {
    sessionDate: request.sessionDate,
    activity: request.activity,
    siteType: request.siteType,
    siteAddress: request.siteType === "CLINIC" ? "" : request.siteAddress.trim(),
    ...(request.agreementId ? { agreementId: request.agreementId } : {}),
  }
  const response = await apiClient.post<SessionCreateRequestDto, unknown>(
    sessionsEndpoint(request.organizationId),
    body
  )
  return mapSession(
    sessionResponseSchema.parse(
      requireData(response.data, response.message || "Phản hồi tạo lịch khám không có dữ liệu.")
    )
  )
}

export async function updateExaminationSession(
  request: UpdateExaminationSessionRequest
): Promise<ExaminationSession> {
  const body: SessionUpdateRequestDto = {
    sessionDate: request.sessionDate,
    activity: request.activity,
    siteType: request.siteType,
    siteAddress: request.siteType === "CLINIC" ? "" : request.siteAddress.trim(),
    rowVersion: request.rowVersion,
  }
  const response = await apiClient.put<SessionUpdateRequestDto, unknown>(
    sessionEndpoint(request.organizationId, request.sessionId),
    body
  )
  return mapSession(
    sessionResponseSchema.parse(
      requireData(response.data, response.message || "Phản hồi cập nhật lịch khám không có dữ liệu.")
    )
  )
}

/** Refused with 409 while Participants are still assigned: move or cancel them first. */
export async function cancelExaminationSession(
  request: CancelExaminationSessionRequest
): Promise<ExaminationSession> {
  const response = await apiClient.post<{ rowVersion: number }, unknown>(
    `${sessionEndpoint(request.organizationId, request.sessionId)}/cancel`,
    { rowVersion: request.rowVersion }
  )
  return mapSession(
    sessionResponseSchema.parse(
      requireData(response.data, response.message || "Phản hồi hủy lịch khám không có dữ liệu.")
    )
  )
}

export async function fetchSessionAssignments(
  organizationId: string,
  sessionId: string,
  params?: SessionAssignmentFilterParams,
  signal?: AbortSignal
): Promise<SessionAssignmentListResponse> {
  const response = await apiClient.get<unknown>(
    buildAssignmentListUrl(organizationId, sessionId, params),
    { signal }
  )
  const page = assignmentPageResponseSchema.parse(
    requireData(response.data, response.message || "Phản hồi danh sách phân lịch không có dữ liệu.")
  )
  return {
    data: page.items.map((row) => ({
      assignmentId: row.assignmentId,
      status: row.status,
      attendedAt: row.attendedAt ?? undefined,
      note: row.note ?? undefined,
      assignmentRowVersion: row.assignmentRowVersion,
      participantId: row.participantId,
      agreementId: row.agreementId,
      participantCode: row.participantCode ?? undefined,
      fullName: row.fullName,
      dateOfBirth: row.dateOfBirth,
      sex: row.sex,
      identificationNumberMasked: row.identificationNumberMasked,
      departmentName: row.departmentName,
      positionName: row.positionName,
      rosterStatus: row.rosterStatus,
    })),
    total: page.totalElements,
    page: page.page,
    pageSize: page.size,
    totalPages: page.totalPages,
  }
}

/**
 * Puts 1 to 1000 Participants in a session. Participants already in it are skipped, not an error;
 * a cancelled Participant or an ended agreement is a 409 and nothing is written.
 */
export async function assignParticipantsToSession(
  request: AssignParticipantsRequest
): Promise<AssignParticipantsResult> {
  const response = await apiClient.post<{ participantIds: string[] }, unknown>(
    assignmentsEndpoint(request.organizationId, request.sessionId),
    { participantIds: request.participantIds }
  )
  const result = assignParticipantsResponseSchema.parse(
    requireData(response.data, response.message || "Phản hồi phân lịch không có dữ liệu.")
  )
  return {
    sessionId: result.sessionId,
    assignedCount: result.assigned.length,
    skippedParticipantIds: result.skippedParticipantIds,
  }
}

/** The answer is the new assignment in the target session; the old one stays as history. */
export async function moveSessionAssignment(
  request: MoveSessionAssignmentRequest
): Promise<SessionAssignment> {
  const response = await apiClient.post<{ targetSessionId: string; rowVersion: number }, unknown>(
    buildAssignmentActionUrl(request.organizationId, request.sessionId, request.assignmentId, "move"),
    { targetSessionId: request.targetSessionId, rowVersion: request.rowVersion }
  )
  return mapAssignment(
    assignmentResponseSchema.parse(
      requireData(response.data, response.message || "Phản hồi đổi lịch không có dữ liệu.")
    )
  )
}

/** Moves every Participant still expected at the session; the ones already in the target stay. */
export async function moveSessionAssignments(
  request: MoveSessionAssignmentsRequest
): Promise<MoveSessionAssignmentsResult> {
  const response = await apiClient.post<{ targetSessionId: string }, unknown>(
    `${assignmentsEndpoint(request.organizationId, request.sessionId)}/move`,
    { targetSessionId: request.targetSessionId }
  )
  return moveSessionAssignmentsResponseSchema.parse(
    requireData(response.data, response.message || "Phản hồi dời lịch không có dữ liệu.")
  )
}

export async function cancelSessionAssignment(
  request: CancelSessionAssignmentRequest
): Promise<SessionAssignment> {
  const response = await apiClient.post<{ rowVersion: number; note?: string }, unknown>(
    buildAssignmentActionUrl(request.organizationId, request.sessionId, request.assignmentId, "cancel"),
    { rowVersion: request.rowVersion, ...(request.note?.trim() ? { note: request.note.trim() } : {}) }
  )
  return mapAssignment(
    assignmentResponseSchema.parse(
      requireData(response.data, response.message || "Phản hồi hủy phân lịch không có dữ liệu.")
    )
  )
}

/**
 * Records that the Participant came, did not come, or (`ASSIGNED`) that a record was a mistake.
 * Coming needs the session date to be today or earlier; the backend decides.
 */
export async function recordSessionAttendance(
  request: RecordSessionAttendanceRequest
): Promise<SessionAssignment> {
  const response = await apiClient.post<
    { status: string; rowVersion: number; note?: string },
    unknown
  >(
    buildAssignmentActionUrl(
      request.organizationId,
      request.sessionId,
      request.assignmentId,
      "attendance"
    ),
    {
      status: request.status,
      rowVersion: request.rowVersion,
      ...(request.note?.trim() ? { note: request.note.trim() } : {}),
    }
  )
  return mapAssignment(
    assignmentResponseSchema.parse(
      requireData(response.data, response.message || "Phản hồi ghi nhận đến khám không có dữ liệu.")
    )
  )
}
