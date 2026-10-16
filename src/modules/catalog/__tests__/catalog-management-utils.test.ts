import { describe, expect, it } from "vitest"
import {
  isClinicManager,
  parsePriceInput,
  formatPrice,
  parsePageParam,
  parseSizeParam,
  parseActiveParam,
  catalogErrorMessage,
  formatTimestamp,
  roomTypeLabel,
} from "../utils/management/catalog-management-utils"
import { ApiClientError } from "@/shared/api/api-client"
import type { UserSession } from "@/modules/accesscontrol"

describe("catalog-management-utils", () => {
  it("localizes seeded room types without changing free-text room types", () => {
    expect(roomTypeLabel("EXAMINATION")).toBe("Khám bệnh")
    expect(roomTypeLabel("PARACLINICAL")).toBe("Cận lâm sàng")
    expect(roomTypeLabel("SUPPORT")).toBe("Hỗ trợ")
    expect(roomTypeLabel("Phòng thủ thuật")).toBe("Phòng thủ thuật")
    expect(roomTypeLabel(undefined)).toBe("—")
  })
  describe("isClinicManager", () => {
    it("returns true for STAFF with CLINIC_MANAGER role", () => {
      const session: UserSession = {
        userId: "u1",
        staffId: "s1",
        patientId: null,
        username: "admin_user",
        principalType: "STAFF",
        roleAssignments: [{ roleId: "r-admin", roleCode: "CLINIC_MANAGER", permissions: ["CATALOG_DEPARTMENT_VIEW"] }],
        idleExpiresAt: "2026-10-15T12:00:00Z",
        absoluteExpiresAt: "2026-10-15T20:00:00Z",
      }
      expect(isClinicManager(session)).toBe(true)
    })

    it("returns true for STAFF with multiple roles including CLINIC_MANAGER", () => {
      const session: UserSession = {
        userId: "u2",
        staffId: "s2",
        patientId: null,
        username: "multi_role",
        principalType: "STAFF",
        roleAssignments: [
          { roleId: "r-admin", roleCode: "ADMINISTRATOR", permissions: [] },
          { roleId: "r-admin", roleCode: "CLINIC_MANAGER", permissions: ["CATALOG_DEPARTMENT_VIEW"] },
        ],
        idleExpiresAt: "2026-10-15T12:00:00Z",
        absoluteExpiresAt: "2026-10-15T20:00:00Z",
      }
      expect(isClinicManager(session)).toBe(true)
    })

    it("returns false for STAFF without CLINIC_MANAGER role", () => {
      const session: UserSession = {
        userId: "u3",
        staffId: "s3",
        patientId: null,
        username: "staff_user",
        principalType: "STAFF",
        roleAssignments: [{ roleId: "r-admin", roleCode: "ADMINISTRATOR", permissions: ["CATALOG_DEPARTMENT_VIEW"] }],
        idleExpiresAt: "2026-10-15T12:00:00Z",
        absoluteExpiresAt: "2026-10-15T20:00:00Z",
      }
      expect(isClinicManager(session)).toBe(false)
    })

    it("returns false for PATIENT even if having role CLINIC_MANAGER", () => {
      const session: UserSession = {
        userId: "u4",
        staffId: null,
        patientId: "p1",
        username: "patient_user",
        principalType: "PATIENT",
        roleAssignments: [{ roleId: "r-admin", roleCode: "CLINIC_MANAGER", permissions: [] }],
        idleExpiresAt: "2026-10-15T12:00:00Z",
        absoluteExpiresAt: "2026-10-15T20:00:00Z",
      }
      expect(isClinicManager(session)).toBe(false)
    })

    it("returns false for null or undefined session", () => {
      expect(isClinicManager(null)).toBe(false)
      expect(isClinicManager(undefined)).toBe(false)
    })
  })

  describe("parsePriceInput", () => {
    it("parses valid integer strings", () => {
      expect(parsePriceInput("150000")).toBe("150000")
      expect(parsePriceInput("0")).toBe("0")
    })

    it("parses decimals with dot or comma separator up to 2 decimal places", () => {
      expect(parsePriceInput("150000.50")).toBe("150000.50")
      expect(parsePriceInput("150000,5")).toBe("150000.5")
      expect(parsePriceInput("999999999999.99")).toBe("999999999999.99")
    })

    it("returns null for empty or whitespace-only input", () => {
      expect(parsePriceInput("")).toBeNull()
      expect(parsePriceInput("   ")).toBeNull()
    })

    it("returns null for invalid inputs", () => {
      expect(parsePriceInput("abc")).toBeNull()
      expect(parsePriceInput("150000.555")).toBeNull()
      expect(parsePriceInput("-100")).toBeNull()
    })
  })

  describe("formatPrice", () => {
    it("formats price with Vietnamese locale and đ suffix", () => {
      expect(formatPrice("150000")).toContain("150.000")
      expect(formatPrice("0")).toContain("0")
    })

    it("returns dash for null or undefined", () => {
      expect(formatPrice(null)).toBe("—")
      expect(formatPrice(undefined)).toBe("—")
      expect(formatPrice("")).toBe("—")
    })
  })

  describe("URL param helpers", () => {
    it("parses page numbers safely", () => {
      expect(parsePageParam("1")).toBe(1)
      expect(parsePageParam("5")).toBe(5)
      expect(parsePageParam("0")).toBe(1)
      expect(parsePageParam("-2")).toBe(1)
      expect(parsePageParam("invalid")).toBe(1)
      expect(parsePageParam(null)).toBe(1)
    })

    it("parses page sizes restricting to 10, 20, 50, 100", () => {
      expect(parseSizeParam("10")).toBe(10)
      expect(parseSizeParam("20")).toBe(20)
      expect(parseSizeParam("50")).toBe(50)
      expect(parseSizeParam("100")).toBe(100)
      expect(parseSizeParam("15")).toBe(10)
      expect(parseSizeParam("999")).toBe(10)
      expect(parseSizeParam(null)).toBe(10)
    })

    it("parses active boolean param", () => {
      expect(parseActiveParam("true")).toBe(true)
      expect(parseActiveParam("false")).toBe(false)
      expect(parseActiveParam("all")).toBeNull()
      expect(parseActiveParam(null)).toBeNull()
    })
  })

  describe("formatTimestamp", () => {
    it("returns placeholder for null or undefined timestamp", () => {
      expect(formatTimestamp(null)).toBe("Chưa có thông tin")
      expect(formatTimestamp(undefined)).toBe("Chưa có thông tin")
      expect(formatTimestamp("")).toBe("Chưa có thông tin")
    })

    it("formats valid ISO timestamp", () => {
      const res = formatTimestamp("2026-10-15T08:30:00Z")
      expect(res).not.toBe("Chưa có thông tin")
    })
  })

  describe("catalogErrorMessage", () => {
    it("returns specific message for 404", () => {
      const err = new ApiClientError("Not found", 404, 404)
      expect(catalogErrorMessage(err, "khoa")).toBe("khoa không còn khả dụng.")
    })

    it("returns specific message for 409", () => {
      const err = new ApiClientError("Conflict", 409, 409)
      expect(catalogErrorMessage(err, "phòng")).toBe(
        "Dữ liệu đã thay đổi hoặc không thỏa quy tắc. Vui lòng tải lại và thử lại."
      )
    })

    it("returns specific message for 403", () => {
      const err = new ApiClientError("Forbidden", 403, 403)
      expect(catalogErrorMessage(err, "dịch vụ")).toBe("Bạn không có quyền thực hiện thao tác này.")
    })

    it("falls back to generic error message", () => {
      expect(catalogErrorMessage(new Error("Network failed"), "thuốc")).toBe("Network failed")
      expect(catalogErrorMessage("unknown", "thuốc")).toBe("Không thể thực hiện thao tác với thuốc.")
    })
  })
})
