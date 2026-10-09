import type { UserSession } from "../types"

/**
 * Mirrors the backend rule (ADR-0014): every signed-in STAFF account may use staff routes until
 * per-endpoint RBAC exists. PATIENT accounts stay signed in but cannot enter the staff workspace.
 */
export function canAccessStaffWorkspace(session: UserSession | null | undefined): boolean {
  return session?.principalType === "STAFF"
}

/**
 * Whether a STAFF session carries a permission code in any role. Display only: it decides which
 * actions are shown, never what is allowed; the backend checks every request.
 */
export function hasStaffPermission(
  session: UserSession | null | undefined,
  permission: string,
): boolean {
  return session?.principalType === "STAFF" && session.roleAssignments.some((assignment) =>
    assignment.permissions.includes(permission),
  )
}
