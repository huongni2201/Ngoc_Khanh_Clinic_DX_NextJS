import { ApiClientError } from "@/shared/api/api-client"

/** A rejected import, described in Vietnamese. The backend text is English and is never shown. */
export interface ParticipantImportFailure {
  message: string
  /** Worksheet row the backend reported, when the problem is tied to one row. */
  rowNumber?: number
  /** The workbook or the cached agreement version is out of date: the template must be downloaded again. */
  needsNewTemplate: boolean
  /** Safe to resend the same request with the same Idempotency-Key. */
  retryable: boolean
}

const FIELD_LABELS: Record<string, string> = {
  full_name: "Họ và tên",
  date_of_birth: "Ngày sinh",
  sex: "Giới tính",
  identification_number: "CCCD",
  identification_issue_date: "Ngày cấp CCCD",
  identification_issue_place: "Nơi cấp CCCD",
  ethnicity: "Dân tộc",
  phone: "Số điện thoại",
  email: "Thư điện tử",
  address: "Chỗ ở",
  workplace: "Nơi làm việc",
  department_name: "Đơn vị/Phòng ban",
  position_name: "Chức vụ",
  examination_date: "Ngày khám",
  note: "Ghi chú",
}

function field(name: string) {
  return FIELD_LABELS[name] ?? "một cột"
}

interface Rule {
  pattern: RegExp
  describe: (match: RegExpMatchArray) => Omit<ParticipantImportFailure, "retryable"> & {
    retryable?: boolean
  }
}

const row = (match: RegExpMatchArray) => Number(match[1])

const RULES: Rule[] = [
  {
    pattern: /^Row (\d+): (\w+) is required$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: thiếu giá trị ở cột ${field(m[2])}.`,
      rowNumber: row(m),
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^Row (\d+): (\w+) must be a text cell$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: cột ${field(m[2])} phải là ô văn bản (Text). Không dùng số, công thức hoặc ngày của Excel.`,
      rowNumber: row(m),
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^Row (\d+): (\w+) is too long$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: cột ${field(m[2])} quá dài.`,
      rowNumber: row(m),
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^Row (\d+): (\w+) must be a text date in yyyy-MM-dd format$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: cột ${field(m[2])} phải là ngày dạng văn bản yyyy-MM-dd (ví dụ 2026-10-20).`,
      rowNumber: row(m),
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^Row (\d+): there is a value outside the template columns$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: có dữ liệu nằm ngoài các cột của tệp mẫu.`,
      rowNumber: row(m),
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^Row (\d+): identification_number must be 1 to 20 digits$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: CCCD phải gồm 1 đến 20 chữ số.`,
      rowNumber: row(m),
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^Row (\d+): full_name, sex, department_name and position_name are not valid$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: Họ và tên, Giới tính, Đơn vị/Phòng ban hoặc Chức vụ không hợp lệ. Giới tính chỉ nhận MALE, FEMALE, OTHER hoặc UNKNOWN.`,
      rowNumber: row(m),
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^Row (\d+): examination_date is not a day of this agreement$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: Ngày khám không thuộc các ngày của thỏa thuận.`,
      rowNumber: row(m),
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^Participant identity already exists in this agreement at row (\d+)$/,
    describe: (m) => ({
      message: `Dòng ${m[1]}: CCCD đã có trong thỏa thuận này (kể cả người khám đã bị hủy).`,
      rowNumber: row(m),
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^Duplicate participant identity at rows (\d+) and (\d+)$/,
    describe: (m) => ({
      message: `CCCD bị trùng trong tệp: dòng ${m[1]} và dòng ${m[2]}.`,
      rowNumber: Number(m[2]),
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^Data is only accepted in worksheet rows 2 to (\d+)$/,
    describe: (m) => ({
      message: `Tệp chỉ được chứa dữ liệu từ dòng 2 đến dòng ${m[1]}.`,
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^The workbook does not match this agreement version; download the template again$/,
    describe: () => ({
      message:
        "Tệp không khớp với phiên bản hiện tại của thỏa thuận. Vui lòng tải lại tệp mẫu mới nhất và nhập lại.",
      needsNewTemplate: true,
    }),
  },
  {
    pattern: /download the template again$/,
    describe: () => ({
      message: "Không đọc được thông tin tệp mẫu. Vui lòng tải lại tệp mẫu và nhập lại.",
      needsNewTemplate: true,
    }),
  },
  {
    pattern: /^The workbook has no data rows$/,
    describe: () => ({
      message: "Tệp không có dòng dữ liệu nào để nhập.",
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^The header /,
    describe: () => ({
      message: "Dòng tiêu đề của tệp không đúng mẫu. Vui lòng dùng tệp mẫu của thỏa thuận.",
      needsNewTemplate: true,
    }),
  },
  {
    pattern: /^The file is not a valid XLSX workbook$/,
    describe: () => ({
      message: "Tệp không phải là bảng tính Excel (.xlsx) hợp lệ.",
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^(Macros|The workbook (contains|has|is)|Merged cells|The Participants sheet)/,
    describe: () => ({
      message:
        "Tệp Excel không đúng mẫu hoặc có thành phần không được hỗ trợ (lệnh tự động, ô gộp, liên kết ngoài, trang tính thừa). Vui lòng dùng tệp mẫu của thỏa thuận.",
      needsNewTemplate: true,
    }),
  },
  {
    pattern: /^Agreement does not accept Participant imports$/,
    describe: () => ({
      message:
        "Thỏa thuận hoặc đơn vị không còn nhận danh sách người khám (chỉ thỏa thuận Nháp hoặc Đang áp dụng của đơn vị đang hoạt động).",
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^Idempotency key was used for another request$/,
    describe: () => ({
      message: "Yêu cầu nhập này trùng mã với một yêu cầu khác. Vui lòng chọn lại tệp để thử lại.",
      needsNewTemplate: false,
    }),
  },
  {
    pattern: /^A request with this idempotency key is still being processed$/,
    describe: () => ({
      message: "Yêu cầu nhập trước đó vẫn đang được xử lý. Vui lòng đợi giây lát rồi thử lại.",
      needsNewTemplate: false,
      retryable: true,
    }),
  },
  {
    pattern: /^Record was changed by another request$/,
    describe: () => ({
      message:
        "Thỏa thuận đã được cập nhật bởi người khác. Vui lòng tải lại tệp mẫu mới nhất và nhập lại.",
      needsNewTemplate: true,
    }),
  },
]

function byStatus(status: number): ParticipantImportFailure {
  switch (status) {
    case 0:
      return {
        message: "Không thể kết nối máy chủ. Có thể thử lại với cùng tệp, hệ thống sẽ không nhập trùng.",
        needsNewTemplate: false,
        retryable: true,
      }
    case 400:
      return {
        message: "Tệp hoặc thông tin gửi lên không hợp lệ. Vui lòng kiểm tra lại.",
        needsNewTemplate: false,
        retryable: false,
      }
    case 401:
      return {
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
        needsNewTemplate: false,
        retryable: false,
      }
    case 403:
      return {
        message: "Bạn không có quyền nhập danh sách người khám cho thỏa thuận này.",
        needsNewTemplate: false,
        retryable: false,
      }
    case 404:
      return {
        message: "Không tìm thấy thỏa thuận hoặc đơn vị. Có thể đã bị xóa hoặc ngừng hoạt động.",
        needsNewTemplate: false,
        retryable: false,
      }
    case 409:
      return {
        message: "Dữ liệu thỏa thuận đã thay đổi hoặc không thỏa quy tắc nghiệp vụ. Vui lòng tải lại.",
        needsNewTemplate: true,
        retryable: false,
      }
    case 413:
      return {
        message: "Tệp vượt quá dung lượng cho phép (tối đa 5 MB).",
        needsNewTemplate: false,
        retryable: false,
      }
    case 415:
      return {
        message: "Chỉ chấp nhận tệp Excel định dạng .xlsx.",
        needsNewTemplate: false,
        retryable: false,
      }
    default:
      return {
        message:
          status >= 500
            ? "Máy chủ gặp lỗi. Có thể thử lại với cùng tệp, hệ thống sẽ không nhập trùng."
            : "Không thể nhập danh sách người khám. Vui lòng thử lại.",
        needsNewTemplate: false,
        retryable: status >= 500,
      }
  }
}

/**
 * Turns a failed import into Vietnamese guidance. Known backend messages (one per validation) keep
 * their row number; anything else falls back to a text chosen from the HTTP status only. When the
 * import also scheduled into a session (`withSession`), a 404 or the backend's generic business-rule
 * 409 is about that session: it is missing, cancelled or reserved to another agreement.
 */
export function describeParticipantImportError(
  error: unknown,
  options: { withSession?: boolean } = {}
): ParticipantImportFailure {
  if (!(error instanceof ApiClientError)) {
    return {
      message: "Không thể nhập danh sách người khám. Vui lòng thử lại.",
      needsNewTemplate: false,
      retryable: false,
    }
  }

  if (
    options.withSession &&
    ((error.status === 404 && /^Session\b/i.test(error.serverMessage ?? "")) ||
      (error.status === 409 && error.serverMessage === "Business rule could not be completed"))
  ) {
    return {
      message:
        "Không xếp được vào lịch khám đã chọn: lịch không còn, đã bị hủy hoặc dành riêng cho thỏa thuận khác. Hãy chọn lịch khác hoặc nhập không xếp lịch.",
      needsNewTemplate: false,
      retryable: false,
    }
  }

  if (error.status === 400 || error.status === 409) {
    const text = error.serverMessage ?? ""
    for (const rule of RULES) {
      const match = text.match(rule.pattern)
      if (match) {
        const described = rule.describe(match)
        return { retryable: false, ...described }
      }
    }
  }

  return byStatus(error.status)
}

/** Whether the file name and size are acceptable to send; the backend still validates the content. */
export function validateParticipantImportFile(
  file: Pick<File, "name" | "size">,
  maxBytes: number
): string | null {
  if (!file.name.toLowerCase().endsWith(".xlsx")) return "Chỉ chấp nhận tệp Excel định dạng .xlsx."
  if (file.size === 0) return "Tệp rỗng."
  if (file.size > maxBytes) return "Tệp vượt quá dung lượng cho phép (tối đa 5 MB)."
  return null
}
