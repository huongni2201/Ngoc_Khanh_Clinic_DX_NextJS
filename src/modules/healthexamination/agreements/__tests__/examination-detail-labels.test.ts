import { describe, expect, it } from "vitest"
import {
  getExaminationStatus,
  getExaminationStatusLabel,
  isExaminationImportAllowed,
  isServicePerformed,
} from "../utils/examination-detail-labels"

describe("examination status labels", () => {
  it.each([
    ["UNCONFIRMED", "PENDING", "Chưa đến"],
    ["NO_SHOW", "PENDING", "Không đến"],
    ["ATTENDED", "PENDING", "Đã đến – chờ đối soát"],
    ["ATTENDED", "RECONCILED", "Đã đối soát"],
  ] as const)("shows %s + %s as %s", (attendanceStatus, reconciliationStatus, label) => {
    expect(getExaminationStatusLabel({ attendanceStatus, reconciliationStatus })).toBe(label)
  })

  it("lets a reconciled Participant win over the attendance value", () => {
    expect(
      getExaminationStatus({ attendanceStatus: "UNCONFIRMED", reconciliationStatus: "RECONCILED" })
    ).toBe("RECONCILED")
  })

  it("recognizes a performed service by its agreement service id", () => {
    const row = { performedAgreementServiceIds: ["s1"] }
    expect(isServicePerformed(row, "s1")).toBe(true)
    expect(isServicePerformed(row, "s2")).toBe(false)
  })

  it("allows the import only for DRAFT and ACTIVE agreements", () => {
    expect(isExaminationImportAllowed("DRAFT")).toBe(true)
    expect(isExaminationImportAllowed("ACTIVE")).toBe(true)
    expect(isExaminationImportAllowed("ENDED")).toBe(false)
  })
})
