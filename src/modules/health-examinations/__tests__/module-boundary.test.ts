import { describe, expect, it } from "vitest"
import {
  HealthExaminationBatchDetailPage,
  fetchClinicalServiceCatalog,
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
      defaultPrice: 150000,
    }
    const batchService: HealthExaminationBatchService = {
      serviceId: service.id,
      name: service.name,
      unitPrice: service.defaultPrice,
    }

    expect(batchService.serviceId).toBe(service.id)
  })

  it("exposes a clinical service catalog instead of examination items", async () => {
    const services = await fetchClinicalServiceCatalog()

    expect(services[0]).toMatchObject({
      id: expect.any(String),
      code: expect.any(String),
      name: expect.any(String),
      defaultPrice: expect.any(Number),
    })
  })
})
