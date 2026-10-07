import { ApiClientError } from "@/shared/api/api-client"

/** What the form should do after a failed add, edit, cancel or reactivate. */
export type ParticipantWriteFailureKind =
  | "duplicate-identity"
  | "stale-version"
  | "identity-locked"
  | "cancelled"
  | "cannot-cancel"
  | "not-cancelled"
  | "reactivate-blocked"
  | "closed-batch"
  | "invalid-day"
  | "forbidden"
  | "not-found"
  | "unauthenticated"
  | "network"
  | "invalid"
  | "unknown"

export interface ParticipantWriteFailure {
  kind: ParticipantWriteFailureKind
  /** Vietnamese guidance; the English backend text is never shown. */
  message: string
}

/**
 * The 409 envelope has no business code, so the safe English message is matched exactly. Any
 * unknown 409 keeps a neutral Vietnamese text.
 */
const CONFLICT_RULES: Array<{
  text: string
  kind: ParticipantWriteFailureKind
  message: string
}> = [
  {
    text: "Participant identity already exists in this batch",
    kind: "duplicate-identity",
    message: "CCCD này đã có trong đợt khám (kể cả người khám đã bị hủy).",
  },
  {
    text: "Record was changed by another request",
    kind: "stale-version",
    message: "Dữ liệu đã thay đổi. Đã tải lại thông tin mới nhất, vui lòng kiểm tra rồi lưu lại.",
  },
  {
    text: "Identification number is locked after visit preparation",
    kind: "identity-locked",
    message: "Không thể đổi CCCD sau khi người khám đã được chuẩn bị lượt khám.",
  },
  {
    text: "Participant is cancelled",
    kind: "cancelled",
    message: "Người khám này đã bị hủy nên không thể thay đổi.",
  },
  {
    text: "Participant cannot be cancelled after preparation or attendance",
    kind: "cannot-cancel",
    message: "Không thể hủy người khám đã được chuẩn bị lượt khám, đã đến khám hoặc đã đối soát.",
  },
  {
    text: "Participant is not cancelled",
    kind: "not-cancelled",
    message:
      "Người khám này không còn ở trạng thái Đã hủy (có thể đã được khôi phục). Danh sách đã được tải lại.",
  },
  {
    text: "Participant cannot be reactivated after preparation or attendance",
    kind: "reactivate-blocked",
    message:
      "Không thể khôi phục người khám đã được chuẩn bị lượt khám, đã đến khám hoặc đã đối soát.",
  },
  {
    text: "Batch does not accept Participant changes",
    kind: "closed-batch",
    message:
      "Đợt khám hoặc đơn vị không còn nhận thay đổi người khám (chỉ đợt Nháp/Sẵn sàng của đơn vị đang hoạt động).",
  },
  {
    text: "Examination day is not a day of this batch",
    kind: "invalid-day",
    message: "Ngày khám đã chọn không thuộc đợt khám này.",
  },
]

export function describeParticipantWriteError(
  error: unknown,
  action: "create" | "update" | "cancel" | "reactivate" | "read" = "update"
): ParticipantWriteFailure {
  if (!(error instanceof ApiClientError)) {
    return { kind: "unknown", message: "Không thể thực hiện thao tác. Vui lòng thử lại." }
  }
  switch (error.status) {
    case 0:
      return { kind: "network", message: "Không thể kết nối máy chủ. Vui lòng thử lại." }
    case 400:
      return {
        kind: "invalid",
        message: "Thông tin gửi lên không hợp lệ. Vui lòng kiểm tra lại các trường.",
      }
    case 401:
      return {
        kind: "unauthenticated",
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
      }
    case 403:
      return {
        kind: "forbidden",
        message:
          action === "read"
            ? "Bạn không có quyền xem đầy đủ thông tin người khám."
            : action === "reactivate"
              ? "Bạn không có quyền khôi phục người khám."
              : "Bạn không có quyền thêm, sửa hoặc hủy người khám.",
      }
    case 404:
      return {
        kind: "not-found",
        message: "Không tìm thấy người khám hoặc đợt khám. Có thể đã bị xóa hoặc ngừng hoạt động.",
      }
    case 409: {
      const text = error.serverMessage ?? ""
      const rule = CONFLICT_RULES.find((candidate) => candidate.text === text)
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
            : "Không thể thực hiện thao tác. Vui lòng thử lại.",
      }
  }
}
