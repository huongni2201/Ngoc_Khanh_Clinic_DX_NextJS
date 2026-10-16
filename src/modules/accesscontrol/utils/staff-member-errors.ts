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
  email: "Email không hợp lệ",
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

/** Detail code of the 409 returned when the last Administrator account would lose its role. */
const LAST_ADMINISTRATOR = "LastAdministrator"
/** Detail code of the 422 for an account that is no longer an active staff account. */
const INACTIVE_ACCOUNT = "InactiveAccount"

/** Whether the role change would leave no account able to administer the system (MSG12). */
export function isLastAdministratorError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    error.status === 409 &&
    error.fieldErrors.some((fieldError) => fieldError.code === LAST_ADMINISTRATOR)
  )
}

/**
 * Vietnamese text of a failed role change (SRS UC-010, docs/api/staff-members.md): the role was
 * deactivated meanwhile (MSG11), the account is the last Administrator (MSG12) or another user
 * changed the account first (MSG13).
 */
export function changeRoleErrorMessage(
  error: unknown,
  context: { username: string; roleName: string }
): string {
  if (isLastAdministratorError(error)) {
    return `${context.username} là tài khoản Quản trị viên duy nhất đang hoạt động. Hãy gán vai trò Quản trị viên cho tài khoản khác trước khi đổi vai trò này.`
  }
  if (error instanceof ApiClientError && error.status === 409) {
    return `Vai trò của ${context.username} vừa được người khác thay đổi. Vui lòng tải lại để xem dữ liệu mới nhất.`
  }
  if (error instanceof ApiClientError && error.status === 422) {
    return error.fieldErrors.some((fieldError) => fieldError.code === INACTIVE_ACCOUNT)
      ? "Tài khoản không còn hoạt động nên không thể đổi vai trò. Vui lòng tải lại danh sách."
      : `Vai trò ${context.roleName} không còn hoạt động. Vui lòng chọn vai trò khác.`
  }
  if (error instanceof ApiClientError && error.status === 404) {
    return "Tài khoản không còn tồn tại. Vui lòng tải lại danh sách."
  }
  return error instanceof Error && error.message ? error.message : "Không thể đổi vai trò."
}
