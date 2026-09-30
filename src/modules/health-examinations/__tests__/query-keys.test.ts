import { describe, expect, it } from "vitest"
import { healthExaminationKeys } from "../query-keys"

describe("healthExaminationKeys", () => {
  it("groups batch lists and details under the module root", () => {
    expect(healthExaminationKeys.batchList("org-1", { search: "A" })).toEqual([
      "health-examinations",
      "batches",
      "org-1",
      "list",
      { search: "A" },
    ])
    expect(healthExaminationKeys.batchById("batch-1")).toEqual([
      "health-examinations",
      "batches",
      "detail",
      "batch-1",
    ])
  })

  it("provides prefixes for clinical-service, report, and progress queries", () => {
    expect(healthExaminationKeys.clinicalServices()).toEqual([
      "health-examinations",
      "clinical-services",
    ])
    expect(healthExaminationKeys.batchReport("batch-1")).toEqual([
      "health-examinations",
      "batches",
      "detail",
      "batch-1",
      "report",
    ])
    expect(healthExaminationKeys.batchMatrix("batch-1", {})).toEqual([
      "health-examinations",
      "batches",
      "detail",
      "batch-1",
      "matrix",
      {},
    ])
  })
})
