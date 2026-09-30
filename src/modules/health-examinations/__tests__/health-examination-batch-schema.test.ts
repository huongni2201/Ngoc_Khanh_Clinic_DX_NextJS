import { describe, expect, it } from "vitest"
import { createHealthExaminationBatchSchema } from "../schemas/health-examination-batch.schema"

const validBatch = {
  organizationId: "org-1",
  batchCode: "HC-2026-01",
  batchName: "Khám sức khỏe định kỳ",
  startDate: "2026-09-15",
  endDate: "",
  reason: "",
  payerType: "",
  examinationSiteType: "COMPANY",
  examinationSiteName: "Đơn vị",
  examinationSiteAddress: "",
  services: [
    { serviceId: "service-1", name: "Khám tổng quát", selected: true, unitPrice: 100_000 },
  ],
}

describe("createHealthExaminationBatchSchema", () => {
  it("accepts LocalDate values and rejects localized display dates", () => {
    expect(createHealthExaminationBatchSchema.safeParse(validBatch).success).toBe(true)
    expect(
      createHealthExaminationBatchSchema.safeParse({
        ...validBatch,
        startDate: "15/09/2026",
      }).success
    ).toBe(false)
  })
})
