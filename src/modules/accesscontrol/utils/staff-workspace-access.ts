import type { PermissionCode } from "../permissions"
import type { UserSession } from "../types"

/**
 * Mirrors the backend rule (ADR-0014): every signed-in STAFF account may use staff routes until
 * per-endpoint RBAC exists. PATIENT accounts stay signed in but cannot enter the staff workspace.
 */
export function canAccessStaffWorkspace(session: UserSession | null | undefined): boolean {
  return session?.principalType === "STAFF"
}

const NO_PERMISSIONS: ReadonlySet<string> = new Set()

/**
 * Every permission code a STAFF session carries, across all of its roles. Empty without a session
 * and for a PATIENT session. Display only: it decides which actions are shown, never what is
 * allowed; the backend checks every request.
 */
export function getStaffPermissions(
  session: UserSession | null | undefined,
): ReadonlySet<string> {
  if (session?.principalType !== "STAFF") return NO_PERMISSIONS
  return new Set(session.roleAssignments.flatMap((assignment) => assignment.permissions))
}

/** Whether a STAFF session carries the permission in any role. Display only, like the set above. */
export function hasStaffPermission(
  session: UserSession | null | undefined,
  permission: PermissionCode,
): boolean {
  return getStaffPermissions(session).has(permission)
}

/**
 * Whether the session belongs to a STAFF user with the ADMINISTRATOR role.
 */
export function isAdministrator(session: UserSession | null | undefined): boolean {
  return session?.principalType === "STAFF" && session.roleAssignments.some((assignment) =>
    assignment.roleCode === "ADMINISTRATOR",
  )
}

/** Clinic Manager owns catalog operations UC-110 through UC-115. */
export function isClinicManager(session: UserSession | null | undefined): boolean {
  return session?.principalType === "STAFF" && session.roleAssignments.some((assignment) =>
    assignment.roleCode === "CLINIC_MANAGER",
  )
}
