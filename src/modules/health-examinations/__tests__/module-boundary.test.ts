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
    }
    const batchService: HealthExaminationBatchService = {
      serviceId: service.id,
      name: service.name,
      unitPrice: 0,
    }

    expect(batchService.serviceId).toBe(service.id)
  })

})
