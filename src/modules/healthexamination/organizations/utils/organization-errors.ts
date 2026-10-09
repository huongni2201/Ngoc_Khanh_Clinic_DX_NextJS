import { ApiClientError } from "@/shared/api/api-client"

/**
 * Creating an organization has one business rule, so a 409 can only mean the tax code is taken. The
 * backend envelope carries no error code, so this is decided from the operation, not the text.
 */
export function createOrganizationErrorMessage(error: Error): string {
  if (error instanceof ApiClientError && error.status === 409) {
    return "Mã số thuế đã tồn tại. Vui lòng nhập mã khác."
  }
  return error.message || "Không thể tạo đơn vị."
}
