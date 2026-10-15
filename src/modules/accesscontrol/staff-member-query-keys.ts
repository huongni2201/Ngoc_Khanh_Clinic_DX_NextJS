import type { RoleFilterParams } from "./types/role"
import type { StaffMemberFilterParams } from "./types/staff-member"
import { normalizeRoleFilterParams } from "./utils/role-list-params"
import { normalizeStaffMemberFilterParams } from "./utils/staff-member-list-params"

export const staffMemberKeys = {
  all: ["staff-members"] as const,
  lists: () => [...staffMemberKeys.all, "list"] as const,
  list: (params?: StaffMemberFilterParams) =>
    [...staffMemberKeys.lists(), normalizeStaffMemberFilterParams(params)] as const,
}

export const roleKeys = {
  all: ["roles"] as const,
  assignable: () => [...roleKeys.all, "assignable"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  allRoles: () => [...roleKeys.lists(), "all"] as const,
  list: (params?: RoleFilterParams) =>
    [...roleKeys.lists(), normalizeRoleFilterParams(params)] as const,
  permissions: (roleId: string) => [...roleKeys.all, "permissions", roleId] as const,
}

export const permissionKeys = {
  all: ["permissions"] as const,
  catalog: () => [...permissionKeys.all, "catalog"] as const,
}
