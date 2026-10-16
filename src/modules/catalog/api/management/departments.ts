import { parseCatalogPageEnvelope } from "./catalog-page"
import { parseApiData } from "@/shared/api/parse-api-data"
﻿import { apiClient } from "@/shared/api/api-client"
import { z } from "zod"
import type {
  Department,
  DepartmentListParams,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CatalogPageResponse,
} from "../../types/management"

const BASE = "/api/v1/catalog/management/departments"

const departmentSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  departmentType: z.enum(["CLINICAL", "DIAGNOSTIC", "ADMINISTRATIVE"]),
  active: z.boolean(),
  rowVersion: z.number().int().nonnegative(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

function mapDepartment(dto: z.infer<typeof departmentSchema>): Department {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    departmentType: dto.departmentType,
    active: dto.active,
    rowVersion: dto.rowVersion,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

function buildQuery(params: DepartmentListParams): URLSearchParams {
  const q = new URLSearchParams()
  q.set("page", String(params.page ?? 1))
  q.set("size", String(params.size ?? 10))
  q.set("sortKey", params.sortKey ?? "code")
  q.set("sortBy", params.sortBy ?? "ASC")
  if (params.q?.trim()) q.set("searchKey", params.q.trim())
  if (params.active != null) q.set("active", String(params.active))
  if (params.departmentType) q.set("departmentType", params.departmentType)
  return q
}

export async function fetchDepartments(
  params: DepartmentListParams,
  signal?: AbortSignal
): Promise<CatalogPageResponse<Department>> {
  const response = await apiClient.get<unknown>(`${BASE}?${buildQuery(params)}`, { signal })
  if (!response.data) throw new Error("Không thể tải danh sách khoa.")
  const page = parseCatalogPageEnvelope(response.data)
  return {
    items: page.items.map((i) => mapDepartment(parseApiData(departmentSchema, i))),
    page: page.page,
    pageSize: page.size,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
  }
}

export async function fetchDepartmentById(id: string, signal?: AbortSignal): Promise<Department> {
  const response = await apiClient.get<unknown>(`${BASE}/${encodeURIComponent(id)}`, { signal })
  if (!response.data) throw new Error("Không thể tải thông tin khoa.")
  return mapDepartment(parseApiData(departmentSchema, response.data))
}

export async function createDepartment(dto: CreateDepartmentDto): Promise<Department> {
  const response = await apiClient.post<CreateDepartmentDto, unknown>(BASE, dto)
  if (!response.data) throw new Error("Không thể tạo khoa.")
  return mapDepartment(parseApiData(departmentSchema, response.data))
}

export async function updateDepartment(id: string, dto: UpdateDepartmentDto): Promise<Department> {
  const response = await apiClient.put<UpdateDepartmentDto, unknown>(
    `${BASE}/${encodeURIComponent(id)}`,
    dto
  )
  if (!response.data) throw new Error("Không thể cập nhật khoa.")
  return mapDepartment(parseApiData(departmentSchema, response.data))
}

export async function deactivateDepartment(id: string, rowVersion: number): Promise<void> {
  await apiClient.delete<void>(`${BASE}/${encodeURIComponent(id)}?rowVersion=${rowVersion}`)
}

export async function reactivateDepartment(id: string, rowVersion: number): Promise<Department> {
  const response = await apiClient.post<{ rowVersion: number }, unknown>(
    `${BASE}/${encodeURIComponent(id)}/reactivate`,
    { rowVersion }
  )
  if (!response.data) throw new Error("Không thể bật lại khoa.")
  return mapDepartment(parseApiData(departmentSchema, response.data))
}
