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
    ["ABSENT", "PENDING", "Vắng"],
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

  it("recognizes a performed service by its batch service id", () => {
    const row = { performedBatchServiceIds: ["s1"] }
    expect(isServicePerformed(row, "s1")).toBe(true)
    expect(isServicePerformed(row, "s2")).toBe(false)
  })

  it("allows the import only for DRAFT and READY batches", () => {
    expect(isExaminationImportAllowed("DRAFT")).toBe(true)
    expect(isExaminationImportAllowed("READY")).toBe(true)
    expect(isExaminationImportAllowed("FINALIZED")).toBe(false)
    expect(isExaminationImportAllowed("CLOSED")).toBe(false)
  })
})
