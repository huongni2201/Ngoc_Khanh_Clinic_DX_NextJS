import { z } from "zod"

export const patientCheckInSchema = z.object({
  patientId: z.string().min(1, "Vui lòng chọn bệnh nhân"),
  examinationType: z.string().min(1, "Vui lòng chọn loại khám"),
  roomId: z.string().optional(),
  physicianId: z.string().optional(),
  reasonForVisit: z
    .string()
    .trim()
    .max(500, "Lý do khám không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
  printAfterReception: z.boolean(),
})

export type PatientCheckInFormValues = z.infer<typeof patientCheckInSchema>
