import * as React from "react"
import { renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"
import { usePermissions } from "../hooks/use-permissions"
import { PERMISSION } from "../permissions"
import type { UserSession } from "../types"
import { SESSION_QUERY_KEY } from "../utils/session-cache"
import { patientSession, staffSession } from "./fixtures"

function permissionsFor(session?: UserSession) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (session) client.setQueryData(SESSION_QUERY_KEY, session)
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return renderHook(() => usePermissions(), { wrapper }).result.current
}

const withPermissions = (...permissions: string[]): UserSession => ({
  ...staffSession,
  roleAssignments: [{ roleId: "r-1", roleCode: "CLINIC_MANAGER", permissions }],
})

describe("usePermissions", () => {
  it("knows nothing before the session is loaded, and grants nothing", () => {
    const permissions = permissionsFor()

    expect(permissions.isKnown).toBe(false)
    expect(permissions.can(PERMISSION.ORGANIZATION_VIEW)).toBe(false)
    expect(permissions.canAny(PERMISSION.ORGANIZATION_VIEW)).toBe(false)
  })

  it("answers from the permission codes of a STAFF session", () => {
    const permissions = permissionsFor(
      withPermissions(PERMISSION.PARTICIPANT_VIEW, PERMISSION.PARTICIPANT_UPDATE)
    )

    expect(permissions.isKnown).toBe(true)
    expect(permissions.can(PERMISSION.PARTICIPANT_VIEW)).toBe(true)
    expect(permissions.can(PERMISSION.PARTICIPANT_REMOVE)).toBe(false)
  })

  it("canAll needs every permission, canAny needs one", () => {
    const permissions = permissionsFor(withPermissions(PERMISSION.PARTICIPANT_VIEW))

    expect(permissions.canAll(PERMISSION.PARTICIPANT_VIEW, PERMISSION.PARTICIPANT_UPDATE)).toBe(false)
    expect(permissions.canAny(PERMISSION.PARTICIPANT_VIEW, PERMISSION.PARTICIPANT_UPDATE)).toBe(true)
    expect(permissions.canAll(PERMISSION.PARTICIPANT_VIEW)).toBe(true)
    expect(permissions.canAll()).toBe(true)
    expect(permissions.canAny()).toBe(false)
  })

  it("grants nothing to a PATIENT session, which is known", () => {
    const permissions = permissionsFor(patientSession)

    expect(permissions.isKnown).toBe(true)
    expect(permissions.can(PERMISSION.ORGANIZATION_VIEW)).toBe(false)
  })
})
