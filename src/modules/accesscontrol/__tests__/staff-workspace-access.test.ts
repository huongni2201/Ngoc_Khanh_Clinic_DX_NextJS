import { describe, expect, it } from "vitest"
import { PERMISSION } from "../permissions"
import { getStaffPermissions, hasStaffPermission } from "../utils/staff-workspace-access"
import { patientSession, staffSession } from "./fixtures"

describe("hasStaffPermission", () => {
  it("is true only for a STAFF session that carries the permission in some role", () => {
    expect(hasStaffPermission(staffSession, PERMISSION.ORGANIZATION_VIEW)).toBe(true)
    expect(hasStaffPermission(staffSession, PERMISSION.PARTICIPANT_IMPORT)).toBe(false)
  })

  it("is false without a session or for a PATIENT session", () => {
    expect(hasStaffPermission(null, PERMISSION.ORGANIZATION_VIEW)).toBe(false)
    expect(hasStaffPermission(undefined, PERMISSION.ORGANIZATION_VIEW)).toBe(false)
    expect(hasStaffPermission(patientSession, PERMISSION.ORGANIZATION_VIEW)).toBe(false)
  })
})

describe("getStaffPermissions", () => {
  it("merges the permissions of every role", () => {
    const session = {
      ...staffSession,
      roleAssignments: [
        { roleId: "r-1", roleCode: "A", permissions: ["ORGANIZATION_VIEW"] },
        { roleId: "r-2", roleCode: "B", permissions: ["PARTICIPANT_VIEW", "ORGANIZATION_VIEW"] },
      ],
    }

    expect([...getStaffPermissions(session)].sort()).toEqual(["ORGANIZATION_VIEW", "PARTICIPANT_VIEW"])
  })

  it("is empty without a STAFF session", () => {
    expect(getStaffPermissions(null).size).toBe(0)
    expect(getStaffPermissions(patientSession).size).toBe(0)
  })
})
