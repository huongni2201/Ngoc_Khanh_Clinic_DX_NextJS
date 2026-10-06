import { describe, expect, it } from "vitest"
import { healthExaminationKeys } from "../query-keys"

describe("healthExaminationKeys", () => {
  it("groups the batch list and detail under the organization", () => {
    expect(healthExaminationKeys.batches("org-1")).toEqual([
      "health-examinations",
      "batches",
      "org-1",
    ])
    expect(healthExaminationKeys.batch("org-1", "batch-1")).toEqual([
      "health-examinations",
      "batches",
      "org-1",
      "detail",
      "batch-1",
    ])
  })

  it("normalizes list params so equal lists share one cache entry", () => {
    const explicit = healthExaminationKeys.batchList("org-1", {
      search: " A ",
      page: 1,
      pageSize: 10,
      sortKey: "id",
      sortBy: "ASC",
    })
    expect(healthExaminationKeys.batchList("org-1", { search: "A" })).toEqual(explicit)
    expect(healthExaminationKeys.batchList("org-1")).toEqual(
      healthExaminationKeys.batchList("org-1", {})
    )
    expect(explicit.slice(0, 4)).toEqual(["health-examinations", "batches", "org-1", "list"])
  })

  it("keeps the detail of one organization out of another organization's keys", () => {
    expect(healthExaminationKeys.batch("org-1", "b")).not.toEqual(
      healthExaminationKeys.batch("org-2", "b")
    )
  })

  it("provides prefixes for clinical-service, report, and progress queries", () => {
    expect(healthExaminationKeys.clinicalServices()).toEqual([
      "health-examinations",
      "clinical-services",
    ])
  })
})
