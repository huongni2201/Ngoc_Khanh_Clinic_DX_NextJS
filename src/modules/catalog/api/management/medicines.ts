import { parseCatalogPageEnvelope } from "./catalog-page"
import { parseApiData } from "@/shared/api/parse-api-data"
﻿import { apiClient } from "@/shared/api/api-client"
import { z } from "zod"
import type {
  Medicine,
  MedicineListParams,
  CreateMedicineDto,
  UpdateMedicineDto,
  CatalogPageResponse,
} from "../../types/management"

const BASE = "/api/v1/catalog/management/medicines"

const medicineSchema = z.object({
  id: z.string(),
  code: z.string(),
  genericName: z.string(),
  brandName: z.string().nullable(),
  strength: z.string(),
  dosageForm: z.string(),
  unit: z.string(),
  active: z.boolean(),
  rowVersion: z.number().int().nonnegative(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

function mapMedicine(dto: z.infer<typeof medicineSchema>): Medicine {
  return { ...dto }
}

function buildQuery(params: MedicineListParams): URLSearchParams {
  const q = new URLSearchParams()
  q.set("page", String(params.page ?? 1))
  q.set("size", String(params.size ?? 10))
  q.set("sortKey", params.sortKey ?? "code")
  q.set("sortBy", params.sortBy ?? "ASC")
  if (params.q?.trim()) q.set("searchKey", params.q.trim())
  if (params.active != null) q.set("active", String(params.active))
  if (params.dosageForm) q.set("dosageForm", params.dosageForm)
  return q
}

export async function fetchMedicines(
  params: MedicineListParams,
  signal?: AbortSignal
): Promise<CatalogPageResponse<Medicine>> {
  const response = await apiClient.get<unknown>(`${BASE}?${buildQuery(params)}`, { signal })
  if (!response.data) throw new Error("Không thể tải danh sách thuốc.")
  const page = parseCatalogPageEnvelope(response.data)
  return {
    items: page.items.map((i) => mapMedicine(parseApiData(medicineSchema, i))),
    page: page.page,
    pageSize: page.size,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
  }
}

export async function fetchMedicineById(id: string, signal?: AbortSignal): Promise<Medicine> {
  const response = await apiClient.get<unknown>(`${BASE}/${encodeURIComponent(id)}`, { signal })
  if (!response.data) throw new Error("Không thể tải thông tin thuốc.")
  return mapMedicine(parseApiData(medicineSchema, response.data))
}

export async function createMedicine(dto: CreateMedicineDto): Promise<Medicine> {
  const response = await apiClient.post<CreateMedicineDto, unknown>(BASE, dto)
  if (!response.data) throw new Error("Không thể tạo thuốc.")
  return mapMedicine(parseApiData(medicineSchema, response.data))
}

export async function updateMedicine(id: string, dto: UpdateMedicineDto): Promise<Medicine> {
  const response = await apiClient.put<UpdateMedicineDto, unknown>(`${BASE}/${encodeURIComponent(id)}`, dto)
  if (!response.data) throw new Error("Không thể cập nhật thuốc.")
  return mapMedicine(parseApiData(medicineSchema, response.data))
}

export async function deactivateMedicine(id: string, rowVersion: number): Promise<void> {
  await apiClient.delete<void>(`${BASE}/${encodeURIComponent(id)}?rowVersion=${rowVersion}`)
}

export async function reactivateMedicine(id: string, rowVersion: number): Promise<Medicine> {
  const response = await apiClient.post<{ rowVersion: number }, unknown>(
    `${BASE}/${encodeURIComponent(id)}/reactivate`,
    { rowVersion }
  )
  if (!response.data) throw new Error("Không thể bật lại thuốc.")
  return mapMedicine(parseApiData(medicineSchema, response.data))
}
