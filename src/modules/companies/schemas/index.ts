import { z } from "zod"

export const createEnterpriseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Tên doanh nghiệp phải có ít nhất 2 ký tự" }),
  taxCode: z.string().trim().optional(),
  contactPerson: z
    .string()
    .trim()
    .min(2, { message: "Người liên hệ là bắt buộc" }),
  contactPhone: z
    .string()
    .trim()
    .min(9, { message: "Số điện thoại phải từ 9 đến 11 số" })
    .regex(/^[0-9+() -]+$/, { message: "Số điện thoại không hợp lệ" }),
  address: z.string().trim().optional(),
})

export type CreateEnterpriseFormValues = z.infer<typeof createEnterpriseSchema>

export const updateEnterpriseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Tên doanh nghiệp phải có ít nhất 2 ký tự" }),
  taxCode: z.string().trim().optional(),
  contactName: z
    .string()
    .trim()
    .min(2, { message: "Người liên hệ là bắt buộc" }),
  phone: z
    .string()
    .trim()
    .min(9, { message: "Số điện thoại phải từ 9 đến 11 số" })
    .regex(/^[0-9+() -]+$/, { message: "Số điện thoại không hợp lệ" }),
  email: z
    .string()
    .trim()
    .email({ message: "Email không đúng định dạng" })
    .optional()
    .or(z.literal("")),
  address: z.string().trim().optional(),
  note: z.string().trim().optional(),
})

export type UpdateEnterpriseFormValues = z.infer<typeof updateEnterpriseSchema>

export * from "./exam-batch.schema"
