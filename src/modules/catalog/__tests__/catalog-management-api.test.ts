import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "@/shared/api/api-client"
import {
  fetchDepartments,
  fetchDepartmentById,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
  reactivateDepartment,
} from "../api/management/departments"
import {
  fetchRooms,
  createRoom,
} from "../api/management/rooms"
import {
  fetchManagedServices,
} from "../api/management/services"
import {
  createMedicine,
} from "../api/management/medicines"

afterEach(() => vi.restoreAllMocks())

describe("Catalog Management APIs", () => {
  describe("Departments API", () => {
    it("fetches departments with default and filter params", async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
        result: "OK",
        code: 200,
        data: {
          items: [
            {
              id: "dept-1",
              code: "KLS",
              name: "Khoa Lâm Sàng",
              departmentType: "CLINICAL",
              active: true,
              rowVersion: 0,
              createdAt: null,
              updatedAt: null,
            },
          ],
          page: 1,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        },
      })

      const res = await fetchDepartments({ q: "KLS", active: true, departmentType: "CLINICAL" })
      expect(res.items).toHaveLength(1)
      expect(res.items[0].code).toBe("KLS")
      expect(getSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/catalog/management/departments?"),
        expect.anything()
      )
      const callUrl = getSpy.mock.calls[0][0]
      expect(callUrl).toContain("searchKey=KLS")
      expect(callUrl).toContain("active=true")
      expect(callUrl).toContain("departmentType=CLINICAL")
    })

    it("fetches one department by ID", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValue({
        result: "OK",
        code: 200,
        data: {
          id: "dept-1",
          code: "KLS",
          name: "Khoa Lâm Sàng",
          departmentType: "CLINICAL",
          active: true,
          rowVersion: 0,
          createdAt: null,
          updatedAt: null,
        },
      })
      const dept = await fetchDepartmentById("dept-1")
      expect(dept.id).toBe("dept-1")
    })

    it("creates department with POST 201", async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
        result: "OK",
        code: 201,
        data: {
          id: "dept-2",
          code: "KCS",
          name: "Khoa Cận Lâm Sàng",
          departmentType: "DIAGNOSTIC",
          active: true,
          rowVersion: 0,
          createdAt: "2026-10-15T00:00:00Z",
          updatedAt: "2026-10-15T00:00:00Z",
        },
      })

      const res = await createDepartment({
        code: "KCS",
        name: "Khoa Cận Lâm Sàng",
        departmentType: "DIAGNOSTIC",
      })
      expect(res.code).toBe("KCS")
      expect(postSpy).toHaveBeenCalledWith(
        "/api/v1/catalog/management/departments",
        expect.objectContaining({ code: "KCS" })
      )
    })

    it("updates department with PUT", async () => {
      const putSpy = vi.spyOn(apiClient, "put").mockResolvedValue({
        result: "OK",
        code: 200,
        data: {
          id: "dept-1",
          code: "KLS",
          name: "Khoa Lâm Sàng Mới",
          departmentType: "CLINICAL",
          active: true,
          rowVersion: 1,
          createdAt: null,
          updatedAt: null,
        },
      })

      const res = await updateDepartment("dept-1", {
        name: "Khoa Lâm Sàng Mới",
        departmentType: "CLINICAL",
        rowVersion: 0,
      })
      expect(res.rowVersion).toBe(1)
      expect(putSpy).toHaveBeenCalledWith(
        "/api/v1/catalog/management/departments/dept-1",
        expect.objectContaining({ name: "Khoa Lâm Sàng Mới", rowVersion: 0 })
      )
    })

    it("deactivates department with DELETE query rowVersion", async () => {
      const delSpy = vi.spyOn(apiClient, "delete").mockResolvedValue({
        result: "OK",
        code: 204,
        data: undefined,
      })

      await deactivateDepartment("dept-1", 1)
      expect(delSpy).toHaveBeenCalledWith("/api/v1/catalog/management/departments/dept-1?rowVersion=1")
    })

    it("reactivates department with POST body rowVersion", async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
        result: "OK",
        code: 200,
        data: {
          id: "dept-1",
          code: "KLS",
          name: "Khoa Lâm Sàng",
          departmentType: "CLINICAL",
          active: true,
          rowVersion: 2,
          createdAt: null,
          updatedAt: null,
        },
      })

      const res = await reactivateDepartment("dept-1", 1)
      expect(res.active).toBe(true)
      expect(postSpy).toHaveBeenCalledWith("/api/v1/catalog/management/departments/dept-1/reactivate", {
        rowVersion: 1,
      })
    })
  })

  describe("Rooms API", () => {
    it("fetches rooms and creates room", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValue({
        result: "OK",
        code: 200,
        data: {
          items: [
            {
              id: "r1",
              code: "P101",
              name: "Phòng 101",
              departmentId: "dept-1",
              departmentName: "Khoa Lâm Sàng",
              roomType: "Khám bệnh",
              active: true,
              rowVersion: 0,
              createdAt: null,
              updatedAt: null,
            },
          ],
          page: 1,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        },
      })

      const res = await fetchRooms({ departmentId: "dept-1" })
      expect(res.items).toHaveLength(1)
      expect(res.items[0].departmentName).toBe("Khoa Lâm Sàng")

      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
        result: "OK",
        code: 201,
        data: {
          id: "r2",
          code: "P102",
          name: "Phòng 102",
          departmentId: "dept-1",
          departmentName: "Khoa Lâm Sàng",
          roomType: "Khám nội",
          active: true,
          rowVersion: 0,
          createdAt: null,
          updatedAt: null,
        },
      })

      const created = await createRoom({
        code: "P102",
        name: "Phòng 102",
        departmentId: "dept-1",
        roomType: "Khám nội",
      })
      expect(created.code).toBe("P102")
      expect(postSpy).toHaveBeenCalledWith(
        "/api/v1/catalog/management/rooms",
        expect.objectContaining({ departmentId: "dept-1" })
      )
    })
  })

  describe("Services API", () => {
    it("fetches managed services with decimal unitPrice preserved as string", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValue({
        result: "OK",
        code: 200,
        data: {
          items: [
            {
              id: "s1",
              code: "DV-01",
              name: "Khám nội chung",
              serviceType: "CONSULTATION",
              performingDepartmentId: "dept-1",
              performingDepartmentName: "Khoa Lâm Sàng",
              specialtyId: null,
              specialtyName: null,
              unitPrice: "150000.50",
              preparationInstruction: null,
              active: true,
              rowVersion: 0,
              createdAt: null,
              updatedAt: null,
            },
          ],
          page: 1,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        },
      })

      const res = await fetchManagedServices({})
      expect(res.items[0].unitPrice).toBe("150000.50")
    })
  })

  describe("Medicines API", () => {
    it("fetches and creates medicines", async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
        result: "OK",
        code: 201,
        data: {
          id: "m1",
          code: "MED-01",
          genericName: "Paracetamol",
          brandName: "Panadol",
          strength: "500mg",
          dosageForm: "Viên nén",
          unit: "Viên",
          active: true,
          rowVersion: 0,
          createdAt: null,
          updatedAt: null,
        },
      })

      const created = await createMedicine({
        code: "MED-01",
        genericName: "Paracetamol",
        brandName: "Panadol",
        strength: "500mg",
        dosageForm: "Viên nén",
        unit: "Viên",
      })
      expect(created.genericName).toBe("Paracetamol")
      expect(postSpy).toHaveBeenCalledWith(
        "/api/v1/catalog/management/medicines",
        expect.objectContaining({ code: "MED-01" })
      )
    })
  })
})
