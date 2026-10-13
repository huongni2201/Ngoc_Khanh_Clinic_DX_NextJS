import { ApiClientError } from "@/shared/api/api-client"
import type {
  ExaminationFormPrintEntry,
  ExaminationFormPrintOrder,
  HealthExaminationParticipant,
} from "../types"

/** The backend prints forms only for READY and FINALIZED batches (409 otherwise). */
export function isExaminationFormPrintAllowed(batchStatus: string): boolean {
  return batchStatus === "READY" || batchStatus === "FINALIZED"
}

export const EXAMINATION_FORM_PRINT_BLOCKED_NOTE =
  "Chỉ in được phiếu khám khi đợt khám ở trạng thái Sẵn sàng hoặc Đã hoàn tất chuyên môn."

export const EXAMINATION_FORM_PRINT_ORDER_LABELS: Record<ExaminationFormPrintOrder, string> = {
  CODE: "Theo mã người khám",
  DEPARTMENT: "Theo đơn vị/phòng ban, rồi mã người khám",
}

export function toExaminationFormPrintEntry(
  participant: HealthExaminationParticipant
): ExaminationFormPrintEntry {
  return {
    id: participant.id,
    participantCode: participant.participantCode,
    fullName: participant.fullName,
    departmentName: participant.departmentName,
  }
}

const collator = new Intl.Collator("vi", { numeric: true, sensitivity: "base" })

function compareCode(left: ExaminationFormPrintEntry, right: ExaminationFormPrintEntry) {
  // A Participant without a code goes last, then by name, so the order never depends on clicks.
  if (left.participantCode && !right.participantCode) return -1
  if (!left.participantCode && right.participantCode) return 1
  return (
    collator.compare(left.participantCode ?? "", right.participantCode ?? "") ||
    collator.compare(left.fullName, right.fullName) ||
    left.id.localeCompare(right.id)
  )
}

/** Print order of a bulk job. The organization hands the forms out by department, then by code. */
export function orderExaminationFormPrintEntries(
  entries: readonly ExaminationFormPrintEntry[],
  order: ExaminationFormPrintOrder
): ExaminationFormPrintEntry[] {
  const sorted = [...entries]
  if (order === "DEPARTMENT") {
    sorted.sort(
      (left, right) =>
        collator.compare(left.departmentName.trim(), right.departmentName.trim()) ||
        compareCode(left, right)
    )
  } else {
    sorted.sort(compareCode)
  }
  return sorted
}

/** Vietnamese text for a failed single-form print. The backend text is English and never shown. */
export function describeExaminationFormError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 403) return "Tài khoản của bạn chưa được cấp quyền in phiếu khám."
    if (error.status === 404) {
      return "Không tìm thấy người khám hoặc chưa có mẫu phiếu đang áp dụng. Tải lại danh sách, nếu vẫn lỗi hãy liên hệ quản lý phòng khám."
    }
    if (error.status === 409) {
      return "Không in được phiếu: đợt khám chưa ở trạng thái Sẵn sàng/Đã hoàn tất chuyên môn, người khám đã bị hủy, hoặc thông tin quá dài làm phiếu tràn sang trang khác (kiểm tra địa chỉ, nơi làm việc, nơi cấp CCCD)."
    }
    if (error.status === 503) {
      return "Dịch vụ tạo PDF đang không phản hồi. Vui lòng thử lại sau ít phút."
    }
    if (error.status >= 500) return "Máy chủ gặp lỗi khi tạo phiếu khám. Vui lòng thử lại sau."
    if (error.status === 0) return error.message
  }
  return "Không thể tạo phiếu khám. Vui lòng thử lại."
}

/** Vietnamese text for a rejected bulk print job. */
export function describeCreatePrintJobError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 400) {
      return "Danh sách in không hợp lệ (trống, trùng người hoặc quá 1.000 người)."
    }
    if (error.status === 403) return "Tài khoản của bạn chưa được cấp quyền in phiếu khám hàng loạt."
    if (error.status === 404) return "Không tìm thấy đợt khám. Tải lại trang rồi thử lại."
    if (error.status === 409) {
      return "Chưa tạo được lệnh in: đợt khám không còn ở trạng thái cho phép in, hoặc bạn đang có 3 lệnh in chưa xong. Đợi lệnh trước hoàn tất rồi thử lại."
    }
    if (error.status === 503) {
      return "Máy chủ chưa sẵn sàng lưu file in. Liên hệ quản trị hệ thống."
    }
    if (error.status >= 500) return "Máy chủ gặp lỗi. Vui lòng thử lại sau."
    if (error.status === 0) return error.message
  }
  return "Không thể tạo lệnh in. Vui lòng thử lại."
}

const PAPER_SIZES: { name: string; shortMm: number; longMm: number }[] = [
  { name: "A3", shortMm: 297, longMm: 420 },
  { name: "A4", shortMm: 210, longMm: 297 },
  { name: "A5", shortMm: 148, longMm: 210 },
  { name: "A6", shortMm: 105, longMm: 148 },
]
const POINT_MM = 25.4 / 72
const MEDIA_BOX = /\/MediaBox\s*\[\s*(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s*\]/

/**
 * Paper of the first page, for example "A3 ngang", read from the PDF's MediaBox. The paper belongs
 * to the template, so staff are told what to load in the printer. Null when it cannot be read.
 */
export async function detectPdfPaper(blob: Blob): Promise<string | null> {
  let text: string
  try {
    text = new TextDecoder("latin1").decode(await blob.arrayBuffer())
  } catch {
    return null
  }
  const match = MEDIA_BOX.exec(text)
  if (!match) return null
  const [x0, y0, x1, y1] = match.slice(1, 5).map(Number)
  const widthMm = Math.abs(x1 - x0) * POINT_MM
  const heightMm = Math.abs(y1 - y0) * POINT_MM
  if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm) || widthMm === 0 || heightMm === 0) {
    return null
  }
  const orientation = widthMm > heightMm ? "ngang" : "dọc"
  const shortMm = Math.min(widthMm, heightMm)
  const longMm = Math.max(widthMm, heightMm)
  const paper = PAPER_SIZES.find(
    (size) => Math.abs(size.shortMm - shortMm) <= 2 && Math.abs(size.longMm - longMm) <= 2
  )
  return paper
    ? `${paper.name} ${orientation}`
    : `${Math.round(widthMm)} × ${Math.round(heightMm)} mm`
}
