import { describe, expect, it } from "vitest"
import { mockEncounterDetail } from "@/modules/encounters/api"

describe("encounter clinical terminology", () => {
  it("uses canonical clinical record and diagnostic result fields", () => {
    expect(mockEncounterDetail.clinicalRecord).toHaveProperty(
      "historyOfPresentIllness"
    )
    expect(mockEncounterDetail.clinicalRecord).toHaveProperty(
      "physicalExamFindings"
    )
    expect(mockEncounterDetail).toHaveProperty("diagnosticServiceRequests")
    expect(mockEncounterDetail).toHaveProperty("laboratoryReport")
  })
})
