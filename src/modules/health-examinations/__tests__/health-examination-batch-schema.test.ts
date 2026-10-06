import { describe, expect, it } from "vitest"
import { healthExaminationBatchFormSchema } from "../schemas/health-examination-batch.schema"

const validBatch = {
  batchCode: "HC-2026-01",
  batchName: "Khám sức khỏe định kỳ",
  examinationDates: ["2026-09-15", "2026-09-16"],
  examinationSiteType: "ORGANIZATION_SITE",
  examinationSiteName: "Đơn vị",
  examinationSiteAddress: "1 Đường A",
  services: [
    {
      serviceId: "service-1",
      code: "S1",
      name: "Khám tổng quát",
      referencePrice: 100_000,
      selected: true,
      negotiatedPrice: 90_000,
    },
  ],
}

function messages(value: unknown) {
  const result = healthExaminationBatchFormSchema.safeParse(value)
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe("healthExaminationBatchFormSchema", () => {
  it("accepts a complete batch", () => {
    expect(healthExaminationBatchFormSchema.safeParse(validBatch).success).toBe(true)
  })

  it("accepts LocalDate values only and needs at least one distinct date", () => {
    expect(messages({ ...validBatch, examinationDates: ["15/09/2026"] })).toContain(
      "Ngày phải có định dạng yyyy-MM-dd"
    )
    expect(messages({ ...validBatch, examinationDates: [] })).toContain(
      "Vui lòng chọn ít nhất một ngày khám."
    )
    expect(
      messages({ ...validBatch, examinationDates: ["2026-09-15", "2026-09-15"] })
    ).toContain("Ngày khám không được trùng nhau.")
  })

  it("accepts only the backend site types CLINIC and ORGANIZATION_SITE", () => {
    for (const examinationSiteType of ["CLINIC", "ORGANIZATION_SITE"]) {
      expect(
        healthExaminationBatchFormSchema.safeParse({ ...validBatch, examinationSiteType }).success
      ).toBe(true)
    }
    expect(messages({ ...validBatch, examinationSiteType: "COMPANY" }).length).toBeGreaterThan(0)
    expect(messages({ ...validBatch, examinationSiteType: "" })).toContain("Loại địa điểm là bắt buộc")
  })

  it("requires the site address and mirrors the backend length limits", () => {
    expect(messages({ ...validBatch, examinationSiteAddress: "  " })).toContain(
      "Địa chỉ địa điểm khám là bắt buộc"
    )
    expect(messages({ ...validBatch, batchCode: "a".repeat(50) })).toEqual([])
    expect(messages({ ...validBatch, batchCode: "a".repeat(51) })).toContain(
      "Mã đợt khám không được vượt quá 50 ký tự"
    )
    expect(messages({ ...validBatch, batchName: "a".repeat(300) })).toEqual([])
    expect(messages({ ...validBatch, batchName: "a".repeat(301) })).toContain(
      "Tên đợt khám không được vượt quá 300 ký tự"
    )
  })

  it("requires a selected service and a whole non-negative negotiated price", () => {
    expect(
      messages({
        ...validBatch,
        services: [{ ...validBatch.services[0], selected: false }],
      })
    ).toContain("Vui lòng chọn ít nhất một hạng mục khám.")
    expect(
      messages({
        ...validBatch,
        services: [{ ...validBatch.services[0], negotiatedPrice: -1 }],
      }).length
    ).toBeGreaterThan(0)
  })
})
