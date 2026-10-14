import type { StatusTone } from "@/shared/ui"
import type { RoleOption, StaffAccountStatus, StaffMemberSex, StaffMemberStatus } from "../types/staff-member"

export const STAFF_MEMBER_SEX_LABELS: Record<StaffMemberSex, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
  UNKNOWN: "Chưa xác định",
}

export const STAFF_MEMBER_STATUS_PRESENTATION: Record<
  StaffMemberStatus,
  { label: string; tone: StatusTone }
> = {
  ACTIVE: { label: "Đang làm việc", tone: "success" },
  INACTIVE: { label: "Ngừng làm việc", tone: "neutral" },
  SUSPENDED: { label: "Tạm đình chỉ", tone: "warning" },
}

export const STAFF_ACCOUNT_STATUS_PRESENTATION: Record<
  StaffAccountStatus,
  { label: string; tone: StatusTone }
> = {
  ACTIVE: { label: "Hoạt động", tone: "success" },
  LOCKED: { label: "Đã khóa", tone: "danger" },
  DISABLED: { label: "Vô hiệu hóa", tone: "neutral" },
}

/** Vietnamese names of the roles seeded by V002 and the local TEST role. */
const ROLE_LABELS: Record<string, string> = {
  RECEPTIONIST: "Lễ tân",
  GENERAL_PRACTITIONER: "Bác sĩ đa khoa",
  DIAGNOSTIC_DOCTOR: "Bác sĩ chẩn đoán",
  DATA_ENTRY_STAFF: "Nhân viên nhập liệu",
  CLINIC_MANAGER: "Quản lý phòng khám",
  ADMINISTRATOR: "Quản trị viên",
  PATIENT: "Bệnh nhân",
  TEST: "Kiểm thử (local)",
}

/**
 * Vietnamese label of a role code. A role added later by the backend falls back to its English
 * name, then to its code, so it is never hidden.
 */
export function roleLabel(code: string, role?: Pick<RoleOption, "name">) {
  return ROLE_LABELS[code] ?? (role?.name || code)
}
