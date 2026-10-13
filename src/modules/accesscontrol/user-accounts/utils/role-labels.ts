import type { AssignableRole } from "../types"

/** Role granted automatically to every PATIENT account. */
export const PATIENT_ROLE_CODE = "PATIENT"

interface RoleLabel {
  label: string
  summary: string
}

/** Vietnamese copy for the seeded role codes; unknown roles fall back to the backend name. */
const ROLE_LABELS: Record<string, RoleLabel> = {
  RECEPTIONIST: { label: "Lễ tân", summary: "Tiếp đón, thu phí, quản lý lịch hẹn" },
  GENERAL_PRACTITIONER: { label: "Bác sĩ đa khoa", summary: "Khám, chỉ định dịch vụ, kê đơn" },
  DIAGNOSTIC_DOCTOR: {
    label: "Bác sĩ chẩn đoán",
    summary: "Thực hiện và trả kết quả cận lâm sàng",
  },
  NURSE: { label: "Điều dưỡng", summary: "Chuẩn bị hồ sơ, nhập dữ liệu khám sức khỏe đơn vị" },
  CLINIC_MANAGER: { label: "Quản lý phòng khám", summary: "Đơn vị, đợt khám, danh mục, báo cáo" },
  ADMINISTRATOR: { label: "Quản trị viên", summary: "Tài khoản, vai trò và phân quyền" },
  [PATIENT_ROLE_CODE]: { label: "Bệnh nhân", summary: "Cổng bệnh nhân: xem kết quả, đơn thuốc" },
}

export function roleLabel(code: string, fallbackName?: string): string {
  return ROLE_LABELS[code]?.label ?? fallbackName ?? code
}

export function roleSummary(role: AssignableRole): string | undefined {
  return ROLE_LABELS[role.code]?.summary ?? role.description
}
