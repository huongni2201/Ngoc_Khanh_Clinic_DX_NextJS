import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "@/shared/api/api-client"
import { fetchManagedServices, fetchManagedServiceById } from "../api/management/services"

const item = {
  id: "service-1", code: "KHAM", name: "Khám nội", serviceType: "CONSULTATION",
  performingDepartmentId: "department-1", performingDepartmentName: "Khoa khám",
  specialtyId: null, specialtyName: null, unitPrice: 150000.50,
  active: true, rowVersion: 2, createdAt: null, updatedAt: null,
}

afterEach(() => vi.restoreAllMocks())

describe("Managed service backend contract", () => {
  it("reads numeric prices and list rows without detail-only preparation instructions", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({ result: "OK", code: 200,
      data: { items: [item], page: 1, size: 10, totalElements: 1, totalPages: 1 } })
    const page = await fetchManagedServices({})
    expect(page.items[0].unitPrice).toBe("150000.5")
    expect(page.totalElements).toBe(1)
  })

  it("sends the backend performingDepartmentId filter", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({ result: "OK", code: 200,
      data: { items: [], page: 1, size: 10, totalElements: 0, totalPages: 0 } })
    await fetchManagedServices({ departmentId: "department-1" })
    const query = new URL(String(get.mock.calls[0][0]), "http://example.invalid").searchParams
    expect(query.get("performingDepartmentId")).toBe("department-1")
    expect(query.has("departmentId")).toBe(false)
  })

  it("keeps preparation instructions from the detail response", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({ result: "OK", code: 200,
      data: { ...item, preparationInstruction: "Nhịn ăn trước khi khám" } })
    expect((await fetchManagedServiceById(item.id)).preparationInstruction).toBe("Nhịn ăn trước khi khám")
  })
})
