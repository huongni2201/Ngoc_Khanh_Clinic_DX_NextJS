import { apiClient, type ApiResponse } from "@/shared/api/api-client"
import type {
  BatchParticipantResponseDto,
  PageResponse,
} from "../types/transport"
import type {
  HealthExaminationParticipant,
  ParticipantListFilterParams,
  ParticipantListResponse,
} from "../types"

export type BatchParticipantPageResponse = ApiResponse<
  PageResponse<BatchParticipantResponseDto>
>

function formatGender(value: string): HealthExaminationParticipant["gender"] {
  switch (value.trim().toUpperCase()) {
    case "MALE":
    case "M":
    case "NAM":
      return "Nam"
    case "FEMALE":
    case "F":
    case "NỮ":
    case "NU":
      return "Nữ"
    default:
      return "OTHER"
  }
}

function formatAddress(participant: BatchParticipantResponseDto) {
  return [participant.addressDetail, participant.ward, participant.province]
    .filter(Boolean)
    .join(", ")
}

export function buildParticipantListUrl(
  organizationId: string,
  batchId: string,
  params: Pick<
    ParticipantListFilterParams,
    "search" | "page" | "pageSize" | "sortKey" | "sortBy"
  > = {}
) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    size: String(params.pageSize ?? 10),
    ...(params.search?.trim() ? { searchKey: params.search.trim() } : {}),
    sortKey: params.sortKey ?? "id",
    sortBy: params.sortBy ?? "ASC",
  })

  return `/api/v1/organizations/${encodeURIComponent(organizationId)}/health-examination-batches/${encodeURIComponent(batchId)}/participant?${query.toString()}`
}

export function mapParticipantPageResponse(
  response: BatchParticipantPageResponse,
  batchId: string
): ParticipantListResponse {
  if (!response.data) {
    throw new Error(response.message || "Phản hồi danh sách người khám không có dữ liệu")
  }

  return {
    data: response.data.items.map((participant) => ({
      id: participant.batchParticipantId,
      batchId,
      participantCode: participant.participantCode ?? undefined,
      participantType: participant.subjectType ?? undefined,
      fullName: participant.fullName,
      dateOfBirth: participant.dateOfBirth,
      gender: formatGender(participant.sex),
      identificationNumber: participant.identificationNumber,
      phoneNumber: participant.phone ?? undefined,
      organizationUnit: participant.departmentName ?? undefined,
      jobTitle: participant.jobTitle ?? undefined,
      address: formatAddress(participant) || undefined,
      batchParticipantStatus: participant.status,
    })),
    total: response.data.totalElements,
    page: response.data.page,
    pageSize: response.data.size,
    totalPages: response.data.totalPages,
  }
}

export async function fetchHealthExaminationBatchParticipants(
  organizationId: string,
  batchId: string,
  params?: ParticipantListFilterParams,
  signal?: AbortSignal
): Promise<ParticipantListResponse> {
  const response = await apiClient.get<PageResponse<BatchParticipantResponseDto>>(
    buildParticipantListUrl(organizationId, batchId, params),
    { signal }
  )

  return mapParticipantPageResponse(response, batchId)
}
