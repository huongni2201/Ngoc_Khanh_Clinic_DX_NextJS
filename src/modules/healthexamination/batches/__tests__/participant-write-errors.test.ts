import { describe, expect, it } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"
import { describeParticipantWriteError } from "../utils/participant-write-errors"

const conflict = (message: string) => new ApiClientError("x", 409, 409, message)

describe("reactivate refusals", () => {
  it("explains a Participant that is no longer cancelled", () => {
    const failure = describeParticipantWriteError(
      conflict("Participant is not cancelled"),
      "reactivate"
    )
    expect(failure.kind).toBe("not-cancelled")
    expect(failure.message).toMatch(/không còn ở trạng thái Đã hủy/)
    expect(failure.message).toMatch(/Danh sách đã được tải lại/)
  })

  it("explains a Participant that cannot come back after preparation or attendance", () => {
    const failure = describeParticipantWriteError(
      conflict("Participant cannot be reactivated after preparation or attendance"),
      "reactivate"
    )
    expect(failure.kind).toBe("reactivate-blocked")
    expect(failure.message).toMatch(/Không thể khôi phục người khám/)
  })

  it("keeps the shared rules for the other reactivate refusals", () => {
    expect(
      describeParticipantWriteError(conflict("Record was changed by another request"), "reactivate").kind
    ).toBe("stale-version")
    expect(
      describeParticipantWriteError(conflict("Batch does not accept Participant changes"), "reactivate").kind
    ).toBe("closed-batch")
    expect(
      describeParticipantWriteError(conflict("Examination day is not a day of this batch"), "reactivate").kind
    ).toBe("invalid-day")
  })

  it("words a missing permission for reactivating, and leaves the other actions as they were", () => {
    const forbidden = new ApiClientError("x", 403, 403, "Forbidden")
    expect(describeParticipantWriteError(forbidden, "reactivate").message).toBe(
      "Bạn không có quyền khôi phục người khám."
    )
    expect(describeParticipantWriteError(forbidden, "cancel").message).toBe(
      "Bạn không có quyền thêm, sửa hoặc hủy người khám."
    )
  })

  it("never shows the English backend text", () => {
    const failure = describeParticipantWriteError(conflict("Something new"), "reactivate")
    expect(failure.kind).toBe("unknown")
    expect(failure.message).not.toMatch(/Something new/)
  })
})
