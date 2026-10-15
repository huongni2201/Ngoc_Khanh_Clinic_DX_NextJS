import type { ROLE_STATUS_FILTER_VALUES } from "./role-transport"

export type RoleStatusFilter = (typeof ROLE_STATUS_FILTER_VALUES)[number]

/** Role with its usage counts (SRS 1.3.1 Role List). */
export interface RoleSummary {
  id: string
  code: string
  name: string
  description?: string
  active: boolean
  permissionCount: number
  userCount: number
  rowVersion: number
}

export const ROLE_SORT_KEYS = ["id", "code", "name"] as const
export type RoleSortKey = (typeof ROLE_SORT_KEYS)[number]

export interface RoleFilterParams {
  search?: string
  status?: RoleStatusFilter
  page?: number
  pageSize?: number
  sortKey?: RoleSortKey
  sortBy?: "ASC" | "DESC"
}

export interface RoleListResponse {
  data: RoleSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** Predefined permission that may be granted to a role (SRS 1.3.4). */
export interface PermissionCatalogItem {
  code: string
  name: string
  module: string
  useCases: string[]
  sensitive: boolean
}

export interface RolePermissions {
  roleId: string
  roleCode: string
  active: boolean
  rowVersion: number
  permissionCodes: string[]
}

export interface CreateRoleInput {
  code: string
  name: string
  description?: string
  copyFromRoleId?: string
  active: boolean
}

export interface UpdateRoleInput {
  name: string
  description?: string
  active: boolean
  rowVersion: number
}

export interface UpdateRolePermissionsInput {
  rowVersion: number
  grant: string[]
  revoke: string[]
}
