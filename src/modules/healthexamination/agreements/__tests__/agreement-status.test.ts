import { describe, expect, it } from "vitest"
import { HEALTH_EXAMINATION_AGREEMENT_STATUSES } from "../types"
import {
  getHealthExaminationAgreementStatusLabel,
  parseHealthExaminationAgreementStatusFilter,
} from "../utils/agreement-status"

describe("health examination agreement statuses", () => {
  it("matches the backend AgreementStatus values and labels each one", () => {
    expect(HEALTH_EXAMINATION_AGREEMENT_STATUSES).toEqual(["DRAFT", "ACTIVE", "ENDED"])
    expect(HEALTH_EXAMINATION_AGREEMENT_STATUSES.map(getHealthExaminationAgreementStatusLabel)).toEqual([
      "Nháp",
      "Đang áp dụng",
      "Đã kết thúc",
    ])
  })

  it("falls back to all statuses for an unknown filter value", () => {
    expect(parseHealthExaminationAgreementStatusFilter("unknown")).toBe("ALL")
    expect(parseHealthExaminationAgreementStatusFilter("IN_PROGRESS")).toBe("ALL")
    expect(parseHealthExaminationAgreementStatusFilter("CLOSED")).toBe("ALL")
    expect(parseHealthExaminationAgreementStatusFilter("ENDED")).toBe("ENDED")
  })
})
