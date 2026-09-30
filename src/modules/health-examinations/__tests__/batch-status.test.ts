import { describe, expect, it } from "vitest"
import { HEALTH_EXAMINATION_BATCH_STATUSES } from "../types"
import {
  getHealthExaminationBatchStatusLabel,
  parseHealthExaminationBatchStatusFilter,
} from "../utils/batch-status"

describe("health examination batch statuses", () => {
  it("preserves the backend lifecycle and shows a label for every status", () => {
    expect(HEALTH_EXAMINATION_BATCH_STATUSES).toEqual([
      "DRAFT",
      "READY",
      "IN_PROGRESS",
      "RESULT_PROCESSING",
      "FINALIZED",
      "CLOSED",
      "CANCELED",
      "DELETED",
    ])
    expect(HEALTH_EXAMINATION_BATCH_STATUSES.map(getHealthExaminationBatchStatusLabel)).toEqual([
      "Nháp",
      "Sẵn sàng",
      "Đang khám",
      "Đang xử lý kết quả",
      "Đã chốt",
      "Đã đóng",
      "Đã hủy",
      "Đã xóa",
    ])
  })

  it("falls back to all statuses for an unknown filter value", () => {
    expect(parseHealthExaminationBatchStatusFilter("unknown")).toBe("ALL")
  })
})
