import { z } from "zod"

export const healthExaminationBatchItemFormSchema = z.object({
  serviceId: z.string().min(1),
  name: z.string(),
  selected: z.boolean(),
  unitPrice: z.number().nonnegative(),
})

export type HealthExaminationBatchServiceFormValue = z.infer<
  typeof healthExaminationBatchItemFormSchema
>

const optionalDateSchema = z.string().trim().pipe(
  z.union([
    z.literal(""),
    z.iso.date({ error: "Ngày phải có định dạng yyyy-MM-dd" }),
  ])
)

const examinationSiteTypeSchema = z
  .union([z.literal(""), z.enum(["CLINIC", "COMPANY"])])
  .transform((value, context) => {
    if (value === "") {
      context.addIssue({ code: "custom", message: "Loại địa điểm là bắt buộc" })
      return z.NEVER
    }
    return value
  })

export const createHealthExaminationBatchSchema = z
  .object({
    organizationId: z.string().min(1, { message: "Đơn vị là bắt buộc" }),
    batchCode: z
      .string()
      .trim()
      .min(1, { message: "Mã đợt khám là bắt buộc" })
      .max(40, { message: "Mã đợt khám không được vượt quá 40 ký tự" }),
    batchName: z
      .string()
      .trim()
      .min(1, { message: "Tên đợt khám là bắt buộc" })
      .max(250, { message: "Tên đợt khám không được vượt quá 250 ký tự" }),
    startDate: optionalDateSchema,
    endDate: optionalDateSchema,
    reason: z.string().trim().max(300, "Lý do khám không được vượt quá 300 ký tự").optional(),
    payerType: z.string().trim().max(24, "Loại bên chi trả không được vượt quá 24 ký tự").optional(),
    examinationSiteType: examinationSiteTypeSchema,
    examinationSiteName: z
      .string()
      .trim()
      .min(1, { message: "Tên địa điểm khám là bắt buộc" })
      .max(250),
    examinationSiteAddress: z.string().trim().max(500, "Địa chỉ không được vượt quá 500 ký tự").optional(),
    services: z.array(healthExaminationBatchItemFormSchema),
  })
  .superRefine((data, context) => {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      context.addIssue({
        code: "custom",
        message: "Ngày kết thúc không được trước ngày bắt đầu",
        path: ["endDate"],
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

export type CreateHealthExaminationBatchFormValues = z.input<
  typeof createHealthExaminationBatchSchema
>

export type ValidatedHealthExaminationBatchFormValues = z.output<
  typeof createHealthExaminationBatchSchema
>
