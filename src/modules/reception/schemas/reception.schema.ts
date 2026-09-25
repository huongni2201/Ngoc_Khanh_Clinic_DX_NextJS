import { z } from "zod"

export const receivePatientSchema = z.object({
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

export type ReceivePatientFormValues = z.infer<typeof receivePatientSchema>

export const assignRoomSchema = z.object({
  encounterId: z.string().min(1, "Vui lòng chỉ định lượt khám"),
  roomId: z.string().min(1, "Vui lòng chọn phòng khám"),
  physicianId: z.string().min(1, "Vui lòng chọn bác sĩ phụ trách"),
})

export type AssignRoomFormValues = z.infer<typeof assignRoomSchema>

export const processPaymentSchema = z.object({
  paymentMethod: z.enum(["CASH", "TRANSFER"], {
    error: "Vui lòng chọn phương thức thanh toán",
  }),
  discount: z.number().min(0, "Giảm giá không được âm").default(0),
  printReceipt: z.boolean().default(true),
})

export type ProcessPaymentFormValues = z.infer<typeof processPaymentSchema>
