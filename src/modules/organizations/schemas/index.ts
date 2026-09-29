import { z } from "zod"

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
  contactPhone: z
    .string()
    .trim()
    .min(9, { message: "Số điện thoại phải từ 9 đến 11 số" })
    .regex(/^[0-9+() -]+$/, { message: "Số điện thoại không hợp lệ" }),
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
  contactPhone: z
    .string()
    .trim()
    .min(9, { message: "Số điện thoại phải từ 9 đến 11 số" })
    .regex(/^[0-9+() -]+$/, { message: "Số điện thoại không hợp lệ" }),
  contactJobTitle: z.string().trim().optional(),
  address: z.string().trim().optional(),
  note: z.string().trim().optional(),
})

export type UpdateOrganizationFormValues = z.infer<typeof updateOrganizationSchema>

export * from "./health-examination-batch.schema"

