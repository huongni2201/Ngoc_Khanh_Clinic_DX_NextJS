import { z } from "zod"
import { PARTICIPANT_SEX_VALUES } from "../types/transport"

export const PARTICIPANT_NAME_MAX_LENGTH = 200
export const PARTICIPANT_TEXT_MAX_LENGTH = 500
export const PARTICIPANT_IDENTIFICATION_MAX_LENGTH = 20
export const PARTICIPANT_ADDRESS_MAX_LENGTH = 1000
export const PARTICIPANT_NOTE_MAX_LENGTH = 2000

const sexSchema = z
  .union([z.literal(""), z.enum(PARTICIPANT_SEX_VALUES)])
  .transform((value, context) => {
    if (value === "") {
      context.addIssue({ code: "custom", message: "Giới tính là bắt buộc" })
      return z.NEVER
    }
    return value
  })

function todayIso() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

const dateOfBirthSchema = z
  .string()
  .min(1, { message: "Ngày sinh là bắt buộc" })
  .superRefine((value, context) => {
    if (!z.iso.date().safeParse(value).success) {
      context.addIssue({ code: "custom", message: "Ngày sinh không hợp lệ" })
    } else if (value > todayIso()) {
      context.addIssue({ code: "custom", message: "Ngày sinh không được ở tương lai" })
    }
  })

const identificationIssueDateSchema = z.string().superRefine((value, context) => {
  if (value === "") return
  if (!z.iso.date().safeParse(value).success) {
    context.addIssue({ code: "custom", message: "Ngày cấp CCCD không hợp lệ" })
  } else if (value > todayIso()) {
    context.addIssue({ code: "custom", message: "Ngày cấp CCCD không được ở tương lai" })
  }
})

const optionalText = (label: string, max = PARTICIPANT_TEXT_MAX_LENGTH) =>
  z
    .string()
    .trim()
    .max(max, {
      message: `${label} không được vượt quá ${max} ký tự`,
    })

const requiredText = (label: string) =>
  optionalText(label).min(1, { message: `${label} là bắt buộc` })

/**
 * Form rules for adding or editing one Participant. They only catch typing mistakes early: the
 * backend decides (duplicate CCCD, locked CCCD, batch state and days are checked there).
 */
export const participantFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Họ và tên là bắt buộc" })
    .max(PARTICIPANT_NAME_MAX_LENGTH, {
      message: `Họ và tên không được vượt quá ${PARTICIPANT_NAME_MAX_LENGTH} ký tự`,
    }),
  dateOfBirth: dateOfBirthSchema,
  sex: sexSchema,
  identificationNumber: z
    .string()
    .trim()
    .min(1, { message: "CCCD là bắt buộc" })
    .regex(new RegExp(`^\\d{1,${PARTICIPANT_IDENTIFICATION_MAX_LENGTH}}$`), {
      message: `CCCD chỉ gồm chữ số, tối đa ${PARTICIPANT_IDENTIFICATION_MAX_LENGTH} số`,
    }),
  identificationIssueDate: identificationIssueDateSchema,
  identificationIssuePlace: optionalText("Nơi cấp CCCD"),
  ethnicity: optionalText("Dân tộc"),
  phone: optionalText("Số điện thoại"),
  email: optionalText("Email").refine((value) => value === "" || z.email().safeParse(value).success, {
    message: "Email không hợp lệ",
  }),
  address: optionalText("Chỗ ở", PARTICIPANT_ADDRESS_MAX_LENGTH),
  workplace: optionalText("Nơi làm việc"),
  departmentName: requiredText("Đơn vị/Phòng ban"),
  positionName: requiredText("Chức vụ"),
  note: optionalText("Ghi chú", PARTICIPANT_NOTE_MAX_LENGTH),
  batchDayId: z.string().min(1, { message: "Vui lòng chọn ngày khám" }),
})

export type ParticipantFormSchemaValues = z.input<typeof participantFormSchema>
export type ValidatedParticipantFormValues = z.output<typeof participantFormSchema>
