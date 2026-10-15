import type { StaffMemberFilterParams } from "./types/staff-member"
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
}
