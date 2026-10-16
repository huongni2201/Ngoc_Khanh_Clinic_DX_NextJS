import { PERMISSION } from "@/modules/accesscontrol"
import type { DepartmentType, ServiceType } from "../../types/management"
import type { UserSession } from "@/modules/accesscontrol"

// ─── Permission codes ────────────────────────────────────────────────────────

export const CATALOG_PERMISSIONS = {
  DEPARTMENT_VIEW: PERMISSION.CATALOG_DEPARTMENT_VIEW,
  DEPARTMENT_DETAIL_VIEW: PERMISSION.CATALOG_DEPARTMENT_DETAIL_VIEW,
  DEPARTMENT_CREATE: PERMISSION.CATALOG_DEPARTMENT_CREATE,
  DEPARTMENT_UPDATE: PERMISSION.CATALOG_DEPARTMENT_UPDATE,
  DEPARTMENT_DEACTIVATE: PERMISSION.CATALOG_DEPARTMENT_DEACTIVATE,
  DEPARTMENT_REACTIVATE: PERMISSION.CATALOG_DEPARTMENT_REACTIVATE,

  ROOM_VIEW: PERMISSION.CATALOG_ROOM_VIEW,
  ROOM_DETAIL_VIEW: PERMISSION.CATALOG_ROOM_DETAIL_VIEW,
  ROOM_CREATE: PERMISSION.CATALOG_ROOM_CREATE,
  ROOM_UPDATE: PERMISSION.CATALOG_ROOM_UPDATE,
  ROOM_DEACTIVATE: PERMISSION.CATALOG_ROOM_DEACTIVATE,
  ROOM_REACTIVATE: PERMISSION.CATALOG_ROOM_REACTIVATE,

  SPECIALTY_VIEW: PERMISSION.CATALOG_SPECIALTY_VIEW,
  SPECIALTY_DETAIL_VIEW: PERMISSION.CATALOG_SPECIALTY_DETAIL_VIEW,
  SPECIALTY_CREATE: PERMISSION.CATALOG_SPECIALTY_CREATE,
  SPECIALTY_UPDATE: PERMISSION.CATALOG_SPECIALTY_UPDATE,
  SPECIALTY_DEACTIVATE: PERMISSION.CATALOG_SPECIALTY_DEACTIVATE,
  SPECIALTY_REACTIVATE: PERMISSION.CATALOG_SPECIALTY_REACTIVATE,

  SERVICE_VIEW: PERMISSION.CATALOG_SERVICE_VIEW,
  SERVICE_DETAIL_VIEW: PERMISSION.CATALOG_SERVICE_DETAIL_VIEW,
  SERVICE_CREATE: PERMISSION.CATALOG_SERVICE_CREATE,
  SERVICE_UPDATE: PERMISSION.CATALOG_SERVICE_UPDATE,
  SERVICE_DEACTIVATE: PERMISSION.CATALOG_SERVICE_DEACTIVATE,
  SERVICE_REACTIVATE: PERMISSION.CATALOG_SERVICE_REACTIVATE,

  MEDICINE_VIEW: PERMISSION.CATALOG_MEDICINE_VIEW,
  MEDICINE_DETAIL_VIEW: PERMISSION.CATALOG_MEDICINE_DETAIL_VIEW,
  MEDICINE_CREATE: PERMISSION.CATALOG_MEDICINE_CREATE,
  MEDICINE_UPDATE: PERMISSION.CATALOG_MEDICINE_UPDATE,
  MEDICINE_DEACTIVATE: PERMISSION.CATALOG_MEDICINE_DEACTIVATE,
  MEDICINE_REACTIVATE: PERMISSION.CATALOG_MEDICINE_REACTIVATE,
} as const

// ─── Labels ──────────────────────────────────────────────────────────────────

export const DEPARTMENT_TYPE_LABELS: Record<DepartmentType, string> = {
  CLINICAL: "Lâm sàng",
  DIAGNOSTIC: "Cận lâm sàng",
  ADMINISTRATIVE: "Hành chính",
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  CONSULTATION: "Khám",
  LAB: "Xét nghiệm",
  ULTRASOUND: "Siêu âm",
  XRAY: "X-quang",
  ECG: "Điện tim",
  OTHER: "Khác",
}

/** Localize seeded room types; free-text values entered by the clinic stay unchanged. */
export function roomTypeLabel(value: string | null | undefined): string {
  if (!value) return "—"
  if (value === "EXAMINATION") return "Khám bệnh"
  if (value === "PARACLINICAL") return "Cận lâm sàng"
  if (value === "SUPPORT") return "Hỗ trợ"
  return value
}

// ─── Catalog workspace access ────────────────────────────────────────────────

export { isClinicManager } from "@/modules/accesscontrol"

/** TEST is seeded locally for exercising every granted backend permission. */
export function canAccessCatalogManagement(session: UserSession | null | undefined): boolean {
  return session?.principalType === "STAFF" && session.roleAssignments.some((assignment) =>
    assignment.roleCode === "CLINIC_MANAGER" || assignment.roleCode === "TEST",
  )
}

// ─── Price helpers ───────────────────────────────────────────────────────────

/**
 * Format a decimal price string for display in vi-VN locale.
 * Preserves up to 2 decimal places, no rounding of stored data.
 */
export function formatPrice(value: string | null | undefined): string {
  if (value == null || value === "") return "—"
  const n = parseFloat(value)
  if (isNaN(n)) return value
  return n.toLocaleString("vi-VN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " đ"
}

/**
 * Parse a user-typed price string to a decimal string suitable for API payload.
 * Returns null if blank (meaning "clear"), returns the normalized string if valid.
 * Never uses float arithmetic.
 */
export function parsePriceInput(input: string): string | null {
  const trimmed = input.trim().replace(/\s/g, "")
  if (trimmed === "") return null
  // Accept digits and at most one decimal separator
  const normalized = trimmed.replace(/,/g, ".")
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null
  return normalized
}

// ─── Timestamp display ───────────────────────────────────────────────────────

export function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "Chưa có thông tin"
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value))
  } catch {
    return value
  }
}

// ─── URL param helpers ───────────────────────────────────────────────────────

export const VALID_PAGE_SIZES = [10, 20, 50, 100] as const
export type ValidPageSize = (typeof VALID_PAGE_SIZES)[number]

export function parsePageParam(raw: string | null): number {
  const n = Number(raw)
  return Number.isSafeInteger(n) && n > 0 ? n : 1
}

export function parseSizeParam(raw: string | null): ValidPageSize {
  const n = Number(raw) as ValidPageSize
  return VALID_PAGE_SIZES.includes(n) ? n : 10
}

export function parseActiveParam(raw: string | null): boolean | null {
  if (raw === "true") return true
  if (raw === "false") return false
  return null
}

// ─── Error messages ──────────────────────────────────────────────────────────

import { ApiClientError } from "@/shared/api/api-client"

export function catalogErrorMessage(error: unknown, context: string): string {
  if (error instanceof ApiClientError) {
    if (error.status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
    if (error.status === 404) return `${context} không còn khả dụng.`
    if (error.status === 409) return `Dữ liệu đã thay đổi hoặc không thỏa quy tắc. Vui lòng tải lại và thử lại.`
    if (error.status === 403) return "Bạn không có quyền thực hiện thao tác này."
    return error.message
  }
  if (error instanceof Error) return error.message
  return `Không thể thực hiện thao tác với ${context}.`
}
