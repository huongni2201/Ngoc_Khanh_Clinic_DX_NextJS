import { z } from "zod"

export const healthExaminationBatchItemFormSchema = z.object({
  examinationItemId: z.string(),
  name: z.string(),
  selected: z.boolean(),
  unitPrice: z.number().nonnegative(),
})

export type HealthExaminationBatchItemFormValue = z.infer<typeof healthExaminationBatchItemFormSchema>

export const createHealthExaminationBatchSchema = z
  .object({
    enterpriseId: z.string().min(1, { message: "Doanh nghiệp là bắt buộc" }),
    name: z
      .string()
      .trim()
      .min(1, { message: "Tên đợt khám là bắt buộc" }),
    location: z
      .string()
      .trim()
      .min(1, { message: "Địa điểm khám là bắt buộc" }),
    examDate: z
      .string()
      .trim()
      .min(1, { message: "Ngày khám là bắt buộc" }),
    note: z.string().trim().optional(),
    items: z.array(healthExaminationBatchItemFormSchema),
  })
  .superRefine((data, ctx) => {
    // 1. Must select at least 1 item
    const selectedItems = data.items.filter((item) => item.selected)
    if (selectedItems.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng chọn ít nhất một hạng mục khám.",
        path: ["items"],
      })
    }

    // 2. All selected items must have unitPrice > 0
    data.items.forEach((item, index) => {
      if (item.selected && item.unitPrice <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Đơn giá phải lớn hơn 0.",
          path: ["items", index, "unitPrice"],
        })
      }
    })
  })

export type CreateHealthExaminationBatchFormValues = z.infer<typeof createHealthExaminationBatchSchema>
