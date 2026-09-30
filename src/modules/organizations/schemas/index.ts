import { z } from "zod"

const contactPhoneSchema = z
  .string()
  .trim()
  .min(1, { message: "Số điện thoại là bắt buộc" })
  .max(30, { message: "Số điện thoại không được vượt quá 30 ký tự" })
  .regex(/^(?=.*\d)[0-9+() -]+$/, { message: "Số điện thoại không hợp lệ" })

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Tên đơn vị phải có ít nhất 2 ký tự" }),
  taxCode: z.string().trim().optional(),
  contactPerson: z
    .string()
    .trim()
    .min(2, { message: "Người liên hệ là bắt buộc" }),
  contactPhone: contactPhoneSchema,
  contactJobTitle: z.string().trim().optional(),
  note: z.string().trim().optional(),
  address: z.string().trim().optional(),
})

export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Tên đơn vị phải có ít nhất 2 ký tự" }),
  taxCode: z.string().trim().optional(),
  contactName: z
    .string()
    .trim()
    .min(2, { message: "Người liên hệ là bắt buộc" }),
  contactPhone: contactPhoneSchema,
  contactJobTitle: z.string().trim().optional(),
  address: z.string().trim().optional(),
  note: z.string().trim().optional(),
})

export type UpdateOrganizationFormValues = z.infer<typeof updateOrganizationSchema>
