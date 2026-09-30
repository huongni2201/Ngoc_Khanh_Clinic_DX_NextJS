import type { UserSession } from "../types"

export function canAccessStaffWorkspace(session: UserSession | null | undefined): boolean {
  const now = Date.now()
  return session?.principalType === "STAFF" && session.roleAssignments.some((assignment) =>
    Date.parse(assignment.validFrom) <= now && (assignment.validTo === null || now < Date.parse(assignment.validTo)),
  )
}
