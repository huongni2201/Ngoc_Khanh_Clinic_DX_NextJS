"use client"

import * as React from "react"
import type { PermissionCode } from "../permissions"
import { getStaffPermissions } from "../utils/staff-workspace-access"
import { useCachedUserSession } from "./use-cached-user-session"

export interface Permissions {
  /**
   * Whether the session is loaded. Before that nothing is known: a screen can still try a read and
   * let the backend answer, instead of showing "no access" for a moment.
   */
  isKnown: boolean
  /** The signed-in STAFF account holds the permission in some role. */
  can: (permission: PermissionCode) => boolean
  /** It holds every one of the permissions (an action that calls several endpoints). */
  canAll: (...permissions: PermissionCode[]) => boolean
  /** It holds at least one of the permissions. */
  canAny: (...permissions: PermissionCode[]) => boolean
}

/**
 * The one way a screen asks "may this account see or use this feature". It reads the session that
 * `AuthBoundary` already loaded and checks permission codes; it knows nothing about roles. Display
 * only: the backend decides every request, so a hidden action is a convenience and a shown action
 * is not a promise.
 */
export function usePermissions(): Permissions {
  const session = useCachedUserSession()

  return React.useMemo(() => {
    const granted = getStaffPermissions(session)
    return {
      isKnown: Boolean(session),
      can: (permission) => granted.has(permission),
      canAll: (...permissions) => permissions.every((permission) => granted.has(permission)),
      canAny: (...permissions) => permissions.some((permission) => granted.has(permission)),
    }
  }, [session])
}
