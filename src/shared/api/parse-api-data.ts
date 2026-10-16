import type { z } from "zod"

/** Keep schema diagnostics available for debugging without showing English library errors to staff. */
export function parseApiData<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error("Dữ liệu phản hồi từ máy chủ không hợp lệ. Vui lòng tải lại hoặc liên hệ quản trị viên.", {
      cause: result.error,
    })
  }
  return result.data
}
