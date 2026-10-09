import { z } from "zod"

export const healthExaminationBatchItemFormSchema = z.object({
  serviceId: z.string().min(1),
  code: z.string(),
  name: z.string(),
  /** Catalog price shown for reference; it is never sent to the backend. */
  referencePrice: z.number().nonnegative(),
  selected: z.boolean(),
  negotiatedPrice: z.number().int().nonnegative(),
})

export type HealthExaminationBatchServiceFormValue = z.infer<
  typeof healthExaminationBatchItemFormSchema
>

const examinationSiteTypeSchema = z
  .union([z.literal(""), z.enum(["CLINIC", "ORGANIZATION_SITE"])])
  .transform((value, context) => {
    if (value === "") {
      context.addIssue({ code: "custom", message: "Loại địa điểm là bắt buộc" })
      return z.NEVER
    }
    return value
  })

export const BATCH_NAME_MAX_LENGTH = 300

export const healthExaminationBatchFormSchema = z
  .object({
    batchName: z
      .string()
      .trim()
      .min(1, { message: "Tên đợt khám là bắt buộc" })
      .max(BATCH_NAME_MAX_LENGTH, {
        message: `Tên đợt khám không được vượt quá ${BATCH_NAME_MAX_LENGTH} ký tự`,
      }),
    examinationDates: z
      .array(z.iso.date({ error: "Ngày phải có định dạng yyyy-MM-dd" }))
      .min(1, { message: "Vui lòng chọn ít nhất một ngày khám." }),
    examinationSiteType: examinationSiteTypeSchema,
    examinationSiteName: z.string().trim().min(1, { message: "Tên địa điểm khám là bắt buộc" }),
    examinationSiteAddress: z
      .string()
      .trim()
      .min(1, { message: "Địa chỉ địa điểm khám là bắt buộc" }),
    services: z.array(healthExaminationBatchItemFormSchema),
  })
  .superRefine((data, context) => {
    if (new Set(data.examinationDates).size !== data.examinationDates.length) {
      context.addIssue({
        code: "custom",
        message: "Ngày khám không được trùng nhau.",
        path: ["examinationDates"],
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

export type HealthExaminationBatchFormValues = z.input<typeof healthExaminationBatchFormSchema>

export type ValidatedHealthExaminationBatchFormValues = z.output<
  typeof healthExaminationBatchFormSchema
>
