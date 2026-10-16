import type { ApiFieldError } from "@/shared/api/api-client"

/**
 * Form fields a backend rejection can land on. `services.<row>.negotiatedPrice` marks one row of the
 * services table.
 */
export type BatchServerErrorTarget =
  | "batchName"
  | "examinationDates"
  | "examinationSiteType"
  | "examinationSiteAddress"
  | "services"
  | `services.${number}.negotiatedPrice`

export interface BatchServerFieldIssue {
  /** Form field that shows the message; null when the message only appears in the summary. */
  target: BatchServerErrorTarget | null
  /** Vietnamese text for the user. */
  message: string
}

const REQUIRED_CODES = new Set(["NotNull", "NotBlank", "NotEmpty"])

/**
 * Turns one backend rejection into text for the user. The backend names the rejected JSON path and
 * the failed constraint; its English messages are never shown. A required field the form does not
 * send means the running backend is older than this form, so the text says so.
 */
export function batchServerFieldIssue(error: ApiFieldError): BatchServerFieldIssue {
  const required = REQUIRED_CODES.has(error.code ?? "")
  const row = /^services\[(\d+)\]\.negotiatedPrice$/.exec(error.field)
  if (row) {
    return {
      target: `services.${Number(row[1])}.negotiatedPrice`,
      message: required ? "Giá thỏa thuận là bắt buộc." : "Giá thỏa thuận không hợp lệ.",
    }
  }

  const root = error.field.split(/[.[]/)[0]
  switch (root) {
    case "batchName":
      return {
        target: "batchName",
        message: required ? "Tên đợt khám là bắt buộc." : "Tên đợt khám không hợp lệ.",
      }
    case "examinationDates":
      return {
        target: "examinationDates",
        message:
          required && error.field === "examinationDates"
            ? "Vui lòng chọn ít nhất một ngày khám."
            : "Ngày khám không hợp lệ.",
      }
    case "examinationSiteType":
      return {
        target: "examinationSiteType",
        message: required ? "Loại địa điểm là bắt buộc." : "Loại địa điểm không hợp lệ.",
      }
    case "examinationSiteAddress":
    case "siteAddressValid":
      return {
        target: "examinationSiteAddress",
        message: "Địa chỉ địa điểm khám là bắt buộc khi khám tại đơn vị.",
      }
    case "services":
      return {
        target: "services",
        message:
          required && error.field === "services"
            ? "Vui lòng chọn ít nhất một hạng mục khám."
            : "Hạng mục khám không hợp lệ. Vui lòng tải lại danh mục.",
      }
    case "rowVersion":
      return { target: null, message: "Dữ liệu đã thay đổi. Vui lòng tải lại đợt khám." }
    default:
      return {
        target: null,
        message: required
          ? "Thiếu thông tin bắt buộc. Máy chủ có thể đang chạy phiên bản cũ; vui lòng liên hệ quản trị viên."
          : "Có thông tin không hợp lệ. Vui lòng kiểm tra lại hoặc liên hệ quản trị viên.",
      }
  }
}

/** One issue per distinct message, in the order the backend reported them. */
export function batchServerFieldIssues(errors: readonly ApiFieldError[]): BatchServerFieldIssue[] {
  const issues = errors.map((error) => batchServerFieldIssue(error))
  return issues.filter(
    (issue, index) => issues.findIndex((other) => other.message === issue.message) === index
  )
}
