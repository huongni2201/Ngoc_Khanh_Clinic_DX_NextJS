import type { ApiFieldError } from "@/shared/api/api-client"

/**
 * Form fields a backend rejection can land on. `services.<row>.negotiatedPrice` marks one row of the
 * services table.
 */
export type AgreementServerErrorTarget =
  | "agreementName"
  | "validFrom"
  | "validTo"
  | "services"
  | `services.${number}.negotiatedPrice`

export interface AgreementServerFieldIssue {
  /** Form field that shows the message; null when the message only appears in the summary. */
  target: AgreementServerErrorTarget | null
  /** Vietnamese text for the user. */
  message: string
}

const REQUIRED_CODES = new Set(["NotNull", "NotBlank", "NotEmpty"])

/**
 * Turns one backend rejection into text for the user. The backend names the rejected JSON path and
 * the failed constraint; its English messages are never shown. A required field the form does not
 * send means the running backend is older than this form, so the text says so.
 */
export function agreementServerFieldIssue(error: ApiFieldError): AgreementServerFieldIssue {
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
    case "agreementName":
      return {
        target: "agreementName",
        message: required ? "Tên thỏa thuận là bắt buộc." : "Tên thỏa thuận không hợp lệ.",
      }
    case "validFrom":
      return { target: "validFrom", message: "Ngày bắt đầu hiệu lực không hợp lệ." }
    case "validTo":
      return { target: "validTo", message: "Ngày kết thúc hiệu lực không hợp lệ." }
    case "validityPeriodValid":
      return { target: "validTo", message: "Ngày bắt đầu hiệu lực không được sau ngày kết thúc." }
    case "services":
      return {
        target: "services",
        message:
          required && error.field === "services"
            ? "Vui lòng chọn ít nhất một hạng mục khám."
            : "Hạng mục khám không hợp lệ. Vui lòng tải lại danh mục.",
      }
    case "rowVersion":
      return { target: null, message: "Dữ liệu đã thay đổi. Vui lòng tải lại thỏa thuận." }
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
export function agreementServerFieldIssues(errors: readonly ApiFieldError[]): AgreementServerFieldIssue[] {
  const issues = errors.map((error) => agreementServerFieldIssue(error))
  return issues.filter(
    (issue, index) => issues.findIndex((other) => other.message === issue.message) === index
  )
}
