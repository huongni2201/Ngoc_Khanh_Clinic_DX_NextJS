import type { StatusTone } from "@/shared/ui"
import type {
  RenderJobErrorCode,
  RenderJobPart,
  RenderJobSkipReason,
  RenderJobStatus,
} from "../types/render-job"

export const RENDER_JOB_STATUS_LABELS: Record<RenderJobStatus, string> = {
  QUEUED: "Đang chờ xử lý",
  RUNNING: "Đang tạo tệp",
  SUCCEEDED: "Đã xong",
  FAILED: "Thất bại",
  EXPIRED: "Đã hết hạn",
}

export const RENDER_JOB_STATUS_TONES: Record<RenderJobStatus, StatusTone> = {
  QUEUED: "neutral",
  RUNNING: "info",
  SUCCEEDED: "success",
  FAILED: "danger",
  EXPIRED: "warning",
}

/** True while the backend may still change the job, so its progress is worth polling. */
export function isRenderJobActive(status: RenderJobStatus | undefined): boolean {
  return status === "QUEUED" || status === "RUNNING"
}

const SKIP_REASON_LABELS: Record<string, string> = {
  NOT_FOUND: "Không còn thuộc thỏa thuận hoặc lịch khám",
  CANCELLED: "Đã bị hủy khỏi danh sách",
  TOO_LONG: "Thông tin quá dài, phiếu tràn sang trang khác",
  RENDER_FAILED: "Lỗi khi tạo phiếu",
}

export function describeRenderJobSkipReason(reason: RenderJobSkipReason): string {
  return SKIP_REASON_LABELS[reason] ?? "Không in được"
}

const ERROR_CODE_LABELS: Record<string, string> = {
  UNSUPPORTED_DOCUMENT_TYPE: "Loại tài liệu này chưa hỗ trợ in.",
  NO_TEMPLATE: "Chưa có mẫu phiếu đang áp dụng. Liên hệ quản lý phòng khám.",
  TEMPLATE_UNAVAILABLE: "Tệp mẫu phiếu bị lỗi, không điền được dữ liệu. Liên hệ quản lý phòng khám.",
  RENDERER_UNAVAILABLE: "Dịch vụ tạo PDF không phản hồi. Thử lại sau ít phút.",
  STORAGE_FAILED: "Máy chủ không lưu được tệp in. Liên hệ quản trị hệ thống.",
  SOURCE_NOT_FOUND: "Thỏa thuận hoặc lịch khám đã bị xóa sau khi tạo lệnh in.",
  SOURCE_NOT_PRINTABLE:
    "Thỏa thuận không còn ở trạng thái cho phép in (Đang áp dụng hoặc Đã kết thúc).",
  NOTHING_TO_PRINT: "Không còn người khám nào in được.",
  ATTEMPTS_EXHAUSTED: "Máy chủ xử lý lệnh in bị gián đoạn nhiều lần.",
  INTERNAL_ERROR: "Máy chủ gặp lỗi khi tạo tệp in.",
}

export function describeRenderJobError(code: RenderJobErrorCode | undefined): string {
  return (code && ERROR_CODE_LABELS[code]) || "Lệnh in thất bại."
}

/** A part with the 1-based positions of its first and last printed record. */
export interface RenderJobPartRange extends RenderJobPart {
  from: number
  to: number
}

/** Parts are numbered in print order, so the positions follow from the record counts. */
export function renderJobPartRanges(parts: readonly RenderJobPart[]): RenderJobPartRange[] {
  let printed = 0
  return parts.map((part) => {
    const from = printed + 1
    printed += part.recordCount
    return { ...part, from, to: printed }
  })
}
