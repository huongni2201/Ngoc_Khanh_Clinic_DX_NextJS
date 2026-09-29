import { z } from "zod"

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên đăng nhập")
    .max(200, "Tên đăng nhập không được vượt quá 200 ký tự"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .refine((value) => new TextEncoder().encode(value).length <= 72,
      "Mật khẩu không được vượt quá 72 byte UTF-8"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
