import { describe, expect, it } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"
import { describeSchedulingError, type SchedulingAction } from "../utils/session-errors"

const conflict = (message?: string) => new ApiClientError("generic", 409, 409, message)

describe("describeSchedulingError", () => {
  it("explains a stale version and asks to reload, whatever the action", () => {
    const failure = describeSchedulingError(
      conflict("Record was changed by another request"),
      "move"
    )

    expect(failure.kind).toBe("stale")
    expect(failure.message).toMatch(/tải lại/)
  })

  it.each([
    ["create-session", /cùng ngày, địa điểm và loại hoạt động/],
    ["update-session", /cùng ngày, địa điểm và loại hoạt động/],
    ["cancel-session", /còn người được xếp/],
    ["assign", /đã bị hủy, thỏa thuận đã kết thúc/],
    ["move", /đã có trong lịch đích/],
    ["move-all", /Chưa người nào bị dời/],
    ["cancel-assignment", /đã đến khám/],
    ["attendance", /chưa tới ngày/],
  ] as const)("words the conflict of %s", (action: SchedulingAction, expected) => {
    const failure = describeSchedulingError(conflict("Something the backend said"), action)

    expect(failure.kind).toBe("conflict")
    expect(failure.message).toMatch(expected)
    expect(failure.message).not.toContain("Something the backend said")
  })

  it("names the action when the account lacks the permission", () => {
    const failure = describeSchedulingError(new ApiClientError("x", 403, 403), "assign")

    expect(failure).toEqual({
      kind: "forbidden",
      message: "Tài khoản của bạn chưa được cấp quyền xếp lịch cho người khám.",
    })
  })

  it("maps the other statuses and never shows backend English", () => {
    const status = (code: number) =>
      describeSchedulingError(new ApiClientError("English text", code, code, "English text"), "move")

    expect(status(0).kind).toBe("network")
    expect(status(401).kind).toBe("forbidden")
    expect(status(404).kind).toBe("not-found")
    expect(status(400).kind).toBe("invalid")
    expect(status(500).kind).toBe("other")
    for (const code of [401, 404, 400, 500]) {
      expect(status(code).message).not.toContain("English text")
    }
    expect(describeSchedulingError(new Error("boom"), "move")).toEqual({
      kind: "other",
      message: "Không thể đổi lịch khám. Vui lòng thử lại.",
    })
  })
})
