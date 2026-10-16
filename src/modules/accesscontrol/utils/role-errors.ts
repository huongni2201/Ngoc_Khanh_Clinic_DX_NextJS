import { ApiClientError } from "@/shared/api/api-client"

export type RoleFormField = "name" | "code" | "description"

const FORM_FIELDS: readonly RoleFormField[] = ["name", "code", "description"]

/** Vietnamese text for a field the backend rejected; its own message is English and never shown. */
const INVALID_MESSAGES: Record<RoleFormField, string> = {
  name: "Tên vai trò không hợp lệ",
  code: "Mã vai trò chỉ gồm chữ in hoa, chữ số và dấu gạch dưới, bắt đầu bằng chữ cái",
  description: "Mô tả không hợp lệ",
}

const DUPLICATE_MESSAGES: Record<RoleFormField, string> = {
  name: "Tên vai trò đã tồn tại",
  code: "Mã vai trò đã tồn tại",
  description: "Mô tả không hợp lệ",
}

export interface RoleFieldError {
  field: RoleFormField
  message: string
}

/**
 * Fields named by a backend 400 (Bean Validation) or 409 (`Duplicate`: the code or the name is used
 * by another role, docs/api/roles-and-permissions.md), mapped to form fields.
 */
export function roleFieldErrors(error: unknown): RoleFieldError[] {
  if (!(error instanceof ApiClientError) || (error.status !== 400 && error.status !== 409)) return []
  const errors = new Map<RoleFormField, string>()
  for (const fieldError of error.fieldErrors) {
    const field = fieldError.field.split(/[.[]/)[0] as RoleFormField
    if (!FORM_FIELDS.includes(field)) continue
    errors.set(
      field,
      fieldError.code === "Duplicate" ? DUPLICATE_MESSAGES[field] : INVALID_MESSAGES[field]
    )
  }
  return [...errors].map(([field, message]) => ({ field, message }))
}

/**
 * A 409 that names no field: the role was changed by another user since it was read, or the change
 * would deactivate the Administrator role.
 */
export function isRoleVersionConflict(error: unknown) {
  return error instanceof ApiClientError && error.status === 409 && error.fieldErrors.length === 0
}

/**
 * Vietnamese text of a failed create or update. A 409 without a field means different things: on
 * create, a role with the same code or name was saved at the same moment; on update, the role was
 * changed by another user or the change is not allowed.
 */
export function roleFormErrorMessage(error: unknown, mode: "create" | "edit"): string {
  if (roleFieldErrors(error).length > 0) {
    return "Thông tin chưa hợp lệ. Vui lòng kiểm tra các trường được đánh dấu."
  }
  if (isRoleVersionConflict(error) && mode === "create") {
    return "Mã hoặc tên vai trò vừa trùng với một vai trò khác. Vui lòng kiểm tra lại rồi tạo lại."
  }
  if (isRoleVersionConflict(error)) {
    return "Vai trò vừa được người khác thay đổi hoặc thay đổi này không được phép. Tải lại để xem dữ liệu mới nhất."
  }
  if (error instanceof ApiClientError && error.status === 422) {
    return "Vai trò dùng để sao chép quyền không còn hoạt động. Vui lòng chọn lại."
  }
  if (error instanceof ApiClientError && error.status === 404) {
    return "Vai trò không còn tồn tại. Vui lòng tải lại danh sách."
  }
  return error instanceof Error && error.message ? error.message : "Không thể lưu vai trò."
}

export function rolePermissionsErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError && error.status === 409) {
    return "Quyền của vai trò vừa được người khác thay đổi hoặc thay đổi này không được phép. Tải lại để xem dữ liệu mới nhất; các thay đổi chưa lưu vẫn được giữ."
  }
  if (error instanceof ApiClientError && error.status === 422) {
    return "Vai trò đã ngừng hoạt động hoặc có quyền không còn tồn tại. Tải lại để xem dữ liệu mới nhất."
  }
  return error instanceof Error && error.message ? error.message : "Không thể lưu quyền của vai trò."
}
