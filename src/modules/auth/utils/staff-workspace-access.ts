import type { UserSession } from "../types"

/**
 * Mirrors the backend rule (ADR-0014): every signed-in STAFF account may use staff routes until
 * per-endpoint RBAC exists. PATIENT accounts stay signed in but cannot enter the staff workspace.
 */
export function canAccessStaffWorkspace(session: UserSession | null | undefined): boolean {
  return session?.principalType === "STAFF"
}

/** Whether a STAFF session carries a role, optionally a specific role code. Display only. */
export function hasStaffRole(
  session: UserSession | null | undefined,
  roleCode?: string,
): boolean {
  return session?.principalType === "STAFF" && session.roleAssignments.some((assignment) =>
    roleCode === undefined || assignment.roleCode === roleCode,
  )
}
