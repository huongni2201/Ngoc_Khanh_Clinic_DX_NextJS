import { apiClient } from "@/shared/api/api-client"
import {
  organizationResponseSchema,
  type OrganizationRequestDto,
  type UpdateOrganizationRequestDto,
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

import { normalizeOrganizationFilterParams } from "../utils/organization-list-params"

const ORGANIZATIONS_ENDPOINT = "/api/v1/organizations"

function mapOrganization(dto: OrganizationResponseDto): OrganizationDetail {
  return {
    id: dto.id,
    name: dto.name,
    taxCode: dto.taxCode ?? undefined,
    phone: dto.phone ?? undefined,
    email: dto.email,
    address: dto.address,
    contactName: dto.contactFullName,
    contactPhone: dto.contactPhone,
    contactEmail: dto.contactEmail,
    status: dto.status,
    rowVersion: dto.rowVersion,
  }
}

function requireOrganization(data: unknown): OrganizationDetail {
  return mapOrganization(organizationResponseSchema.parse(data))
}

function toRequest(dto: CreateOrganizationDto | UpdateOrganizationDto): OrganizationRequestDto {
  return {
    name: dto.name,
    taxCode: dto.taxCode,
    phone: dto.phone,
    email: dto.email,
    address: dto.address,
    contactFullName: dto.contactName,
    contactPhone: dto.contactPhone,
    contactEmail: dto.contactEmail,
  }
}

export async function fetchOrganizations(
  params?: OrganizationFilterParams,
  signal?: AbortSignal
): Promise<OrganizationListResponse> {
  const normalized = normalizeOrganizationFilterParams(params)
  const query = new URLSearchParams({
    page: String(normalized.page),
    size: String(normalized.pageSize),
    ...(normalized.search ? { searchKey: normalized.search } : {}),
    sortKey: normalized.sortKey,
    sortBy: normalized.sortBy,
  })
  const response = await apiClient.get<OrganizationPageResponseDto>(
    `${ORGANIZATIONS_ENDPOINT}?${query.toString()}`,
    { signal }
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

export async function fetchOrganizationById(
  id: string,
  signal?: AbortSignal
): Promise<OrganizationDetail> {
  const response = await apiClient.get<OrganizationResponseDto>(
    `${ORGANIZATIONS_ENDPOINT}/${encodeURIComponent(id)}`,
    { signal }
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
  const request: UpdateOrganizationRequestDto = { ...toRequest(dto), rowVersion: dto.rowVersion }
  const response = await apiClient.put<UpdateOrganizationRequestDto, OrganizationResponseDto>(
    `${ORGANIZATIONS_ENDPOINT}/${encodeURIComponent(id)}`,
    request
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi cập nhật đơn vị không hợp lệ.")
  }
  return requireOrganization(response.data)
}

export async function deactivateOrganization(id: string, rowVersion: number): Promise<void> {
  await apiClient.delete<void>(
    `${ORGANIZATIONS_ENDPOINT}/${encodeURIComponent(id)}?rowVersion=${rowVersion}`
  )
}
