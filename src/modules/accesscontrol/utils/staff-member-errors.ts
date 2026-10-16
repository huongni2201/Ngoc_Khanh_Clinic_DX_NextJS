import { ApiClientError } from "@/shared/api/api-client"
import type { CreateStaffMemberFormValues } from "../schemas/staff-member.schema"

type StaffMemberFormField = keyof CreateStaffMemberFormValues

const FORM_FIELDS: readonly StaffMemberFormField[] = [
  "fullName",
  "dateOfBirth",
  "sex",
  "phone",
  "email",
  "initialPassword",
  "roleCode",
]

/** Vietnamese text for a field the backend rejected; its own message is English and never shown. */
const FIELD_MESSAGES: Record<StaffMemberFormField, string> = {
  fullName: "Họ và tên chỉ gồm chữ cái tiếng Việt, dấu cách, dấu chấm, dấu nháy hoặc gạch nối",
  dateOfBirth: "Ngày sinh không hợp lệ",
  sex: "Giới tính không hợp lệ",
  phone: "Số điện thoại không hợp lệ",
  email: "Thư điện tử không hợp lệ",
  initialPassword: "Mật khẩu tạm không hợp lệ (8–72 ký tự không dấu, không dấu cách)",
  roleCode: "Vai trò không hợp lệ",
}

export interface StaffMemberFieldError {
  field: StaffMemberFormField
  message: string
}

/** Fields named by a backend 400, mapped to form fields by the root of their JSON path. */
export function staffMemberFieldErrors(error: unknown): StaffMemberFieldError[] {
  if (!(error instanceof ApiClientError) || error.status !== 400) return []
  const fields = new Set<StaffMemberFormField>()
  for (const fieldError of error.fieldErrors) {
    const root = fieldError.field.split(/[.[]/)[0] as StaffMemberFormField
    if (FORM_FIELDS.includes(root)) fields.add(root)
  }
  return [...fields].map((field) => ({ field, message: FIELD_MESSAGES[field] }))
}

/**
 * Whether the create failed because the chosen role is unknown, inactive or `PATIENT`: the backend
 * answers 422 (docs/api/staff-members.md).
 */
export function isUnavailableRoleError(error: unknown) {
  return error instanceof ApiClientError && error.status === 422
}

/**
 * Whether a generated staff code or username collided with a row created at the same time (for
 * example by SQL): the backend answers 409. Submitting again generates new values.
 */
export function isDuplicateIdentityError(error: unknown) {
  return error instanceof ApiClientError && error.status === 409
}

export function createStaffMemberErrorMessage(error: unknown): string {
  if (isUnavailableRoleError(error)) {
    return "Vai trò đã chọn không còn khả dụng. Danh sách vai trò đã được tải lại, vui lòng chọn lại."
  }
  if (isDuplicateIdentityError(error)) {
    return "Mã nhân viên hoặc tên đăng nhập vừa bị trùng với dữ liệu khác. Vui lòng bấm Tạo nhân viên lại."
  }
  if (error instanceof ApiClientError && error.status === 400) {
    return "Thông tin chưa hợp lệ. Vui lòng kiểm tra các trường được đánh dấu."
  }
  return error instanceof Error && error.message ? error.message : "Không thể tạo nhân viên."
}
