import { apiClient } from "@/shared/api/api-client"
import type { ClinicalService } from "../types"
import { serviceCatalogPageResponseSchema } from "../types/transport"

const SERVICE_CATALOG_ENDPOINT = "/api/v1/catalog/services"

const SERVICE_CATALOG_PAGE_SIZE = 100

/** Active catalog services, first page only (the catalog is small and the picker has no paging). */
export async function fetchClinicalServiceCatalog(
  signal?: AbortSignal
): Promise<ClinicalService[]> {
  const query = new URLSearchParams({
    page: "1",
    size: String(SERVICE_CATALOG_PAGE_SIZE),
    sortKey: "code",
    sortBy: "ASC",
  })
  const response = await apiClient.get<unknown>(`${SERVICE_CATALOG_ENDPOINT}?${query}`, { signal })
  if (!response.data) {
    throw new Error(response.message || "Phản hồi danh mục dịch vụ khám không có dữ liệu.")
  }

  return serviceCatalogPageResponseSchema.parse(response.data).items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    serviceType: item.serviceType,
    unitPrice: item.unitPrice,
  }))
}
