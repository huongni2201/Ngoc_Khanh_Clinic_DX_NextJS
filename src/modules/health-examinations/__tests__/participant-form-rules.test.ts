import { describe, expect, it } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"
import { participantFormSchema } from "../schemas/participant.schema"
import {
  buildEmptyParticipantFormValues,
  buildParticipantFormValues,
  toParticipantInput,
} from "../utils/participant-form-values"
import {
  getParticipantCancelBlockReason,
  isParticipantChangeAllowed,
} from "../utils/participant-labels"
import { describeParticipantWriteError } from "../utils/participant-write-errors"

const valid = {
  participantCode: "",
  fullName: "Nguyễn Văn A",
  dateOfBirth: "1990-03-14",
  sex: "MALE",
  identificationNumber: "012345678901",
  phone: "",
  email: "",
  departmentName: "Phòng Kế toán",
  positionName: "Kế toán viên",
  batchDayId: "day-1",
}

function messages(values: Record<string, unknown>) {
  const result = participantFormSchema.safeParse(values)
  if (result.success) return []
  return result.error.issues.map((issue) => `${String(issue.path[0])}: ${issue.message}`)
}

describe("participantFormSchema", () => {
  it("accepts a complete form and trims text", () => {
    const parsed = participantFormSchema.parse({ ...valid, fullName: "  An  ", identificationNumber: " 123 " })
    expect(parsed.fullName).toBe("An")
    expect(parsed.identificationNumber).toBe("123")
  })

  it("requires the mandatory fields", () => {
    const issues = messages({
      ...valid,
      fullName: " ",
      dateOfBirth: "",
      sex: "",
      identificationNumber: "",
      departmentName: "",
      positionName: "",
      batchDayId: "",
    })
    expect(issues).toEqual(
      expect.arrayContaining([
        "fullName: Họ và tên là bắt buộc",
        "dateOfBirth: Ngày sinh là bắt buộc",
        "sex: Giới tính là bắt buộc",
        "identificationNumber: CCCD là bắt buộc",
        "departmentName: Đơn vị/Phòng ban là bắt buộc",
        "positionName: Chức vụ là bắt buộc",
        "batchDayId: Vui lòng chọn ngày khám",
      ])
    )
  })

  it("accepts a CCCD of digits only, at most 20", () => {
    expect(messages({ ...valid, identificationNumber: "12a45" })).toEqual([
      "identificationNumber: CCCD chỉ gồm chữ số, tối đa 20 số",
    ])
    expect(messages({ ...valid, identificationNumber: "1".repeat(21) })).toHaveLength(1)
    expect(messages({ ...valid, identificationNumber: "1".repeat(20) })).toEqual([])
  })

  it("rejects a future or malformed date of birth", () => {
    expect(messages({ ...valid, dateOfBirth: "2999-01-01" })).toEqual([
      "dateOfBirth: Ngày sinh không được ở tương lai",
    ])
    expect(messages({ ...valid, dateOfBirth: "31/12/1990" })).toEqual(["dateOfBirth: Ngày sinh không hợp lệ"])
  })

  it("validates the email only when it is filled", () => {
    expect(messages({ ...valid, email: "khong-hop-le" })).toEqual(["email: Email không hợp lệ"])
    expect(messages({ ...valid, email: "an@example.com" })).toEqual([])
  })

  it("limits the name to 200 and other text to 500 characters", () => {
    expect(messages({ ...valid, fullName: "a".repeat(201) })).toHaveLength(1)
    expect(messages({ ...valid, phone: "1".repeat(501) })).toHaveLength(1)
  })
})

describe("participant form values", () => {
  it("starts empty, on the only day when there is one", () => {
    expect(buildEmptyParticipantFormValues("day-1").batchDayId).toBe("day-1")
    expect(buildEmptyParticipantFormValues().batchDayId).toBe("")
  })

  it("fills the edit form from the detail, using the full CCCD", () => {
    const values = buildParticipantFormValues({
      id: "p-1",
      batchId: "batch-1",
      batchDayId: "day-2",
      examinationDate: "2026-10-21",
      fullName: "An",
      dateOfBirth: "1990-03-14",
      sex: "FEMALE",
      identificationNumberMasked: "********8901",
      identificationNumber: "012345678901",
      departmentName: "KT",
      positionName: "NV",
      rosterStatus: "ACTIVE",
      attendanceStatus: "UNCONFIRMED",
      reconciliationStatus: "PENDING",
      rowVersion: 1,
      patientLinked: false,
      source: "MANUAL",
      createdAt: "",
      updatedAt: "",
    } as never)
    expect(values.identificationNumber).toBe("012345678901")
    expect(values.phone).toBe("")
    expect(values.batchDayId).toBe("day-2")
  })

  it("drops blank optional text when building the request input", () => {
    const parsed = participantFormSchema.parse(valid)
    const built = toParticipantInput(parsed)
    expect(built.participantCode).toBeUndefined()
    expect(built.phone).toBeUndefined()
    expect(built.email).toBeUndefined()
  })
})

describe("change and cancel rules shown in the list", () => {
  it("allows changes only for Draft and Ready batches", () => {
    expect(isParticipantChangeAllowed("DRAFT")).toBe(true)
    expect(isParticipantChangeAllowed("READY")).toBe(true)
    expect(isParticipantChangeAllowed("FINALIZED")).toBe(false)
    expect(isParticipantChangeAllowed("CLOSED")).toBe(false)
  })

  it("explains why a prepared, attended or reconciled Participant cannot be cancelled", () => {
    const base = { attendanceStatus: "UNCONFIRMED", reconciliationStatus: "PENDING" } as const
    expect(getParticipantCancelBlockReason(base)).toBeNull()
    expect(getParticipantCancelBlockReason({ ...base, preparedAt: "2026-10-07T01:00:00Z" })).not.toBeNull()
    expect(getParticipantCancelBlockReason({ ...base, attendanceStatus: "ATTENDED" })).not.toBeNull()
    expect(getParticipantCancelBlockReason({ ...base, reconciliationStatus: "RECONCILED" })).not.toBeNull()
  })
})

describe("describeParticipantWriteError", () => {
  const conflict = (message?: string) => new ApiClientError("x", 409, 409, message)

  it.each([
    ["Participant identity already exists in this batch", "duplicate-identity"],
    ["Record was changed by another request", "stale-version"],
    ["Identification number is locked after visit preparation", "identity-locked"],
    ["Participant is cancelled", "cancelled"],
    ["Participant cannot be cancelled after preparation or attendance", "cannot-cancel"],
    ["Batch does not accept Participant changes", "closed-batch"],
    ["Examination day is not a day of this batch", "invalid-day"],
  ])("maps the 409 %s to %s", (text, kind) => {
    expect(describeParticipantWriteError(conflict(text)).kind).toBe(kind)
  })

  it("keeps an unknown 409 neutral and never shows backend English text", () => {
    const failure = describeParticipantWriteError(conflict("Something new"))
    expect(failure.kind).toBe("unknown")
    expect(failure.message).not.toContain("Something new")
  })

  it("maps the other statuses", () => {
    const status = (code: number) => describeParticipantWriteError(new ApiClientError("x", code, code))
    expect(status(0).kind).toBe("network")
    expect(status(400).kind).toBe("invalid")
    expect(status(401).kind).toBe("unauthenticated")
    expect(status(403).kind).toBe("forbidden")
    expect(status(404).kind).toBe("not-found")
    expect(status(500).kind).toBe("unknown")
    expect(describeParticipantWriteError(new Error("boom")).kind).toBe("unknown")
  })
})
