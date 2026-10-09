import { z } from "zod"

const contactPhoneSchema = z
  .string()
  .trim()
  .min(1, { message: "Số điện thoại là bắt buộc" })
  .max(30, { message: "Số điện thoại không được vượt quá 30 ký tự" })
  .regex(/^(?=.*\d)[0-9+() -]+$/, { message: "Số điện thoại không hợp lệ" })

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(30, { message: "Số điện thoại không được vượt quá 30 ký tự" })
  .regex(/^(?=.*\d)[0-9+() -]+$/, { message: "Số điện thoại không hợp lệ" })
  .optional()
  .or(z.literal(""))

const requiredEmailSchema = z.email({ message: "Email không hợp lệ" })

const organizationFields = {
  name: z.string().trim().min(2, { message: "Tên đơn vị phải có ít nhất 2 ký tự" }).max(300, { message: "Tên đơn vị không được vượt quá 300 ký tự" }),
  taxCode: z.string().trim().max(50, { message: "Mã số thuế không được vượt quá 50 ký tự" }).optional(),
  phone: optionalPhoneSchema,
  email: requiredEmailSchema,
  address: z.string().trim().min(1, { message: "Địa chỉ là bắt buộc" }),
  contactPhone: contactPhoneSchema,
  contactEmail: requiredEmailSchema,
}

export const createOrganizationSchema = z.object({
  ...organizationFields,
  contactPerson: z
    .string()
    .trim()
    .min(2, { message: "Người liên hệ là bắt buộc" })
    .max(200, { message: "Tên người liên hệ không được vượt quá 200 ký tự" }),
})

export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>

export const updateOrganizationSchema = z.object({
  ...organizationFields,
  contactName: z
    .string()
    .trim()
    .min(2, { message: "Người liên hệ là bắt buộc" })
    .max(200, { message: "Tên người liên hệ không được vượt quá 200 ký tự" }),
})

export type UpdateOrganizationFormValues = z.infer<typeof updateOrganizationSchema>
