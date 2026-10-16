import type { StatusTone } from "@/shared/ui"
import { ROLE_LABELS, roleDisplayName } from "./role-labels"
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

/**
 * Name of a role as the Role List shows it. With the stored name, a seeded role still carrying its
 * English seed name shows its Vietnamese label and a renamed role shows its new name. Without it,
 * a seeded code shows its Vietnamese label and any other code shows the code, so it is never hidden.
 */
export function roleLabel(code: string, role?: Pick<RoleOption, "name">) {
  if (role?.name) return roleDisplayName({ code, name: role.name })
  return ROLE_LABELS[code] ?? code
}
