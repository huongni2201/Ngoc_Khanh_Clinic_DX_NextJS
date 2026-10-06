import { z } from "zod"

// The backend compares the username exactly (no trimming) and hashes the NFKC form of the password,
// which bcrypt limits to 72 bytes.
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Vui lòng nhập tên đăng nhập")
    .max(150, "Tên đăng nhập không được vượt quá 150 ký tự")
    .refine((value) => value.trim().length > 0, "Vui lòng nhập tên đăng nhập"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .max(1024, "Mật khẩu quá dài")
    .refine((value) => new TextEncoder().encode(value.normalize("NFKC")).length <= 72,
      "Mật khẩu không được vượt quá 72 byte UTF-8"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
