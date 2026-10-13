import { ApiClientError } from "@/shared/api/api-client"

/** What the entry sheet should do after a failed manual entry. */
export type ExaminationDetailRecordFailureKind =
  | "stale-version"
  | "has-performed"
  | "no-longer-offered"
  | "cancelled"
  | "closed-batch"
  | "invalid"
  | "forbidden"
  | "not-found"
  | "unauthenticated"
  | "network"
  | "unknown"

export interface ExaminationDetailRecordFailure {
  kind: ExaminationDetailRecordFailureKind
  /** Vietnamese guidance; the English backend text is never shown. */
  message: string
  /** The Participant changed elsewhere: reload the row before saving again. */
  needsReload: boolean
  /** Backend field names the 400 rejected (for example `actualExaminationDate`). */
  fields: string[]
}

/**
 * The 409 envelope has no business code, so the safe English messages of the backend are matched
 * exactly. Any unknown 409 keeps a neutral Vietnamese text.
 */
const CONFLICT_RULES: Array<{
  matches: (text: string) => boolean
  kind: ExaminationDetailRecordFailureKind
  message: string
  needsReload?: boolean
}> = [
  {
    matches: (text) => text === "Participant was changed by another request; reload and try again",
    kind: "stale-version",
    message: "Thông tin người khám vừa được cập nhật ở nơi khác. Tải lại để xem dữ liệu mới nhất.",
    needsReload: true,
  },
  {
    matches: (text) => text === "Participant has performed services; clear them before marking absent",
    kind: "has-performed",
    message: "Không thể đánh vắng người khám đã có hạng mục được ghi nhận.",
  },
  {
    matches: (text) => /^Participant: a marked service is no longer offered in this batch$/.test(text),
    kind: "no-longer-offered",
    message: "Có hạng mục được chọn không còn được thực hiện trong đợt khám này. Bỏ chọn hạng mục đó.",
  },
  {
    matches: (text) => text === "Participant is cancelled",
    kind: "cancelled",
    message: "Người khám này đã bị hủy khỏi danh sách nên không thể cập nhật.",
    needsReload: true,
  },
  {
    matches: (text) => text === "Batch does not accept examination detail changes",
    kind: "closed-batch",
    message: "Đợt khám không còn cho phép cập nhật chi tiết khám.",
  },
]

export function describeExaminationDetailRecordError(error: unknown): ExaminationDetailRecordFailure {
  const failure = (
    kind: ExaminationDetailRecordFailureKind,
    message: string,
    extra: Partial<Pick<ExaminationDetailRecordFailure, "needsReload" | "fields">> = {}
  ): ExaminationDetailRecordFailure => ({
    kind,
    message,
    needsReload: extra.needsReload ?? false,
    fields: extra.fields ?? [],
  })

  if (!(error instanceof ApiClientError)) {
    return failure("unknown", "Không thể cập nhật chi tiết khám. Vui lòng thử lại.")
  }
  switch (error.status) {
    case 0:
      return failure("network", "Không thể kết nối máy chủ. Vui lòng thử lại.")
    case 400: {
      const text = error.serverMessage ?? ""
      if (text.includes("actual_examination_date") || text.includes("actualExaminationDate")) {
        return failure("invalid", "Ngày khám thực tế phải từ ngày bắt đầu đợt khám đến hôm nay.", {
          fields: ["actualExaminationDate"],
        })
      }
      if (text.includes("outside this batch")) {
        return failure(
          "invalid",
          "Có hạng mục không thuộc đợt khám này. Tải lại dữ liệu rồi chọn lại.",
          { fields: ["performedBatchServiceIds"], needsReload: true }
        )
      }
      return failure("invalid", "Thông tin gửi lên không hợp lệ. Vui lòng kiểm tra lại.", {
        fields: error.fieldErrors.map((item) => item.field),
      })
    }
    case 401:
      return failure(
        "unauthenticated",
        "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
      )
    case 403:
      return failure("forbidden", "Bạn không có quyền cập nhật chi tiết khám.")
    case 404:
      return failure(
        "not-found",
        "Không tìm thấy người khám hoặc đợt khám. Có thể đã bị xóa hoặc ngừng hoạt động.",
        { needsReload: true }
      )
    case 409: {
      const rule = CONFLICT_RULES.find((candidate) => candidate.matches(error.serverMessage ?? ""))
      if (rule) {
        return failure(rule.kind, rule.message, { needsReload: rule.needsReload })
      }
      return failure(
        "unknown",
        "Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ. Vui lòng tải lại.",
        { needsReload: true }
      )
    }
    default:
      return failure(
        "unknown",
        error.status >= 500
          ? "Máy chủ gặp lỗi. Vui lòng thử lại sau."
          : "Không thể cập nhật chi tiết khám. Vui lòng thử lại."
      )
  }
}
