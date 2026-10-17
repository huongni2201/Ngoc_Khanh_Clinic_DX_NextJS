import * as React from "react"
import { renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"
import { PERMISSION, type PermissionCode } from "@/modules/accesscontrol"
import { SESSION_QUERY_KEY } from "@/modules/accesscontrol/utils/session-cache"
import { useAgreementPermissions } from "../hooks/use-agreement-permissions"

function permissionsFor(granted?: PermissionCode[]) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (granted) {
    client.setQueryData(SESSION_QUERY_KEY, {
      userId: "u-1",
      staffId: "s-1",
      patientId: null,
      username: "staff",
      principalType: "STAFF",
      roleAssignments: [{ roleId: "r-1", roleCode: "CLINIC_MANAGER", permissions: granted }],
      idleExpiresAt: "2026-10-14T12:00:00Z",
      absoluteExpiresAt: "2026-10-14T20:00:00Z",
    })
  }
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return renderHook(() => useAgreementPermissions(), { wrapper }).result.current
}

describe("useAgreementPermissions", () => {
  it("still tries to read while the session is unknown, and offers no action", () => {
    const permissions = permissionsFor()

    expect(permissions.participants.canRead).toBe(true)
    expect(permissions.examination.canRead).toBe(true)
    expect(permissions.report.canRead).toBe(true)
    expect(permissions.participants.canImport).toBe(false)
    expect(permissions.participants.canRemove).toBe(false)
    expect(permissions.agreement.canActivate).toBe(false)
    expect(permissions.assignments.canAssign).toBe(false)
    expect(permissions.assignments.canRecordAttendance).toBe(false)
  })

  it("needs the session list as well to assign, move or move all", () => {
    const create = PERMISSION.HEALTH_EXAMINATION_ASSIGNMENT_CREATE
    const move = PERMISSION.HEALTH_EXAMINATION_ASSIGNMENT_MOVE
    const moveAll = PERMISSION.HEALTH_EXAMINATION_ASSIGNMENT_MOVE_ALL
    const sessions = PERMISSION.HEALTH_EXAMINATION_SESSION_VIEW

    const withoutSessions = permissionsFor([create, move, moveAll])
    expect(withoutSessions.assignments.canAssign).toBe(false)
    expect(withoutSessions.assignments.canMove).toBe(false)
    expect(withoutSessions.assignments.canMoveAll).toBe(false)

    const withSessions = permissionsFor([create, move, moveAll, sessions])
    expect(withSessions.assignments.canAssign).toBe(true)
    expect(withSessions.assignments.canMove).toBe(true)
    expect(withSessions.assignments.canMoveAll).toBe(true)
  })

  it("needs the session detail as well to edit a session", () => {
    const update = PERMISSION.HEALTH_EXAMINATION_SESSION_UPDATE
    expect(permissionsFor([update]).sessions.canEdit).toBe(false)
    expect(
      permissionsFor([update, PERMISSION.HEALTH_EXAMINATION_SESSION_DETAIL_VIEW]).sessions.canEdit
    ).toBe(true)
  })

  it("hides what a known session lacks, one feature at a time", () => {
    const permissions = permissionsFor([PERMISSION.PARTICIPANT_VIEW, PERMISSION.PARTICIPANT_REMOVE])

    expect(permissions.participants.canRead).toBe(true)
    expect(permissions.participants.canRemove).toBe(true)
    expect(permissions.participants.canImport).toBe(false)
    expect(permissions.examination.canRead).toBe(false)
    expect(permissions.report.canRead).toBe(false)
  })

  it("needs the detail permission as well to edit a Participant", () => {
    expect(permissionsFor([PERMISSION.PARTICIPANT_UPDATE]).participants.canEdit).toBe(false)
    expect(
      permissionsFor([PERMISSION.PARTICIPANT_UPDATE, PERMISSION.PARTICIPANT_DETAIL_VIEW])
        .participants.canEdit
    ).toBe(true)
  })

  it("needs the job permissions as well to print in bulk", () => {
    const bulk = PERMISSION.PARTICIPANT_EXAMINATION_FORM_BULK_PRINT
    expect(permissionsFor([bulk]).participants.canBulkPrintForms).toBe(false)
    expect(
      permissionsFor([bulk, PERMISSION.DOCUMENT_RENDER_JOB_READ]).participants.canBulkPrintForms
    ).toBe(false)
    expect(
      permissionsFor([
        bulk,
        PERMISSION.DOCUMENT_RENDER_JOB_READ,
        PERMISSION.DOCUMENT_RENDER_JOB_DOWNLOAD,
      ]).participants.canBulkPrintForms
    ).toBe(true)
  })

  it("keeps single print apart from bulk print", () => {
    const permissions = permissionsFor([PERMISSION.PARTICIPANT_EXAMINATION_FORM_PRINT])

    expect(permissions.participants.canPrintForm).toBe(true)
    expect(permissions.participants.canBulkPrintForms).toBe(false)
  })
})
