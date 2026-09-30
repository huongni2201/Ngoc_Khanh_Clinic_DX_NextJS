import { apiClient } from "@/shared/api/api-client"
import {
  organizationResponseSchema,
  type OrganizationRequestDto,
  type OrganizationPageResponseDto,
  type OrganizationResponseDto,
} from "../types/transport"
import type {
  CreateOrganizationDto,
  Organization,
  OrganizationDetail,
  OrganizationFilterParams,
  OrganizationListResponse,
  UpdateOrganizationDto,
} from "../types"

const ORGANIZATIONS_ENDPOINT = "/api/v1/organizations"

function mapOrganization(dto: OrganizationResponseDto): OrganizationDetail {
  return {
    id: dto.id,
    name: dto.name,
    taxCode: dto.taxCode ?? undefined,
    address: dto.address ?? undefined,
    contactName: dto.contactName,
    contactPhone: dto.contactPhone,
    contactJobTitle: dto.contactJobTitle ?? undefined,
    note: dto.note ?? undefined,
    status: dto.status,
  }
}

function requireOrganization(data: unknown): OrganizationDetail {
  return mapOrganization(organizationResponseSchema.parse(data))
}

function toRequest(dto: CreateOrganizationDto | UpdateOrganizationDto): OrganizationRequestDto {
  return {
    name: dto.name,
    taxCode: dto.taxCode,
    address: dto.address,
    contactName: dto.contactName,
    contactPhone: dto.contactPhone,
    contactJobTitle: dto.contactJobTitle,
    note: dto.note,
  }
}

export async function fetchOrganizations(
  params?: OrganizationFilterParams
): Promise<OrganizationListResponse> {
  const query = new URLSearchParams({
    page: String(params?.page ?? 1),
    size: String(params?.pageSize ?? 10),
    ...(params?.search?.trim() ? { searchKey: params.search.trim() } : {}),
    ...(params?.status ? { status: params.status } : {}),
    sortKey: params?.sortKey ?? "id",
    sortBy: params?.sortBy ?? "ASC",
  })
  const response = await apiClient.get<OrganizationPageResponseDto>(
    `${ORGANIZATIONS_ENDPOINT}?${query.toString()}`
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi danh sách đơn vị không có dữ liệu.")
  }

  return {
    data: response.data.items.map(requireOrganization),
    total: response.data.totalElements,
    page: response.data.page,
    pageSize: response.data.size,
    totalPages: response.data.totalPages,
  }
}

export async function fetchOrganizationById(id: string): Promise<OrganizationDetail> {
  const response = await apiClient.get<OrganizationResponseDto>(
    `${ORGANIZATIONS_ENDPOINT}/${encodeURIComponent(id)}`
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi chi tiết đơn vị không có dữ liệu.")
  }
  return requireOrganization(response.data)
}

export async function createOrganization(dto: CreateOrganizationDto): Promise<Organization> {
  const response = await apiClient.post<OrganizationRequestDto, OrganizationResponseDto>(
    ORGANIZATIONS_ENDPOINT,
    toRequest(dto)
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi tạo đơn vị không có dữ liệu.")
  }
  return requireOrganization(response.data)
}

export async function updateOrganization(
  id: string,
  dto: UpdateOrganizationDto
): Promise<OrganizationDetail> {
  const response = await apiClient.put<OrganizationRequestDto, OrganizationResponseDto>(
    `${ORGANIZATIONS_ENDPOINT}/${encodeURIComponent(id)}`,
    toRequest(dto)
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi cập nhật đơn vị không hợp lệ.")
  }
  return requireOrganization(response.data)
}

export async function deactivateOrganization(id: string): Promise<void> {
  await apiClient.delete<void>(
    `${ORGANIZATIONS_ENDPOINT}/${encodeURIComponent(id)}`
  )
}
