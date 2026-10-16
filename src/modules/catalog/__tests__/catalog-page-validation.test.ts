import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "@/shared/api/api-client"
import { fetchDepartments } from "../api/management/departments"
import { fetchRooms } from "../api/management/rooms"
import { fetchSpecialties } from "../api/management/specialties"
import { fetchManagedServices } from "../api/management/services"
import { fetchMedicines } from "../api/management/medicines"

afterEach(() => vi.restoreAllMocks())

describe.each([
  ["departments", fetchDepartments],
  ["rooms", fetchRooms],
  ["specialties", fetchSpecialties],
  ["services", fetchManagedServices],
  ["medicines", fetchMedicines],
] as const)("%s response validation", (_name, fetchPage) => {
  it.each([
    { items: null, page: 1, size: 10, totalElements: 0, totalPages: 0 },
    { items: [], page: 1, size: 10, totalElements: -1, totalPages: 0 },
  ])("rejects invalid list metadata with a Vietnamese message", async (data) => {
    vi.spyOn(apiClient, "get").mockResolvedValue({ result: "OK", code: 200, data })
    await expect(fetchPage({})).rejects.toThrow("Dữ liệu phản hồi từ máy chủ không hợp lệ.")
  })
})
