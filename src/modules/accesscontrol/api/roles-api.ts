import { apiClient } from "@/shared/api/api-client"
import {
  permissionCatalogResponseSchema,
  rolePageResponseSchema,
  rolePermissionsResponseSchema,
  roleSummaryResponseSchema,
  type CreateRoleRequestDto,
  type RolePermissionsResponseDto,
  type RoleSummaryResponseDto,
  type UpdateRolePermissionsRequestDto,
  type UpdateRoleRequestDto,
} from "../types/role-transport"
import type {
  CreateRoleInput,
  PermissionCatalogItem,
  RoleFilterParams,
  RoleListResponse,
  RolePermissions,
  RoleSummary,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
} from "../types/role"
import { normalizeRoleFilterParams } from "../utils/role-list-params"

// Contract: Ngoc_Khanh_Clinic_DX_Springboot/docs/api/roles-and-permissions.md
const ROLES_ENDPOINT = "/api/v1/admin/roles"
const PERMISSIONS_ENDPOINT = "/api/v1/admin/permissions"

function mapRole(dto: RoleSummaryResponseDto): RoleSummary {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: dto.description ?? undefined,
    active: dto.active,
    permissionCount: dto.permissionCount,
    userCount: dto.userCount,
    rowVersion: dto.rowVersion,
  }
}

function mapRolePermissions(dto: RolePermissionsResponseDto): RolePermissions {
  return {
    roleId: dto.roleId,
    roleCode: dto.roleCode,
    active: dto.active,
    rowVersion: dto.rowVersion,
    permissionCodes: dto.permissionCodes,
  }
}

/** Optional text is sent only when filled, so the backend stores null instead of an empty string. */
function optionalText(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function requireData<T>(data: T | undefined, message: string | undefined, fallback: string): T {
  if (data === undefined || data === null) throw new Error(message || fallback)
  return data
}

export async function fetchRoles(
  params?: RoleFilterParams,
  signal?: AbortSignal
): Promise<RoleListResponse> {
  const normalized = normalizeRoleFilterParams(params)
  const query = new URLSearchParams({
    page: String(normalized.page),
    size: String(normalized.pageSize),
    ...(normalized.search ? { searchKey: normalized.search } : {}),
    ...(normalized.status ? { status: normalized.status } : {}),
    sortKey: normalized.sortKey,
    sortBy: normalized.sortBy,
  })
  const response = await apiClient.get<unknown>(`${ROLES_ENDPOINT}?${query.toString()}`, { signal })
  const page = rolePageResponseSchema.parse(
    requireData(response.data, response.message, "Phản hồi danh sách vai trò không có dữ liệu.")
  )
  return {
    data: page.items.map(mapRole),
    total: page.totalElements,
    page: page.page,
    pageSize: page.size,
    totalPages: page.totalPages,
  }
}

export async function createRole(input: CreateRoleInput): Promise<RoleSummary> {
  const response = await apiClient.post<CreateRoleRequestDto, unknown>(ROLES_ENDPOINT, {
    code: input.code.trim(),
    name: input.name.trim(),
    description: optionalText(input.description),
    copyFromRoleId: input.copyFromRoleId || undefined,
    active: input.active,
  })
  return mapRole(
    roleSummaryResponseSchema.parse(
      requireData(response.data, response.message, "Phản hồi tạo vai trò không có dữ liệu.")
    )
  )
}

export async function updateRole(roleId: string, input: UpdateRoleInput): Promise<RoleSummary> {
  const response = await apiClient.put<UpdateRoleRequestDto, unknown>(
    `${ROLES_ENDPOINT}/${encodeURIComponent(roleId)}`,
    {
      name: input.name.trim(),
      description: optionalText(input.description),
      active: input.active,
      rowVersion: input.rowVersion,
    }
  )
  return mapRole(
    roleSummaryResponseSchema.parse(
      requireData(response.data, response.message, "Phản hồi cập nhật vai trò không có dữ liệu.")
    )
  )
}

export async function fetchPermissionCatalog(signal?: AbortSignal): Promise<PermissionCatalogItem[]> {
  const response = await apiClient.get<unknown>(PERMISSIONS_ENDPOINT, { signal })
  return permissionCatalogResponseSchema.parse(
    requireData(response.data, response.message, "Phản hồi danh mục quyền không có dữ liệu.")
  )
}

export async function fetchRolePermissions(
  roleId: string,
  signal?: AbortSignal
): Promise<RolePermissions> {
  const response = await apiClient.get<unknown>(
    `${ROLES_ENDPOINT}/${encodeURIComponent(roleId)}/permissions`,
    { signal }
  )
  return mapRolePermissions(
    rolePermissionsResponseSchema.parse(
      requireData(response.data, response.message, "Phản hồi quyền của vai trò không có dữ liệu.")
    )
  )
}

export async function updateRolePermissions(
  roleId: string,
  input: UpdateRolePermissionsInput
): Promise<RolePermissions> {
  const response = await apiClient.put<UpdateRolePermissionsRequestDto, unknown>(
    `${ROLES_ENDPOINT}/${encodeURIComponent(roleId)}/permissions`,
    { rowVersion: input.rowVersion, grant: input.grant, revoke: input.revoke }
  )
  return mapRolePermissions(
    rolePermissionsResponseSchema.parse(
      requireData(response.data, response.message, "Phản hồi lưu quyền không có dữ liệu.")
    )
  )
}
