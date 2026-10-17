import { describe, expect, it } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"
import { describeExaminationDetailRecordError } from "../utils/examination-detail-record-errors"

const conflict = (message: string) => new ApiClientError("generic", 409, 409, message)

describe("describeExaminationDetailRecordError", () => {
  it.each([
    ["Participant was changed by another request; reload and try again", "stale-version", true],
    ["Participant: a marked service is no longer offered in this agreement", "no-longer-offered", false],
    ["Participant is cancelled", "cancelled", true],
    ["Agreement does not accept examination detail changes", "closed-agreement", false],
  ] as const)("maps the 409 '%s' to %s", (message, kind, needsReload) => {
    const failure = describeExaminationDetailRecordError(conflict(message))

    expect(failure.kind).toBe(kind)
    expect(failure.needsReload).toBe(needsReload)
    expect(failure.message).not.toMatch(/[A-Za-z]{4,} [a-z]+ [a-z]+ [a-z]+/)
  })

  it("keeps a neutral Vietnamese text for an unknown 409", () => {
    const failure = describeExaminationDetailRecordError(conflict("Something new"))

    expect(failure.needsReload).toBe(true)
    expect(failure.message).not.toContain("Something new")
  })

  it("never shows an English text for an unexpected error", () => {
    const failure = describeExaminationDetailRecordError(new Error("boom"))

    expect(failure.kind).toBe("unknown")
    expect(failure.message).not.toContain("boom")
  })
})
