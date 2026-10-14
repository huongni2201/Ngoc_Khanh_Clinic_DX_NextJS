import { z } from "zod"
import { STAFF_MEMBER_SEX_VALUES } from "../types/staff-member-transport"

export const STAFF_MEMBER_NAME_MAX_LENGTH = 200
export const STAFF_MEMBER_PHONE_MAX_LENGTH = 30
export const STAFF_MEMBER_EMAIL_MAX_LENGTH = 255
export const STAFF_PASSWORD_MIN_LENGTH = 8
/** Bcrypt reads at most 72 bytes; the backend rejects longer passwords instead of truncating them. */
export const STAFF_PASSWORD_MAX_BYTES = 72
export const STAFF_ROLE_MAX_COUNT = 20

function todayIso() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

/** UTF-8 length after the NFKC normalization the backend applies before hashing. */
export function passwordByteLength(password: string) {
  return new TextEncoder().encode(password.normalize("NFKC")).length
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
    .refine((value) => /\p{L}/u.test(value), { message: "Họ và tên phải có chữ cái" }),
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
    .refine((value) => passwordByteLength(value) <= STAFF_PASSWORD_MAX_BYTES, {
      message: "Mật khẩu tạm quá dài (tối đa 72 byte, ký tự có dấu tính nhiều byte)",
    }),
  roleCodes: z
    .array(z.string().min(1))
    .min(1, { message: "Chọn ít nhất một vai trò" })
    .max(STAFF_ROLE_MAX_COUNT, { message: `Chọn tối đa ${STAFF_ROLE_MAX_COUNT} vai trò` }),
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
  roleCodes: [],
}
