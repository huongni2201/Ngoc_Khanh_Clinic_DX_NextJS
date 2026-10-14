import type { UserSession } from "../types"
import { hasStaffPermission } from "./staff-workspace-access"

/** Backend permission codes of the staff member routes (V002, V010). Used only to decide what is shown. */
export const STAFF_MEMBER_VIEW_PERMISSION = "STAFF_MEMBER_VIEW"
export const ROLE_VIEW_PERMISSION = "ROLE_VIEW"
export const USER_ACCOUNT_CREATE_PERMISSION = "USER_ACCOUNT_CREATE"
/** Creating a staff member grants roles, so the backend also requires this permission. */
export const USER_ROLE_ASSIGN_PERMISSION = "USER_ROLE_ASSIGN"

export function canViewStaffMembers(session: UserSession | null | undefined) {
  return hasStaffPermission(session, STAFF_MEMBER_VIEW_PERMISSION)
}

/** The create form needs the role list as well as both write permissions. */
export function canCreateStaffMembers(session: UserSession | null | undefined) {
  return (
    hasStaffPermission(session, USER_ACCOUNT_CREATE_PERMISSION) &&
    hasStaffPermission(session, USER_ROLE_ASSIGN_PERMISSION) &&
    hasStaffPermission(session, ROLE_VIEW_PERMISSION)
  )
}
