import { parseCatalogPageEnvelope } from "./catalog-page"
import { parseApiData } from "@/shared/api/parse-api-data"
﻿import { apiClient } from "@/shared/api/api-client"
import { z } from "zod"
import type {
  Room,
  RoomListParams,
  CreateRoomDto,
  UpdateRoomDto,
  CatalogPageResponse,
} from "../../types/management"

const BASE = "/api/v1/catalog/management/rooms"

const roomSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  departmentId: z.string(),
  departmentName: z.string(),
  roomType: z.string(),
  active: z.boolean(),
  rowVersion: z.number().int().nonnegative(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

function mapRoom(dto: z.infer<typeof roomSchema>): Room {
  return { ...dto }
}

function buildQuery(params: RoomListParams): URLSearchParams {
  const q = new URLSearchParams()
  q.set("page", String(params.page ?? 1))
  q.set("size", String(params.size ?? 10))
  q.set("sortKey", params.sortKey ?? "code")
  q.set("sortBy", params.sortBy ?? "ASC")
  if (params.q?.trim()) q.set("searchKey", params.q.trim())
  if (params.active != null) q.set("active", String(params.active))
  if (params.departmentId) q.set("departmentId", params.departmentId)
  if (params.roomType) q.set("roomType", params.roomType)
  return q
}

export async function fetchRooms(
  params: RoomListParams,
  signal?: AbortSignal
): Promise<CatalogPageResponse<Room>> {
  const response = await apiClient.get<unknown>(`${BASE}?${buildQuery(params)}`, { signal })
  if (!response.data) throw new Error("Không thể tải danh sách phòng.")
  const page = parseCatalogPageEnvelope(response.data)
  return {
    items: page.items.map((i) => mapRoom(parseApiData(roomSchema, i))),
    page: page.page,
    pageSize: page.size,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
  }
}

export async function fetchRoomById(id: string, signal?: AbortSignal): Promise<Room> {
  const response = await apiClient.get<unknown>(`${BASE}/${encodeURIComponent(id)}`, { signal })
  if (!response.data) throw new Error("Không thể tải thông tin phòng.")
  return mapRoom(parseApiData(roomSchema, response.data))
}

export async function createRoom(dto: CreateRoomDto): Promise<Room> {
  const response = await apiClient.post<CreateRoomDto, unknown>(BASE, dto)
  if (!response.data) throw new Error("Không thể tạo phòng.")
  return mapRoom(parseApiData(roomSchema, response.data))
}

export async function updateRoom(id: string, dto: UpdateRoomDto): Promise<Room> {
  const response = await apiClient.put<UpdateRoomDto, unknown>(`${BASE}/${encodeURIComponent(id)}`, dto)
  if (!response.data) throw new Error("Không thể cập nhật phòng.")
  return mapRoom(parseApiData(roomSchema, response.data))
}

export async function deactivateRoom(id: string, rowVersion: number): Promise<void> {
  await apiClient.delete<void>(`${BASE}/${encodeURIComponent(id)}?rowVersion=${rowVersion}`)
}

export async function reactivateRoom(id: string, rowVersion: number): Promise<Room> {
  const response = await apiClient.post<{ rowVersion: number }, unknown>(
    `${BASE}/${encodeURIComponent(id)}/reactivate`,
    { rowVersion }
  )
  if (!response.data) throw new Error("Không thể bật lại phòng.")
  return mapRoom(parseApiData(roomSchema, response.data))
}
