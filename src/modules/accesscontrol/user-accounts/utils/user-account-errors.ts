import { ApiClientError } from "@/shared/api/api-client"

/** Where the page shows a failed create, so the user can fix the right step. */
export type CreateUserAccountFailureKind =
  | "username-taken"
  | "owner-linked"
  | "owner-inactive"
  | "owner-without-mobile"
  | "owner-not-found"
  | "role-not-assignable"
  | "invalid"
  | "forbidden"
  | "unauthenticated"
  | "network"
  | "unknown"

export interface CreateUserAccountFailure {
  kind: CreateUserAccountFailureKind
  /** Vietnamese guidance; the English backend text is never shown. */
  message: string
}

/**
 * The envelope has no business code, so the fixed English messages of the backend contract
 * (docs/api/user-accounts.md) are matched exactly. An unknown 409 keeps a neutral text.
 */
const CONFLICT_RULES: Array<{ text: string; kind: CreateUserAccountFailureKind; message: string }> =
  [
    {
      text: "Username already exists",
      kind: "username-taken",
      message: "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.",
    },
    {
      text: "Account owner already has an account",
      kind: "owner-linked",
      message: "Hồ sơ này đã có tài khoản. Vui lòng tìm và chọn hồ sơ khác.",
    },
    {
      text: "Account owner is not active",
      kind: "owner-inactive",
      message: "Hồ sơ này không còn hoạt động nên không thể cấp tài khoản.",
    },
    {
      text: "Account owner has no valid mobile phone number",
      kind: "owner-without-mobile",
      message:
        "Hồ sơ chưa có số di động hợp lệ để nhận SMS. Vui lòng cập nhật số điện thoại trong hồ sơ trước.",
    },
    {
      text: "Role is not assignable",
      kind: "role-not-assignable",
      message: "Có vai trò không còn được phép gán. Danh sách vai trò đã được tải lại.",
    },
  ]

export function describeCreateUserAccountError(error: unknown): CreateUserAccountFailure {
  if (!(error instanceof ApiClientError)) {
    return { kind: "unknown", message: "Không thể tạo tài khoản. Vui lòng thử lại." }
  }
  switch (error.status) {
    case 0:
      return { kind: "network", message: "Không thể kết nối máy chủ. Vui lòng thử lại." }
    case 400:
      return {
        kind: "invalid",
        message: "Thông tin tài khoản không hợp lệ. Vui lòng kiểm tra lại các trường.",
      }
    case 401:
      return {
        kind: "unauthenticated",
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
      }
    case 403:
      return { kind: "forbidden", message: "Bạn không có quyền tạo tài khoản người dùng." }
    case 404:
      return {
        kind: "owner-not-found",
        message: "Không tìm thấy hồ sơ chủ tài khoản. Vui lòng tìm lại.",
      }
    case 409: {
      const rule = CONFLICT_RULES.find((entry) => entry.text === error.serverMessage)
      if (rule) return { kind: rule.kind, message: rule.message }
      return {
        kind: "unknown",
        message: "Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ. Vui lòng tải lại.",
      }
    }
    default:
      return {
        kind: "unknown",
        message:
          error.status >= 500
            ? "Máy chủ gặp lỗi. Vui lòng thử lại sau."
            : "Không thể tạo tài khoản. Vui lòng thử lại.",
      }
  }
}
