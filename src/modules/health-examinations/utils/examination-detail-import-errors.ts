import { ApiClientError } from "@/shared/api/api-client"

/** A rejected examination detail import, described in Vietnamese. The backend text is never shown. */
export interface ExaminationDetailImportFailure {
  message: string
  /** Worksheet row the backend reported, when the problem is tied to one row. */
  rowNumber?: number
  /** The workbook is out of date with the batch or the Participants: it has to be exported again. */
  needsNewExport: boolean
  /** Safe to resend the same request with the same Idempotency-Key. */
  retryable: boolean
}

type Described = Omit<ExaminationDetailImportFailure, "retryable"> & { retryable?: boolean }

interface Rule {
  pattern: RegExp
  describe: (match: RegExpMatchArray) => Described
}

const FIELD_LABELS: Record<string, string> = {
  participant_id: "mã người khám (cột ẩn)",
  row_version: "phiên bản dòng (cột ẩn)",
  actual_examination_date: "Ngày khám thực tế",
}

function field(name: string) {
  return FIELD_LABELS[name] ?? "một cột"
}

const row = (match: RegExpMatchArray) => Number(match[1])

const STALE_FILE_MESSAGE =
  "File không khớp với đợt khám hiện tại (thiếu sheet, sai cột hoặc là file cũ)."

const RULES: Rule[] = [
  {
    pattern: /^Row (\d+): column "(.*)" accepts only X or blank$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: cột “${m[2]}” chỉ nhận chữ X hoặc để trống.`,
      rowNumber: row(m),
      needsNewExport: false,
    }),
  },
  {
    pattern: /^Row (\d+): (participant_id|row_version) is (required|not valid)$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: ${field(m[2])} bị thiếu hoặc không hợp lệ. Vui lòng xuất lại file và không sửa các cột ẩn.`,
      rowNumber: row(m),
      needsNewExport: true,
    }),
  },
  {
    pattern: /^Row (\d+): actual_examination_date must be a text date in yyyy-MM-dd format$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: Ngày khám thực tế phải là ngày dạng văn bản yyyy-MM-dd (ví dụ 2026-10-20).`,
      rowNumber: row(m),
      needsNewExport: false,
    }),
  },
  {
    pattern: /^Row (\d+): actual_examination_date must be between the batch start date and today$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: Ngày khám thực tế phải từ ngày bắt đầu đợt khám đến hôm nay.`,
      rowNumber: row(m),
      needsNewExport: false,
    }),
  },
  {
    pattern: /^Row (\d+): (\w+) must be a text cell$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: ${field(m[2])} phải là ô văn bản (Text). Không dùng số, công thức hoặc ngày của Excel.`,
      rowNumber: row(m),
      needsNewExport: false,
    }),
  },
  {
    pattern: /^Row (\d+): (\w+) is too long$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: nội dung ở ${field(m[2])} quá dài.`,
      rowNumber: row(m),
      needsNewExport: false,
    }),
  },
  {
    pattern: /^Row (\d+): there is a value outside the file columns$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: có dữ liệu nằm ngoài các cột của file xuất.`,
      rowNumber: row(m),
      needsNewExport: false,
    }),
  },
  {
    pattern: /^Row (\d+): participant appears more than once \(first at row (\d+)\)$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: người khám bị lặp (đã có ở dòng ${m[2]}).`,
      rowNumber: row(m),
      needsNewExport: false,
    }),
  },
  {
    pattern: /^Row (\d+): participant is not in this batch$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: người khám không thuộc đợt khám này. Vui lòng xuất lại file từ đợt khám hiện tại.`,
      rowNumber: row(m),
      needsNewExport: true,
    }),
  },
  {
    pattern: /^Row (\d+): participant is cancelled$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: người khám đã bị hủy khỏi danh sách. Vui lòng xuất lại file.`,
      rowNumber: row(m),
      needsNewExport: true,
    }),
  },
  {
    pattern: /^Row (\d+): participant was changed after export; export again$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: người khám đã được thay đổi sau khi xuất file. Vui lòng xuất lại file mới nhất rồi nhập lại.`,
      rowNumber: row(m),
      needsNewExport: true,
    }),
  },
  {
    pattern: /^Row (\d+): a marked service is no longer offered in this batch$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: có hạng mục đánh dấu X không còn được thực hiện trong đợt khám này. Vui lòng xuất lại file.`,
      rowNumber: row(m),
      needsNewExport: true,
    }),
  },
  {
    pattern: /^Data is only accepted in worksheet rows 3 to (\d+)$/,
    describe: (m) => ({
      message: `File chỉ được chứa dữ liệu từ dòng 3 đến dòng ${m[1]}.`,
      needsNewExport: false,
    }),
  },
  {
    pattern: /^The workbook has no data rows$/,
    describe: () => ({
      message: "File không có dòng dữ liệu nào để nhập.",
      needsNewExport: false,
    }),
  },
  {
    pattern: /^The file does not match this batch; export it again$/,
    describe: () => ({
      message:
        "File không khớp với các hạng mục hiện tại của đợt khám. Vui lòng xuất lại file mới nhất rồi nhập lại.",
      needsNewExport: true,
    }),
  },
  {
    pattern: /export (it|the file) again$/,
    describe: () => ({
      message: `${STALE_FILE_MESSAGE} Vui lòng xuất lại file mới nhất rồi nhập lại.`,
      needsNewExport: true,
    }),
  },
  {
    pattern: /^(Merged cells|The workbook has an unexpected sheet|The file has too many|A service column)/,
    describe: () => ({
      message: `${STALE_FILE_MESSAGE} Vui lòng dùng file xuất của đợt khám, không gộp ô hoặc thêm sheet.`,
      needsNewExport: true,
    }),
  },
  {
    pattern: /^The file is not a valid XLSX workbook$/,
    describe: () => ({
      message: "Tệp không phải là bảng tính Excel (.xlsx) hợp lệ.",
      needsNewExport: false,
    }),
  },
  {
    pattern: /^(Macros|The workbook (contains|is)|The Participants sheet)/,
    describe: () => ({
      message:
        "File Excel có thành phần không được hỗ trợ (macro, liên kết ngoài hoặc quá lớn). Vui lòng dùng file xuất của đợt khám.",
      needsNewExport: true,
    }),
  },
  {
    pattern: /^Batch does not accept examination detail changes$/,
    describe: () => ({
      message:
        "Đợt khám hoặc đơn vị không còn nhận cập nhật chi tiết khám (chỉ đợt Nháp/Sẵn sàng của đơn vị đang hoạt động).",
      needsNewExport: false,
    }),
  },
  {
    pattern: /^Idempotency key was used for another request$/,
    describe: () => ({
      message: "Yêu cầu nhập này trùng mã với một yêu cầu khác. Vui lòng chọn lại file để thử lại.",
      needsNewExport: false,
    }),
  },
  {
    pattern: /^A request with this idempotency key is still being processed$/,
    describe: () => ({
      message: "Yêu cầu nhập trước đó vẫn đang được xử lý. Vui lòng đợi giây lát rồi thử lại.",
      needsNewExport: false,
      retryable: true,
    }),
  },
]

function byStatus(status: number): ExaminationDetailImportFailure {
  switch (status) {
    case 0:
      return {
        message: "Không thể kết nối máy chủ. Có thể thử lại với cùng file, hệ thống sẽ không ghi trùng.",
        needsNewExport: false,
        retryable: true,
      }
    case 400:
      return {
        message: "File hoặc thông tin gửi lên không hợp lệ. Vui lòng kiểm tra lại.",
        needsNewExport: false,
        retryable: false,
      }
    case 401:
      return {
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
        needsNewExport: false,
        retryable: false,
      }
    case 403:
      return {
        message: "Bạn không có quyền cập nhật chi tiết khám cho đợt khám này.",
        needsNewExport: false,
        retryable: false,
      }
    case 404:
      return {
        message: "Không tìm thấy đợt khám hoặc đơn vị. Có thể đã bị xóa hoặc ngừng hoạt động.",
        needsNewExport: false,
        retryable: false,
      }
    case 409:
      return {
        message: "Dữ liệu đợt khám đã thay đổi hoặc không thỏa quy tắc nghiệp vụ. Vui lòng xuất lại file.",
        needsNewExport: true,
        retryable: false,
      }
    case 413:
      return {
        message: "File vượt quá dung lượng cho phép (tối đa 5 MB).",
        needsNewExport: false,
        retryable: false,
      }
    case 415:
      return {
        message: "Chỉ chấp nhận tệp Excel định dạng .xlsx.",
        needsNewExport: false,
        retryable: false,
      }
    default:
      return {
        message:
          status >= 500
            ? "Máy chủ gặp lỗi. Có thể thử lại với cùng file, hệ thống sẽ không ghi trùng."
            : "Không thể nhập chi tiết khám. Vui lòng thử lại.",
        needsNewExport: false,
        retryable: status >= 500,
      }
  }
}

/**
 * Turns a failed import into Vietnamese guidance. Known backend messages keep their row number;
 * anything else falls back to a text chosen from the HTTP status only.
 */
export function describeExaminationDetailImportError(
  error: unknown
): ExaminationDetailImportFailure {
  if (!(error instanceof ApiClientError)) {
    return {
      message: "Không thể nhập chi tiết khám. Vui lòng thử lại.",
      needsNewExport: false,
      retryable: false,
    }
  }

  if (error.status === 400 || error.status === 409) {
    const text = error.serverMessage ?? ""
    for (const rule of RULES) {
      const match = text.match(rule.pattern)
      if (match) return { retryable: false, ...rule.describe(match) }
    }
  }

  return byStatus(error.status)
}
