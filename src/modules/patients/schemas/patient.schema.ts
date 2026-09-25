import { z } from "zod"

export const createPatientSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(100, "Họ và tên không được vượt quá 100 ký tự"),
  dateOfBirth: z
    .string()
    .min(1, "Vui lòng chọn ngày sinh")
    .refine((val) => !isNaN(Date.parse(val)), "Ngày sinh không hợp lệ"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    error: "Vui lòng chọn giới tính",
  }),
  identificationNumber: z
    .string()
    .trim()
    .regex(/^\d{12}$/, "Số định danh phải gồm đúng 12 chữ số hợp lệ"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0"),
  email: z
    .string()
    .trim()
    .email("Email không đúng định dạng")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(255, "Địa chỉ không được vượt quá 255 ký tự")
    .optional()
    .or(z.literal("")),
})

export type CreatePatientFormValues = z.infer<typeof createPatientSchema>

export const updatePatientSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(100, "Họ và tên không được vượt quá 100 ký tự"),
  dateOfBirth: z
    .string()
    .min(1, "Vui lòng chọn ngày sinh")
    .refine((val) => !isNaN(Date.parse(val)), "Ngày sinh không hợp lệ"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    error: "Vui lòng chọn giới tính",
  }),
  identificationNumber: z
    .string()
    .trim()
    .regex(/^\d{12}$/, "Số định danh phải gồm đúng 12 chữ số hợp lệ"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0"),
  email: z
    .string()
    .trim()
    .email("Email không đúng định dạng")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(255, "Địa chỉ không được vượt quá 255 ký tự")
    .optional()
    .or(z.literal("")),
})

export type UpdatePatientFormValues = z.infer<typeof updatePatientSchema>
