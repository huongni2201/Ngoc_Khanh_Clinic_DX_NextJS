import { describe, expect, it } from "vitest"
import { healthExaminationAgreementFormSchema } from "../schemas/health-examination-agreement.schema"

const validAgreement = {
  agreementName: "Khám sức khỏe định kỳ",
  validFrom: "2026-09-15",
  validTo: "2026-12-31",
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
  const result = healthExaminationAgreementFormSchema.safeParse(value)
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe("healthExaminationAgreementFormSchema", () => {
  it("accepts a complete agreement", () => {
    expect(healthExaminationAgreementFormSchema.safeParse(validAgreement).success).toBe(true)
  })

  it("has no examination day or site, so a legacy site type is dropped and never validated", () => {
    const result = healthExaminationAgreementFormSchema.safeParse({
      ...validAgreement,
      examinationDates: ["2026-09-15"],
      examinationSiteType: "COMPANY",
    })

    expect(result.success).toBe(true)
    expect(result.success && Object.keys(result.data)).not.toContain("examinationDates")
    expect(result.success && Object.keys(result.data)).not.toContain("examinationSiteType")
  })

  it("lets the validity period stay open at either end", () => {
    expect(messages({ ...validAgreement, validFrom: "", validTo: "" })).toEqual([])
    expect(messages({ ...validAgreement, validFrom: "2026-09-15", validTo: "" })).toEqual([])
    expect(messages({ ...validAgreement, validFrom: "", validTo: "2026-12-31" })).toEqual([])
  })

  it("accepts LocalDate values only and rejects an inverted period", () => {
    expect(messages({ ...validAgreement, validFrom: "15/09/2026" })).toContain(
      "Ngày phải có định dạng yyyy-MM-dd"
    )
    expect(messages({ ...validAgreement, validFrom: "2026-12-31", validTo: "2026-09-15" })).toContain(
      "Ngày bắt đầu hiệu lực không được sau ngày kết thúc."
    )
    expect(messages({ ...validAgreement, validFrom: "2026-09-15", validTo: "2026-09-15" })).toEqual([])
  })

  it("mirrors the backend name length limit", () => {
    expect(messages({ ...validAgreement, agreementName: "  " })).toContain("Tên thỏa thuận là bắt buộc")
    expect(messages({ ...validAgreement, agreementName: "a".repeat(300) })).toEqual([])
    expect(messages({ ...validAgreement, agreementName: "a".repeat(301) })).toContain(
      "Tên thỏa thuận không được vượt quá 300 ký tự"
    )
  })

  it("requires a selected service and a whole non-negative negotiated price", () => {
    expect(
      messages({
        ...validAgreement,
        services: [{ ...validAgreement.services[0], selected: false }],
      })
    ).toContain("Vui lòng chọn ít nhất một hạng mục khám.")
    expect(
      messages({
        ...validAgreement,
        services: [{ ...validAgreement.services[0], negotiatedPrice: -1 }],
      }).length
    ).toBeGreaterThan(0)
    expect(
      messages({
        ...validAgreement,
        services: [{ ...validAgreement.services[0], negotiatedPrice: 90_000.5 }],
      }).length
    ).toBeGreaterThan(0)
  })
})
