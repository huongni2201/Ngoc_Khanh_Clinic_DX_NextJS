import { z } from "zod"
import { ACCOUNT_TYPES } from "../types/transport"
import { selectsRoles } from "../utils/account-type"

/** Same rule as the backend: printable ASCII, no leading or trailing space. */
export const USERNAME_PATTERN = /^[\x21-\x7E](?:[\x20-\x7E]*[\x21-\x7E])?$/
export const USERNAME_MAX_LENGTH = 150
export const OWNER_KEYWORD_MIN_LENGTH = 2
export const OWNER_KEYWORD_MAX_LENGTH = 100

export const createUserAccountSchema = z
  .object({
    accountType: z.enum(ACCOUNT_TYPES),
    ownerId: z.string().min(1, "Vui lòng chọn hồ sơ chủ tài khoản"),
    username: z
      .string()
      .min(1, "Tên đăng nhập là bắt buộc")
      .max(USERNAME_MAX_LENGTH, `Tên đăng nhập tối đa ${USERNAME_MAX_LENGTH} ký tự`)
      .regex(
        USERNAME_PATTERN,
        "Tên đăng nhập chỉ gồm chữ không dấu, chữ số hoặc ký hiệu, không có khoảng trắng ở đầu hoặc cuối"
      ),
    temporaryPassword: z
      .string()
      .refine((value) => value.trim().length > 0, "Mật khẩu tạm thời là bắt buộc"),
    roleIds: z.array(z.string()),
  })
  .superRefine((values, context) => {
    if (selectsRoles(values.accountType) && values.roleIds.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["roleIds"],
        message: "Chọn ít nhất một vai trò cho tài khoản nhân viên",
      })
    }
  })

export type CreateUserAccountFormValues = z.infer<typeof createUserAccountSchema>

/** Whether a username is well-formed enough to ask the backend about its availability. */
export function isWellFormedUsername(username: string): boolean {
  return username.length <= USERNAME_MAX_LENGTH && USERNAME_PATTERN.test(username)
}

export const EMPTY_CREATE_USER_ACCOUNT_VALUES: CreateUserAccountFormValues = {
  accountType: "STAFF",
  ownerId: "",
  username: "",
  temporaryPassword: "",
  roleIds: [],
}
