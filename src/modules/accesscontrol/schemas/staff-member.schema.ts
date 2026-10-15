import { z } from "zod"
import { STAFF_MEMBER_SEX_VALUES } from "../types/staff-member-transport"

export const STAFF_MEMBER_NAME_MAX_LENGTH = 200
export const STAFF_MEMBER_PHONE_MAX_LENGTH = 30
export const STAFF_MEMBER_EMAIL_MAX_LENGTH = 255
export const STAFF_PASSWORD_MIN_LENGTH = 8
/**
 * Bcrypt reads at most 72 bytes. Temporary passwords are printable ASCII (one byte per character),
 * so the limit is 72 characters.
 */
export const STAFF_PASSWORD_MAX_LENGTH = 72
/** Printable ASCII without spaces or diacritics: letters, digits and symbols (`!` to `~`). */
const STAFF_PASSWORD_PATTERN = /^[\x21-\x7E]+$/

/**
 * Letters of the Vietnamese alphabet (plus f, j, w, z), the same set as the backend
 * `CreateStaffMemberRequest.LATIN_NAME_PATTERN`: exactly the letters the username generator reduces
 * to a–z. Letters such as ø, ß, æ or ł and other scripts are excluded.
 */
const NAME_LETTERS =
  "A-Za-z\\u00C0-\\u00C3\\u00C8-\\u00CA\\u00CC\\u00CD\\u00D2-\\u00D5\\u00D9\\u00DA\\u00DD" +
  "\\u00E0-\\u00E3\\u00E8-\\u00EA\\u00EC\\u00ED\\u00F2-\\u00F5\\u00F9\\u00FA\\u00FD" +
  "\\u0102\\u0103\\u0110\\u0111\\u0128\\u0129\\u0168\\u0169\\u01A0\\u01A1\\u01AF\\u01B0" +
  "\\u1EA0-\\u1EF9"
/** Those letters, combining marks, spaces, `.`, `'` and `-`, with at least one letter. */
const STAFF_MEMBER_NAME_PATTERN = new RegExp(
  `^(?=.*[${NAME_LETTERS}])[${NAME_LETTERS}\\p{M} .'-]+$`,
  "u"
)

function todayIso() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

/**
 * Form rules for creating a staff member with its account. They only catch typing mistakes early:
 * the backend decides (role availability, password length, generated codes).
 */
export const createStaffMemberSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Họ và tên là bắt buộc" })
    .max(STAFF_MEMBER_NAME_MAX_LENGTH, {
      message: `Họ và tên không được vượt quá ${STAFF_MEMBER_NAME_MAX_LENGTH} ký tự`,
    })
    // The backend builds the username from these letters, without diacritics.
    .regex(STAFF_MEMBER_NAME_PATTERN, {
      message: "Họ và tên chỉ gồm chữ cái tiếng Việt, dấu cách, dấu chấm, dấu nháy hoặc gạch nối",
    }),
  dateOfBirth: z.string().superRefine((value, context) => {
    if (value === "") return
    if (!z.iso.date().safeParse(value).success) {
      context.addIssue({ code: "custom", message: "Ngày sinh không hợp lệ" })
    } else if (value >= todayIso()) {
      context.addIssue({ code: "custom", message: "Ngày sinh phải trước hôm nay" })
    }
  }),
  sex: z.union([z.literal(""), z.enum(STAFF_MEMBER_SEX_VALUES)]),
  phone: z
    .string()
    .trim()
    .max(STAFF_MEMBER_PHONE_MAX_LENGTH, {
      message: `Số điện thoại không được vượt quá ${STAFF_MEMBER_PHONE_MAX_LENGTH} ký tự`,
    }),
  email: z
    .string()
    .trim()
    .max(STAFF_MEMBER_EMAIL_MAX_LENGTH, {
      message: `Email không được vượt quá ${STAFF_MEMBER_EMAIL_MAX_LENGTH} ký tự`,
    })
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      message: "Email không hợp lệ",
    }),
  initialPassword: z
    .string()
    .min(STAFF_PASSWORD_MIN_LENGTH, {
      message: `Mật khẩu tạm phải có ít nhất ${STAFF_PASSWORD_MIN_LENGTH} ký tự`,
    })
    .max(STAFF_PASSWORD_MAX_LENGTH, {
      message: `Mật khẩu tạm không được vượt quá ${STAFF_PASSWORD_MAX_LENGTH} ký tự`,
    })
    .regex(STAFF_PASSWORD_PATTERN, {
      message: "Mật khẩu tạm chỉ gồm chữ không dấu, số và ký hiệu, không có dấu cách",
    }),
  // An account holds exactly one role.
  roleCode: z.string().min(1, { message: "Vui lòng chọn một vai trò" }),
})

export type CreateStaffMemberFormValues = z.input<typeof createStaffMemberSchema>
export type ValidatedCreateStaffMemberFormValues = z.output<typeof createStaffMemberSchema>

export const EMPTY_CREATE_STAFF_MEMBER_FORM: CreateStaffMemberFormValues = {
  fullName: "",
  dateOfBirth: "",
  sex: "",
  phone: "",
  email: "",
  initialPassword: "",
  roleCode: "",
}
