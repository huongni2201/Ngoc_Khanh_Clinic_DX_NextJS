import { z } from "zod"

/**
 * Rules of the manual entry sheet, mirrored from the backend so the user sees the problem before
 * a request is sent. The backend stays the authority.
 */
export function createExaminationEntrySchema(limits: { startDate?: string; today: string }) {
  return z
    .object({
      attendanceStatus: z.enum(["ATTENDED", "ABSENT"]),
      actualExaminationDate: z.string(),
      performedBatchServiceIds: z.array(z.string().min(1)),
    })
    .superRefine((value, context) => {
      if (value.attendanceStatus === "ABSENT") {
        if (value.performedBatchServiceIds.length > 0) {
          context.addIssue({
            code: "custom",
            path: ["performedBatchServiceIds"],
            message: "Người khám vắng không có hạng mục đã khám.",
          })
        }
        return
      }

      const date = value.actualExaminationDate
      if (!date) {
        context.addIssue({
          code: "custom",
          path: ["actualExaminationDate"],
          message: "Ngày khám thực tế là bắt buộc.",
        })
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        context.addIssue({
          code: "custom",
          path: ["actualExaminationDate"],
          message: "Ngày khám thực tế không hợp lệ.",
        })
      } else if ((limits.startDate && date < limits.startDate) || date > limits.today) {
        context.addIssue({
          code: "custom",
          path: ["actualExaminationDate"],
          message: "Ngày khám thực tế phải từ ngày bắt đầu đợt khám đến hôm nay.",
        })
      }

      if (value.performedBatchServiceIds.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["performedBatchServiceIds"],
          message: "Chọn ít nhất một hạng mục đã khám.",
        })
      }
    })
}

export type ExaminationEntryFieldErrors = Partial<
  Record<"actualExaminationDate" | "performedBatchServiceIds", string>
>

/** First message per field, or an empty object when the values are valid. */
export function validateExaminationEntry(
  values: unknown,
  limits: { startDate?: string; today: string }
): ExaminationEntryFieldErrors {
  const result = createExaminationEntrySchema(limits).safeParse(values)
  if (result.success) return {}
  const errors: ExaminationEntryFieldErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (
      (field === "actualExaminationDate" || field === "performedBatchServiceIds") &&
      !errors[field]
    ) {
      errors[field] = issue.message
    }
  }
  return errors
}
