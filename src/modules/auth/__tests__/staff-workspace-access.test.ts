import { describe, expect, it } from "vitest"
import { hasStaffPermission } from "../utils/staff-workspace-access"
import { patientSession, staffSession } from "./fixtures"

describe("hasStaffPermission", () => {
  it("is true only for a STAFF session that carries the permission in some role", () => {
    expect(hasStaffPermission(staffSession, "ORGANIZATION_READ")).toBe(true)
    expect(hasStaffPermission(staffSession, "HEALTH_EXAMINATION_PARTICIPANT_IMPORT")).toBe(false)
  })

  it("is false without a session or for a PATIENT session", () => {
    expect(hasStaffPermission(null, "ORGANIZATION_READ")).toBe(false)
    expect(hasStaffPermission(undefined, "ORGANIZATION_READ")).toBe(false)
    expect(hasStaffPermission(patientSession, "ORGANIZATION_READ")).toBe(false)
  })
})
