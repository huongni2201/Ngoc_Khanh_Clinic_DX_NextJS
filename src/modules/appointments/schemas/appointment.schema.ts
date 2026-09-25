import { z } from "zod"

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Vui lòng chọn bệnh nhân"),
  examinationType: z.string().min(1, "Vui lòng chọn loại khám"),
  physicianId: z.string().min(1, "Vui lòng chọn bác sĩ phụ trách"),
  roomId: z.string().min(1, "Vui lòng chọn phòng khám"),
  date: z
    .string()
    .min(1, "Vui lòng chọn ngày hẹn")
    .refine((val) => !isNaN(Date.parse(val)), "Ngày hẹn không hợp lệ"),
  time: z
    .string()
    .min(1, "Vui lòng chọn giờ hẹn")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Giờ hẹn phải theo định dạng HH:mm"),
  notes: z
    .string()
    .trim()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
  type: z.enum(["INDIVIDUAL", "ENTERPRISE"]).optional(),
  enterpriseId: z.string().optional().or(z.literal("")),
  enterpriseName: z.string().optional().or(z.literal("")),
  batchId: z.string().optional().or(z.literal("")),
  batchName: z.string().optional().or(z.literal("")),
  employeeCode: z.string().optional().or(z.literal("")),
})

export type CreateAppointmentFormValues = z.infer<
  typeof createAppointmentSchema
>

export const editAppointmentSchema = z.object({
  date: z
    .string()
    .min(1, "Vui lòng chọn ngày hẹn")
    .refine((val) => !isNaN(Date.parse(val)), "Ngày hẹn không hợp lệ"),
  time: z
    .string()
    .min(1, "Vui lòng chọn giờ hẹn")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Giờ hẹn phải theo định dạng HH:mm"),
  physicianId: z.string().min(1, "Vui lòng chọn bác sĩ phụ trách"),
  roomId: z.string().min(1, "Vui lòng chọn phòng khám"),
  examinationType: z.string().min(1, "Vui lòng chọn loại khám"),
  notes: z
    .string()
    .trim()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
})

export type EditAppointmentFormValues = z.infer<typeof editAppointmentSchema>
