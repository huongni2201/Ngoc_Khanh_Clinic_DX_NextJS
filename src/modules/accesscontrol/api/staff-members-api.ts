import { apiClient } from "@/shared/api/api-client"
import {
  roleListResponseSchema,
  staffMemberPageResponseSchema,
  staffMemberResponseSchema,
  type CreateStaffMemberRequestDto,
  type RoleResponseDto,
  type StaffMemberResponseDto,
} from "../types/staff-member-transport"
import type {
  CreateStaffMemberInput,
  RoleOption,
  StaffMember,
  StaffMemberFilterParams,
  StaffMemberListResponse,
} from "../types/staff-member"
import { normalizeStaffMemberFilterParams } from "../utils/staff-member-list-params"

// Contract: Ngoc_Khanh_Clinic_DX_Springboot/docs/api/staff-members.md
const STAFF_MEMBERS_ENDPOINT = "/api/v1/staff-members"
const ROLES_ENDPOINT = "/api/v1/roles"

function mapStaffMember(dto: StaffMemberResponseDto): StaffMember {
  return {
    id: dto.id,
    staffCode: dto.staffCode,
    fullName: dto.fullName,
    dateOfBirth: dto.dateOfBirth ?? undefined,
    sex: dto.sex ?? undefined,
    phone: dto.phone ?? undefined,
    email: dto.email ?? undefined,
    status: dto.status,
    rowVersion: dto.rowVersion,
    account: dto.account
      ? {
          id: dto.account.id,
          username: dto.account.username,
          status: dto.account.status,
          roleCodes: [...dto.account.roleCodes],
        }
      : null,
  }
}

function mapRole(dto: RoleResponseDto): RoleOption {
  return { id: dto.id, code: dto.code, name: dto.name, description: dto.description }
}

/** Optional text is sent only when filled, so the backend stores null instead of an empty string. */
function optionalText(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function toRequest(input: CreateStaffMemberInput): CreateStaffMemberRequestDto {
  return {
    fullName: input.fullName.trim(),
    dateOfBirth: optionalText(input.dateOfBirth),
    sex: input.sex,
    phone: optionalText(input.phone),
    email: optionalText(input.email),
    // Passwords are never trimmed (ADR-0014).
    initialPassword: input.initialPassword,
    roleCodes: [...new Set(input.roleCodes)],
  }
}

export async function fetchStaffMembers(
  params?: StaffMemberFilterParams,
  signal?: AbortSignal
): Promise<StaffMemberListResponse> {
  const normalized = normalizeStaffMemberFilterParams(params)
  const query = new URLSearchParams({
    page: String(normalized.page),
    size: String(normalized.pageSize),
    ...(normalized.search ? { searchKey: normalized.search } : {}),
    sortKey: normalized.sortKey,
    sortBy: normalized.sortBy,
  })
  const response = await apiClient.get<unknown>(`${STAFF_MEMBERS_ENDPOINT}?${query.toString()}`, {
    signal,
  })
  if (!response.data) {
    throw new Error(response.message || "Phản hồi danh sách nhân viên không có dữ liệu.")
  }
  const page = staffMemberPageResponseSchema.parse(response.data)
  return {
    data: page.items.map(mapStaffMember),
    total: page.totalElements,
    page: page.page,
    pageSize: page.size,
    totalPages: page.totalPages,
  }
}

export async function createStaffMember(input: CreateStaffMemberInput): Promise<StaffMember> {
  const response = await apiClient.post<CreateStaffMemberRequestDto, unknown>(
    STAFF_MEMBERS_ENDPOINT,
    toRequest(input)
  )
  if (!response.data) {
    throw new Error(response.message || "Phản hồi tạo nhân viên không có dữ liệu.")
  }
  return mapStaffMember(staffMemberResponseSchema.parse(response.data))
}

export async function fetchAssignableRoles(signal?: AbortSignal): Promise<RoleOption[]> {
  const response = await apiClient.get<unknown>(ROLES_ENDPOINT, { signal })
  if (!response.data) {
    throw new Error(response.message || "Phản hồi danh sách vai trò không có dữ liệu.")
  }
  return roleListResponseSchema.parse(response.data).map(mapRole)
}
