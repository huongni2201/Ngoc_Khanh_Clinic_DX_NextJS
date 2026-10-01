import type { UserSession } from "../types"

export function canAccessStaffWorkspace(session: UserSession | null | undefined): boolean {
  return hasEffectiveStaffRole(session)
}

export function hasEffectiveStaffRole(
  session: UserSession | null | undefined,
  roleCode?: string,
): boolean {
  const now = Date.now()
  return session?.principalType === "STAFF" && session.roleAssignments.some((assignment) =>
    (roleCode === undefined || assignment.roleCode === roleCode) &&
    Date.parse(assignment.validFrom) <= now && (assignment.validTo === null || now < Date.parse(assignment.validTo)),
  )
}
