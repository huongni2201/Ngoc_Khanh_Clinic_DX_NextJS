import { parseCatalogPageEnvelope } from "./catalog-page"
import { parseApiData } from "@/shared/api/parse-api-data"
﻿import { apiClient } from "@/shared/api/api-client"
import { z } from "zod"
import type {
  Specialty,
  SpecialtyListParams,
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  CatalogPageResponse,
} from "../../types/management"

const BASE = "/api/v1/catalog/management/specialties"

const specialtySchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  active: z.boolean(),
  rowVersion: z.number().int().nonnegative(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

function mapSpecialty(dto: z.infer<typeof specialtySchema>): Specialty {
  return { ...dto }
}

function buildQuery(params: SpecialtyListParams): URLSearchParams {
  const q = new URLSearchParams()
  q.set("page", String(params.page ?? 1))
  q.set("size", String(params.size ?? 10))
  q.set("sortKey", params.sortKey ?? "code")
  q.set("sortBy", params.sortBy ?? "ASC")
  if (params.q?.trim()) q.set("searchKey", params.q.trim())
  if (params.active != null) q.set("active", String(params.active))
  return q
}

export async function fetchSpecialties(
  params: SpecialtyListParams,
  signal?: AbortSignal
): Promise<CatalogPageResponse<Specialty>> {
  const response = await apiClient.get<unknown>(`${BASE}?${buildQuery(params)}`, { signal })
  if (!response.data) throw new Error("Không thể tải danh sách chuyên khoa.")
  const page = parseCatalogPageEnvelope(response.data)
  return {
    items: page.items.map((i) => mapSpecialty(parseApiData(specialtySchema, i))),
    page: page.page,
    pageSize: page.size,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
  }
}

export async function fetchSpecialtyById(id: string, signal?: AbortSignal): Promise<Specialty> {
  const response = await apiClient.get<unknown>(`${BASE}/${encodeURIComponent(id)}`, { signal })
  if (!response.data) throw new Error("Không thể tải thông tin chuyên khoa.")
  return mapSpecialty(parseApiData(specialtySchema, response.data))
}

export async function createSpecialty(dto: CreateSpecialtyDto): Promise<Specialty> {
  const response = await apiClient.post<CreateSpecialtyDto, unknown>(BASE, dto)
  if (!response.data) throw new Error("Không thể tạo chuyên khoa.")
  return mapSpecialty(parseApiData(specialtySchema, response.data))
}

export async function updateSpecialty(id: string, dto: UpdateSpecialtyDto): Promise<Specialty> {
  const response = await apiClient.put<UpdateSpecialtyDto, unknown>(`${BASE}/${encodeURIComponent(id)}`, dto)
  if (!response.data) throw new Error("Không thể cập nhật chuyên khoa.")
  return mapSpecialty(parseApiData(specialtySchema, response.data))
}

export async function deactivateSpecialty(id: string, rowVersion: number): Promise<void> {
  await apiClient.delete<void>(`${BASE}/${encodeURIComponent(id)}?rowVersion=${rowVersion}`)
}

export async function reactivateSpecialty(id: string, rowVersion: number): Promise<Specialty> {
  const response = await apiClient.post<{ rowVersion: number }, unknown>(
    `${BASE}/${encodeURIComponent(id)}/reactivate`,
    { rowVersion }
  )
  if (!response.data) throw new Error("Không thể bật lại chuyên khoa.")
  return mapSpecialty(parseApiData(specialtySchema, response.data))
}
