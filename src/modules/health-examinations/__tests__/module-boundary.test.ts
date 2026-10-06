import { describe, expect, it } from "vitest"
import {
  HealthExaminationBatchDetailPage,
  type ClinicalService,
  type HealthExaminationBatchService,
} from "@/modules/health-examinations"

describe("health examination module boundary", () => {
  it("exports the canonical health examination implementation", () => {
    expect(HealthExaminationBatchDetailPage).toBeTypeOf("function")

    const service: ClinicalService = {
      id: "service-1",
      code: "LAB-001",
      name: "Tổng phân tích tế bào máu",
      serviceType: "LAB",
      unitPrice: 90_000,
    }
    const batchService: HealthExaminationBatchService = {
      id: "batch-service-1",
      serviceId: service.id,
      code: service.code,
      name: service.name,
      referencePrice: service.unitPrice,
      negotiatedPrice: 80_000,
      displayOrder: 1,
    }

    expect(batchService.serviceId).toBe(service.id)
  })

})
