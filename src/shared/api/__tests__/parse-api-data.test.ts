import { describe, expect, it } from "vitest"
import { z } from "zod"
import { parseApiData } from "../parse-api-data"

describe("parseApiData", () => {
  const schema = z.object({ name: z.string(), active: z.boolean() })

  it("preserves valid server data", () => {
    expect(parseApiData(schema, { name: "Khoa Nội", active: true })).toEqual({ name: "Khoa Nội", active: true })
  })

  it("shows Vietnamese copy and retains schema diagnostics as the cause", () => {
    let error: unknown
    try { parseApiData(schema, { name: 123 }) } catch (failure) { error = failure }
    expect(error).toBeInstanceOf(Error)
    expect(error).toMatchObject({
      message: "Dữ liệu phản hồi từ máy chủ không hợp lệ. Vui lòng tải lại hoặc liên hệ quản trị viên.",
      cause: expect.any(z.ZodError),
    })
    expect((error as Error).message).not.toContain("Invalid input")
  })
})
