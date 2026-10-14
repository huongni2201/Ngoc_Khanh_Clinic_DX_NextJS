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
  "roleCodes",
]

/** Vietnamese text for a field the backend rejected; its own message is English and never shown. */
const FIELD_MESSAGES: Record<StaffMemberFormField, string> = {
  fullName: "Họ và tên không hợp lệ",
  dateOfBirth: "Ngày sinh không hợp lệ",
  sex: "Giới tính không hợp lệ",
  phone: "Số điện thoại không hợp lệ",
  email: "Email không hợp lệ",
  initialPassword: "Mật khẩu tạm không hợp lệ (8–72 byte)",
  roleCodes: "Vai trò không hợp lệ",
}

export interface StaffMemberFieldError {
  field: StaffMemberFormField
  message: string
}

/** Fields named by a backend 400, mapped to form fields (`roleCodes[0]` → `roleCodes`). */
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
 * Whether the create failed because a chosen role is no longer available. A 409 on create has this
 * one business rule; the envelope carries no error code, so it is decided from the operation.
 */
export function isUnavailableRoleError(error: unknown) {
  return error instanceof ApiClientError && error.status === 409
}

export function createStaffMemberErrorMessage(error: unknown): string {
  if (isUnavailableRoleError(error)) {
    return "Một hoặc nhiều vai trò không còn khả dụng. Danh sách vai trò đã được tải lại, vui lòng chọn lại."
  }
  if (error instanceof ApiClientError && error.status === 400) {
    return "Thông tin chưa hợp lệ. Vui lòng kiểm tra các trường được đánh dấu."
  }
  return error instanceof Error && error.message ? error.message : "Không thể tạo nhân viên."
}
