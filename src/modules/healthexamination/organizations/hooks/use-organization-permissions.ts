"use client"

import * as React from "react"
import { PERMISSION, usePermissions } from "@/modules/accesscontrol"

/**
 * What the account may do on the Organization screens, one flag per action. Display only: the
 * backend checks every request. Deactivating an Organization is the backend `DELETE` (the row stays,
 * its status becomes INACTIVE), so it follows `ORGANIZATION_DELETE`.
 */
export function useOrganizationPermissions() {
  const { can } = usePermissions()

  return React.useMemo(
    () => ({
      canCreate: can(PERMISSION.ORGANIZATION_CREATE),
      canEdit: can(PERMISSION.ORGANIZATION_UPDATE),
      canDeactivate: can(PERMISSION.ORGANIZATION_DELETE),
    }),
    [can]
  )
}
