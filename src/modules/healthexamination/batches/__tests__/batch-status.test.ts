import { describe, expect, it } from "vitest"
import { HEALTH_EXAMINATION_BATCH_STATUSES } from "../types"
import {
  getHealthExaminationBatchStatusLabel,
  parseHealthExaminationBatchStatusFilter,
} from "../utils/batch-status"

describe("health examination batch statuses", () => {
  it("matches the backend BatchStatus values and labels each one", () => {
    expect(HEALTH_EXAMINATION_BATCH_STATUSES).toEqual(["DRAFT", "READY", "FINALIZED", "CLOSED"])
    expect(HEALTH_EXAMINATION_BATCH_STATUSES.map(getHealthExaminationBatchStatusLabel)).toEqual([
      "Nháp",
      "Sẵn sàng",
      "Đã chốt",
      "Đã đóng",
    ])
  })

  it("falls back to all statuses for an unknown filter value", () => {
    expect(parseHealthExaminationBatchStatusFilter("unknown")).toBe("ALL")
    expect(parseHealthExaminationBatchStatusFilter("IN_PROGRESS")).toBe("ALL")
  })
})
