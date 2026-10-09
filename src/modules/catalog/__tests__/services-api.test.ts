import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "@/shared/api/api-client"
import { fetchClinicalServiceCatalog } from "@/modules/catalog"

vi.unmock("@/modules/catalog/api/services")
afterEach(() => vi.restoreAllMocks())

const item = {
  id: "service-1", code: "LAB-001", name: "Dịch vụ", serviceType: "LAB",
  unitPrice: 90_000, active: true,
}

describe("catalog service lookup", () => {
  it("calls the catalog contract with cancellation and maps the reference price", async () => {
    const signal = new AbortController().signal
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({ result: "OK", code: 200,
      data: { items: [item], page: 1, size: 100, totalElements: 1, totalPages: 1 },
    })
    expect(await fetchClinicalServiceCatalog(signal)).toEqual([
      { id: item.id, code: item.code, name: item.name, serviceType: item.serviceType, unitPrice: 90_000 },
    ])
    expect(get).toHaveBeenCalledWith(
      "/api/v1/catalog/services?page=1&size=100&sortKey=code&sortBy=ASC", { signal }
    )
  })

  it("rejects a negative reference price from the transport response", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({ result: "OK", code: 200,
      data: { items: [{ ...item, unitPrice: -1 }], page: 1, size: 100, totalElements: 1, totalPages: 1 },
    })
    await expect(fetchClinicalServiceCatalog()).rejects.toThrow()
  })
})
