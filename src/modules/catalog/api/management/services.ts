import { parseCatalogPageEnvelope } from "./catalog-page"
import { parseApiData } from "@/shared/api/parse-api-data"
﻿import { apiClient } from "@/shared/api/api-client"
import { z } from "zod"
import type {
  ManagedService,
  ManagedServiceListItem,
  ServiceListParams,
  CreateServiceDto,
  UpdateServiceDto,
  CatalogPageResponse,
} from "../../types/management"

const BASE = "/api/v1/catalog/management/services"

const serviceSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  serviceType: z.enum(["CONSULTATION", "LAB", "ULTRASOUND", "XRAY", "ECG", "OTHER"]),
  performingDepartmentId: z.string(),
  performingDepartmentName: z.string(),
  specialtyId: z.string().nullable(),
  specialtyName: z.string().nullable(),
  unitPrice: z.union([z.number().finite().nonnegative(), z.string().regex(/^\d+(\.\d{1,2})?$/)]).transform(String),
  preparationInstruction: z.string().nullable(),
  active: z.boolean(),
  rowVersion: z.number().int().nonnegative(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

function mapService(dto: z.infer<typeof serviceSchema>): ManagedService {
  return { ...dto }
}

function buildQuery(params: ServiceListParams): URLSearchParams {
  const q = new URLSearchParams()
  q.set("page", String(params.page ?? 1))
  q.set("size", String(params.size ?? 10))
  q.set("sortKey", params.sortKey ?? "code")
  q.set("sortBy", params.sortBy ?? "ASC")
  if (params.q?.trim()) q.set("searchKey", params.q.trim())
  if (params.active != null) q.set("active", String(params.active))
  if (params.serviceType) q.set("serviceType", params.serviceType)
  if (params.departmentId) q.set("performingDepartmentId", params.departmentId)
  if (params.specialtyId) q.set("specialtyId", params.specialtyId)
  return q
}

export async function fetchManagedServices(
  params: ServiceListParams,
  signal?: AbortSignal
): Promise<CatalogPageResponse<ManagedServiceListItem>> {
  const response = await apiClient.get<unknown>(`${BASE}?${buildQuery(params)}`, { signal })
  if (!response.data) throw new Error("Không thể tải danh sách dịch vụ.")
  const page = parseCatalogPageEnvelope(response.data)
  return {
    items: page.items.map((i) => parseApiData(serviceSchema.omit({ preparationInstruction: true }), i)),
    page: page.page,
    pageSize: page.size,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
  }
}

export async function fetchManagedServiceById(id: string, signal?: AbortSignal): Promise<ManagedService> {
  const response = await apiClient.get<unknown>(`${BASE}/${encodeURIComponent(id)}`, { signal })
  if (!response.data) throw new Error("Không thể tải thông tin dịch vụ.")
  return mapService(parseApiData(serviceSchema, response.data))
}

export async function createManagedService(dto: CreateServiceDto): Promise<ManagedService> {
  const response = await apiClient.post<CreateServiceDto, unknown>(BASE, dto)
  if (!response.data) throw new Error("Không thể tạo dịch vụ.")
  return mapService(parseApiData(serviceSchema, response.data))
}

export async function updateManagedService(id: string, dto: UpdateServiceDto): Promise<ManagedService> {
  const response = await apiClient.put<UpdateServiceDto, unknown>(`${BASE}/${encodeURIComponent(id)}`, dto)
  if (!response.data) throw new Error("Không thể cập nhật dịch vụ.")
  return mapService(parseApiData(serviceSchema, response.data))
}

export async function deactivateManagedService(id: string, rowVersion: number): Promise<void> {
  await apiClient.delete<void>(`${BASE}/${encodeURIComponent(id)}?rowVersion=${rowVersion}`)
}

export async function reactivateManagedService(id: string, rowVersion: number): Promise<ManagedService> {
  const response = await apiClient.post<{ rowVersion: number }, unknown>(
    `${BASE}/${encodeURIComponent(id)}/reactivate`,
    { rowVersion }
  )
  if (!response.data) throw new Error("Không thể bật lại dịch vụ.")
  return mapService(parseApiData(serviceSchema, response.data))
}
