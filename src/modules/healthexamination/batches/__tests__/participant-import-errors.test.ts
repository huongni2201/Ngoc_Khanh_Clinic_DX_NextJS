import { describe, expect, it } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"
import {
  describeParticipantImportError,
  validateParticipantImportFile,
} from "../utils/participant-import-errors"

const fail = (status: number, serverMessage?: string) =>
  describeParticipantImportError(new ApiClientError("raw", status, status, serverMessage))

describe("describeParticipantImportError", () => {
  it.each([
    ["Row 5: full_name is required", 5, /Dòng 5.*Họ và tên/],
    ["Row 6: date_of_birth must be a text cell", 6, /Dòng 6.*Ngày sinh.*văn bản/],
    ["Row 7: phone is too long", 7, /Dòng 7.*Số điện thoại.*quá dài/],
    ["Row 8: date_of_birth must be a text date in yyyy-MM-dd format", 8, /Dòng 8.*yyyy-MM-dd/],
    ["Row 9: there is a value outside the template columns", 9, /Dòng 9.*ngoài/],
    ["Row 10: identification_number must be 1 to 20 digits", 10, /Dòng 10.*CCCD/],
    ["Row 11: examination_date is not a day of this batch", 11, /Dòng 11.*Ngày khám/],
    ["Participant identity already exists in this batch at row 12", 12, /Dòng 12.*CCCD đã có/],
  ])("maps %s to Vietnamese with the row number", (message, row, pattern) => {
    const failure = fail(400, message)
    expect(failure.rowNumber).toBe(row)
    expect(failure.message).toMatch(pattern)
    expect(failure.message).not.toMatch(/Row |is required|must be/)
    expect(failure.retryable).toBe(false)
  })

  it("reports a duplicate inside the file with both rows", () => {
    const failure = fail(400, "Duplicate participant identity at rows 3 and 8")
    expect(failure.message).toMatch(/dòng 3 và dòng 8/)
  })

  it("asks for a new template when the workbook version no longer matches", () => {
    const failure = fail(
      400,
      "The workbook does not match this batch version; download the template again"
    )
    expect(failure.needsNewTemplate).toBe(true)
    expect(failure.message).toMatch(/tải lại file mẫu/)
  })

  it("asks for a new template after a stale-version conflict", () => {
    const failure = fail(409, "Record was changed by another request")
    expect(failure.needsNewTemplate).toBe(true)
  })

  it("explains that the batch no longer accepts Participants", () => {
    expect(fail(409, "Batch does not accept Participant imports").message).toMatch(/không còn nhận/)
  })

  it("marks an in-flight idempotent request as retryable", () => {
    const failure = fail(409, "A request with this idempotency key is still being processed")
    expect(failure.retryable).toBe(true)
  })

  it("never renders unknown English backend text", () => {
    const failure = fail(400, "Something unexpected in English")
    expect(failure.message).not.toMatch(/English|unexpected/)
    expect(failure.message).toMatch(/không hợp lệ/)
  })

  it.each([
    [0, true, "kết nối"],
    [401, false, "đăng nhập"],
    [403, false, "quyền"],
    [404, false, "Không tìm thấy"],
    [413, false, "5 MB"],
    [415, false, ".xlsx"],
    [500, true, "Máy chủ"],
  ])("maps status %s", (status, retryable, text) => {
    const failure = fail(status)
    expect(failure.retryable).toBe(retryable)
    expect(failure.message).toContain(text)
  })

  it("handles a non-API error", () => {
    expect(describeParticipantImportError(new Error("boom")).message).not.toContain("boom")
  })
})

describe("validateParticipantImportFile", () => {
  it("accepts a normal .xlsx file", () => {
    expect(validateParticipantImportFile({ name: "A.XLSX", size: 100 }, 1000)).toBeNull()
  })
  it("rejects other extensions, empty and oversized files", () => {
    expect(validateParticipantImportFile({ name: "a.csv", size: 100 }, 1000)).toMatch(/\.xlsx/)
    expect(validateParticipantImportFile({ name: "a.xlsx", size: 0 }, 1000)).toMatch(/rỗng/)
    expect(validateParticipantImportFile({ name: "a.xlsx", size: 1001 }, 1000)).toMatch(/vượt quá/)
  })
})
