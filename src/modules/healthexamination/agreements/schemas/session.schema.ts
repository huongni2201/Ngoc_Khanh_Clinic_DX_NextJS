import { z } from "zod"
import { SESSION_ACTIVITIES } from "../types/transport"

export const SESSION_ADDRESS_MAX_LENGTH = 1000

/**
 * Form rules for one session. They only catch typing mistakes early: the backend decides (a repeated
 * open slot, an ended agreement and a cancelled session are checked there).
 */
export const sessionFormSchema = z
  .object({
    sessionDate: z
      .string()
      .min(1, { message: "Ngày khám là bắt buộc" })
      .refine((value) => z.iso.date().safeParse(value).success, {
        message: "Ngày khám không hợp lệ",
      }),
    activity: z.enum(SESSION_ACTIVITIES, { error: "Loại hoạt động là bắt buộc" }),
    siteType: z.enum(["CLINIC", "ORGANIZATION_SITE"], { error: "Địa điểm là bắt buộc" }),
    siteAddress: z
      .string()
      .trim()
      .max(SESSION_ADDRESS_MAX_LENGTH, {
        message: `Địa chỉ không được vượt quá ${SESSION_ADDRESS_MAX_LENGTH} ký tự`,
      }),
    /** Create only: reserve the session to the agreement the dialog was opened from. */
    reserveForAgreement: z.boolean(),
  })
  .superRefine((data, context) => {
    if (data.siteType === "ORGANIZATION_SITE" && !data.siteAddress) {
      context.addIssue({
        code: "custom",
        message: "Địa chỉ nơi khám tại đơn vị là bắt buộc",
        path: ["siteAddress"],
      })
    }
  })

export type SessionFormInputValues = z.input<typeof sessionFormSchema>
export type SessionFormValues = z.output<typeof sessionFormSchema>
