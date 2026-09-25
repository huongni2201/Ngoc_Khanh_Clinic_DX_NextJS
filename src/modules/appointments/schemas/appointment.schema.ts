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
  careProgram: z
    .enum(["INDIVIDUAL", "ORGANIZATION_HEALTH_EXAMINATION"])
    .optional(),
  organizationId: z.string().optional().or(z.literal("")),
  organizationName: z.string().optional().or(z.literal("")),
  healthExaminationBatchId: z.string().optional().or(z.literal("")),
  healthExaminationBatchName: z.string().optional().or(z.literal("")),
  participantCode: z.string().optional().or(z.literal("")),
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

