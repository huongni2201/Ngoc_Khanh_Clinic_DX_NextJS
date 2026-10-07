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

  it("keeps the Participant detail under the participants root so one invalidation refreshes both", () => {
    const root = healthExaminationKeys.participantsRoot("org-1", "batch-1")
    const detail = healthExaminationKeys.participantDetail("org-1", "batch-1", "p-1")
    expect(detail.slice(0, root.length)).toEqual(root)
    expect(detail).not.toEqual(healthExaminationKeys.participantDetail("org-1", "batch-1", "p-2"))
    expect(detail).not.toEqual(healthExaminationKeys.participantDetail("org-2", "batch-1", "p-1"))
  })

  it("keeps the examination detail queries under one root so an import refreshes the list and the counters", () => {
    const root = healthExaminationKeys.examinationDetailsRoot("org-1", "batch-1")
    const list = healthExaminationKeys.examinationDetails("org-1", "batch-1", { page: 2 })
    const summary = healthExaminationKeys.examinationSummary("org-1", "batch-1")
    expect(list.slice(0, root.length)).toEqual(root)
    expect(summary.slice(0, root.length)).toEqual(root)
    expect(list).not.toEqual(healthExaminationKeys.examinationDetails("org-1", "batch-1", { page: 3 }))
    expect(list).not.toEqual(healthExaminationKeys.examinationDetails("org-2", "batch-1", { page: 2 }))
  })

  it("keeps the payment report of one batch apart from the examination details", () => {
    const report = healthExaminationKeys.paymentReport("org-1", "batch-1")
    const root = healthExaminationKeys.examinationDetailsRoot("org-1", "batch-1")
    expect(report).not.toEqual(root)
    expect(report).not.toEqual(healthExaminationKeys.paymentReport("org-1", "batch-2"))
  })
})
