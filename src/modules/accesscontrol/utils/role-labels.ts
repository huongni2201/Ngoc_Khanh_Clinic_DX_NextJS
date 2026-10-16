import type { StatusTone } from "@/shared/ui"
import type { RoleSummary } from "../types/role"

/** Vietnamese names of the roles seeded by V002 and the local TEST role. */
export const ROLE_LABELS: Record<string, string> = {
  RECEPTIONIST: "Lễ tân",
  GENERAL_PRACTITIONER: "Bác sĩ đa khoa",
  DIAGNOSTIC_DOCTOR: "Bác sĩ chẩn đoán",
  NURSE: "Điều dưỡng",
  CLINIC_MANAGER: "Quản lý phòng khám",
  ADMINISTRATOR: "Quản trị viên",
  PATIENT: "Bệnh nhân",
  TEST: "Kiểm thử nội bộ",
}

export const ROLE_ACTIVE_PRESENTATION: Record<
  "ACTIVE" | "INACTIVE",
  { label: string; tone: StatusTone }
> = {
  ACTIVE: { label: "Hoạt động", tone: "success" },
  INACTIVE: { label: "Ngừng hoạt động", tone: "neutral" },
}

/** Values of the Status filter on the Role List (SRS 1.3.1 [2]). */
export const ROLE_STATUS_FILTER_ITEMS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Ngừng hoạt động" },
] as const

/**
 * English name and description the backend seeds for each role (V002 and the local seed), with the
 * Vietnamese description shown instead. The Vietnamese names are `ROLE_LABELS`.
 */
const SEEDED_ROLES: Record<string, { name: string; description: string; vietnameseDescription: string }> = {
  PATIENT: {
    name: "Patient",
    description:
      "Patient account using the portal for own examinations, reports, prescriptions, appointments and contact details.",
    vietnameseDescription:
      "Tài khoản bệnh nhân dùng cổng thông tin để xem lần khám, kết quả, đơn thuốc, lịch hẹn và cập nhật thông tin liên hệ.",
  },
  RECEPTIONIST: {
    name: "Receptionist",
    description:
      "Registers patients, receives outpatients, manages appointments and collects payments.",
    vietnameseDescription:
      "Đăng ký bệnh nhân, tiếp nhận bệnh nhân ngoại trú, quản lý lịch hẹn và thu phí.",
  },
  GENERAL_PRACTITIONER: {
    name: "General Practitioner",
    description:
      "Examines outpatients, orders diagnostic services and records diagnoses, conclusions and prescriptions.",
    vietnameseDescription:
      "Khám bệnh nhân ngoại trú, chỉ định cận lâm sàng, ghi chẩn đoán, kết luận và kê đơn thuốc.",
  },
  DIAGNOSTIC_DOCTOR: {
    name: "Diagnostic Doctor",
    description:
      "Performs diagnostic services and records, finalizes, amends and prints diagnostic results.",
    vietnameseDescription:
      "Thực hiện dịch vụ cận lâm sàng; ghi, chốt, sửa và in kết quả cận lâm sàng.",
  },
  NURSE: {
    name: "Nurse",
    description:
      "Prepares participant examination records, enters batch examination data and issues completed records.",
    vietnameseDescription:
      "Chuẩn bị hồ sơ khám của người khám, nhập dữ liệu khám theo đợt và phát hành hồ sơ đã hoàn tất.",
  },
  CLINIC_MANAGER: {
    name: "Clinic Manager",
    description:
      "Manages organizations, health examination batches, participants, clinic master data and operational reports.",
    vietnameseDescription:
      "Quản lý đơn vị, đợt khám sức khỏe, người khám, danh mục phòng khám và báo cáo vận hành.",
  },
  ADMINISTRATOR: {
    name: "Administrator",
    description:
      "Manages user accounts, roles and permissions, reviews audit logs and submits national health data.",
    vietnameseDescription:
      "Quản lý tài khoản, vai trò và phân quyền, xem nhật ký hệ thống và gửi dữ liệu y tế quốc gia.",
  },
  TEST: {
    name: "Local API Test",
    description: "Local-only staff role with every permission for API testing.",
    vietnameseDescription: "Vai trò nội bộ có mọi quyền, chỉ dùng để kiểm thử.",
  },
}

/**
 * Vietnamese name of a role. A seeded role still carrying its English seed name shows the Vietnamese
 * label; a name an administrator typed is shown as stored.
 */
export function roleDisplayName(role: Pick<RoleSummary, "code" | "name">) {
  const seeded = SEEDED_ROLES[role.code]
  return seeded && role.name === seeded.name ? (ROLE_LABELS[role.code] ?? role.name) : role.name
}

/**
 * Whether another role already uses the name, as shown on screen or as stored, ignoring case. The
 * backend only compares stored names, so it cannot see that "Lễ tân" is the label of RECEPTIONIST.
 */
export function isRoleNameTaken(
  name: string,
  roles: readonly Pick<RoleSummary, "id" | "code" | "name">[],
  exceptRoleId?: string
) {
  const wanted = name.trim().toLocaleLowerCase("vi")
  return roles.some(
    (role) =>
      role.id !== exceptRoleId &&
      [roleDisplayName(role), role.name].some(
        (candidate) => candidate.trim().toLocaleLowerCase("vi") === wanted
      )
  )
}

/** Roles ordered by the Vietnamese name shown on screen, the order of every role list and selector. */
export function sortRolesByDisplayName<T extends Pick<RoleSummary, "code" | "name">>(
  roles: readonly T[]
): T[] {
  return roles
    .map((role) => ({ role, name: roleDisplayName(role) }))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"))
    .map(({ role }) => role)
}

export interface RoleListView {
  items: RoleSummary[]
  total: number
  page: number
  totalPages: number
}

/**
 * One page of the Role List, searched on the Vietnamese name shown on screen, filtered by status
 * and ordered by that name. The backend stores the English seed names, so the search runs here on
 * the whole list, which stays small (owner decision 2026-10-15).
 */
export function selectRolePage(
  roles: readonly RoleSummary[],
  options: { search: string; status?: "ACTIVE" | "INACTIVE"; page: number; pageSize: number }
): RoleListView {
  const keyword = options.search.trim().toLocaleLowerCase("vi")
  const matching = sortRolesByDisplayName(roles)
    .filter((role) => options.status === undefined || role.active === (options.status === "ACTIVE"))
    .filter((role) => !keyword || roleDisplayName(role).toLocaleLowerCase("vi").includes(keyword))
  const totalPages = Math.max(1, Math.ceil(matching.length / options.pageSize))
  const page = Math.min(Math.max(1, options.page), totalPages)
  const start = (page - 1) * options.pageSize
  return {
    items: matching.slice(start, start + options.pageSize),
    total: matching.length,
    page,
    totalPages,
  }
}

/** Vietnamese description of a role, translated the same way as its name. */
export function roleDisplayDescription(role: Pick<RoleSummary, "code" | "description">) {
  const seeded = SEEDED_ROLES[role.code]
  return seeded && role.description === seeded.description
    ? seeded.vietnameseDescription
    : role.description
}
