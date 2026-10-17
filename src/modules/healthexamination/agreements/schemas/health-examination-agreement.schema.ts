import { z } from "zod"

export const healthExaminationAgreementItemFormSchema = z.object({
  serviceId: z.string().min(1),
  code: z.string(),
  name: z.string(),
  /** Catalog price shown for reference; it is never sent to the backend. */
  referencePrice: z.number().nonnegative(),
  selected: z.boolean(),
  negotiatedPrice: z.number().int().nonnegative(),
})

export type HealthExaminationAgreementServiceFormValue = z.infer<
  typeof healthExaminationAgreementItemFormSchema
>

export const AGREEMENT_NAME_MAX_LENGTH = 300

const optionalDate = z.union([
  z.literal(""),
  z.iso.date({ error: "Ngày phải có định dạng yyyy-MM-dd" }),
])

export const healthExaminationAgreementFormSchema = z
  .object({
    agreementName: z
      .string()
      .trim()
      .min(1, { message: "Tên thỏa thuận là bắt buộc" })
      .max(AGREEMENT_NAME_MAX_LENGTH, {
        message: `Tên thỏa thuận không được vượt quá ${AGREEMENT_NAME_MAX_LENGTH} ký tự`,
      }),
    /** First day the agreement applies; empty means no start limit. */
    validFrom: optionalDate,
    /** Last day the agreement applies; empty means no end limit. */
    validTo: optionalDate,
    services: z.array(healthExaminationAgreementItemFormSchema),
  })
  .superRefine((data, context) => {
    if (data.validFrom && data.validTo && data.validFrom > data.validTo) {
      context.addIssue({
        code: "custom",
        message: "Ngày bắt đầu hiệu lực không được sau ngày kết thúc.",
        path: ["validTo"],
      })
    }

    if (!data.services.some((item) => item.selected)) {
      context.addIssue({
        code: "custom",
        message: "Vui lòng chọn ít nhất một hạng mục khám.",
        path: ["services"],
      })
    }
  })

export type HealthExaminationAgreementFormValues = z.input<typeof healthExaminationAgreementFormSchema>

export type ValidatedHealthExaminationAgreementFormValues = z.output<
  typeof healthExaminationAgreementFormSchema
>
