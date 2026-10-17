import { ApiClientError } from "@/shared/api/api-client"

export type SchedulingAction =
  | "create-session"
  | "update-session"
  | "cancel-session"
  | "assign"
  | "move"
  | "move-all"
  | "cancel-assignment"
  | "attendance"

export interface SchedulingFailure {
  kind: "stale" | "conflict" | "forbidden" | "not-found" | "invalid" | "network" | "other"
  /** Vietnamese text for the user; the backend's English message is never shown. */
  message: string
}

const ACTION_VERBS: Record<SchedulingAction, string> = {
  "create-session": "tạo lịch khám",
  "update-session": "cập nhật lịch khám",
  "cancel-session": "hủy lịch khám",
  assign: "xếp lịch cho người khám",
  move: "đổi lịch khám",
  "move-all": "dời cả lịch khám",
  "cancel-assignment": "hủy phân lịch",
  attendance: "ghi nhận đến khám",
}

const CONFLICT_MESSAGES: Partial<Record<SchedulingAction, string>> = {
  "create-session":
    "Đã có lịch khám đang mở cùng ngày, địa điểm và loại hoạt động. Hãy mở lịch đó hoặc đổi thông tin.",
  "update-session":
    "Không cập nhật được: đã có lịch khám đang mở cùng ngày, địa điểm và loại hoạt động, hoặc lịch này đã bị hủy.",
  "cancel-session":
    "Lịch khám còn người được xếp. Hãy chuyển họ sang lịch khác hoặc hủy phân lịch trước khi hủy lịch.",
  assign:
    "Không xếp lịch được: người khám đã bị hủy, thỏa thuận đã kết thúc, hoặc lịch khám không còn mở hay dành riêng cho thỏa thuận khác.",
  move:
    "Không đổi được lịch: người khám đã có trong lịch đích, lịch đích không dùng được, hoặc thỏa thuận đã kết thúc.",
  "move-all":
    "Không dời được: lịch đích không dùng được, hoặc có thỏa thuận đã kết thúc. Chưa người nào bị dời.",
  "cancel-assignment": "Không hủy được: người khám đã đến khám hoặc phân lịch đã thay đổi.",
  attendance:
    "Chưa ghi nhận được: lịch khám chưa tới ngày, hoặc người khám không còn trong danh sách.",
}

/**
 * Vietnamese text for a failed scheduling request. The rules live in the backend: this only words
 * its answer. A stale version asks the user to reload; nothing is resent automatically.
 */
export function describeSchedulingError(error: unknown, action: SchedulingAction): SchedulingFailure {
  const verb = ACTION_VERBS[action]
  if (error instanceof ApiClientError) {
    if (error.status === 0) return { kind: "network", message: error.message }
    if (error.status === 401) {
      return { kind: "forbidden", message: "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại." }
    }
    if (error.status === 403) {
      return {
        kind: "forbidden",
        message: `Tài khoản của bạn chưa được cấp quyền ${verb}.`,
      }
    }
    if (error.status === 404) {
      return {
        kind: "not-found",
        message: "Không tìm thấy lịch khám hoặc người khám. Tải lại trang rồi thử lại.",
      }
    }
    if (error.status === 409) {
      const stale = (error.serverMessage ?? "").includes("changed by another request")
      if (stale) {
        return {
          kind: "stale",
          message: "Dữ liệu đã được người khác thay đổi. Hãy tải lại rồi thử lại.",
        }
      }
      return { kind: "conflict", message: CONFLICT_MESSAGES[action] ?? `Không thể ${verb}.` }
    }
    if (error.status === 400) {
      return { kind: "invalid", message: `Thông tin chưa hợp lệ để ${verb}. Kiểm tra lại các trường.` }
    }
    if (error.status >= 500) {
      return { kind: "other", message: "Máy chủ gặp lỗi. Vui lòng thử lại sau." }
    }
  }
  return { kind: "other", message: `Không thể ${verb}. Vui lòng thử lại.` }
}
