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
  RoleListResponse,
  RolePageParams,
  RolePermissions,
  RoleSummary,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
} from "../types/role"

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

/** The backend's largest page size for the role list. */
const ROLE_PAGE_LIMIT = 100

/** One page of roles of every status, in code order. Screens search and filter on their own. */
export async function fetchRoles(
  params: RolePageParams,
  signal?: AbortSignal
): Promise<RoleListResponse> {
  const query = new URLSearchParams({
    page: String(Math.max(1, Math.trunc(params.page))),
    size: String(Math.min(ROLE_PAGE_LIMIT, Math.max(1, Math.trunc(params.pageSize)))),
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

/** Reads again when roles were added while the pages were read, at most this many times. */
const ROLE_READ_ATTEMPTS = 3

/**
 * Every role, in code order: the first page, then the remaining pages in parallel. Screens search
 * and page the list themselves on the Vietnamese names they show. Pages are read by offset, so a
 * role created meanwhile can shift rows between pages: the read is repeated while the total
 * changes, and a role seen twice is kept once.
 */
export async function fetchAllRoles(signal?: AbortSignal): Promise<RoleSummary[]> {
  for (let attempt = 1; ; attempt += 1) {
    const first = await fetchRoles({ page: 1, pageSize: ROLE_PAGE_LIMIT }, signal)
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) =>
        fetchRoles({ page: index + 2, pageSize: ROLE_PAGE_LIMIT }, signal)
      )
    )
    const stable = rest.every((page) => page.total === first.total)
    if (stable || attempt >= ROLE_READ_ATTEMPTS) {
      const byId = new Map<string, RoleSummary>()
      for (const role of [first, ...rest].flatMap((page) => page.data)) {
        if (!byId.has(role.id)) byId.set(role.id, role)
      }
      return [...byId.values()]
    }
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
