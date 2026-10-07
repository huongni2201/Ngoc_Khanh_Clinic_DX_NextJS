import { describe, expect, it } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"
import { describeExaminationDetailImportError } from "../utils/examination-detail-import-errors"

const fail = (status: number, serverMessage?: string) =>
  new ApiClientError("generic", status, status, serverMessage)

describe("describeExaminationDetailImportError", () => {
  it.each([
    [400, 'Row 7: column "Xét nghiệm máu" accepts only X or blank', 7, false, /Dòng 7.*Xét nghiệm máu.*chữ X/],
    [400, "Row 3: participant_id is required", 3, true, /Dòng 3.*cột ẩn/],
    [400, "Row 3: row_version is not valid", 3, true, /Dòng 3.*cột ẩn/],
    [400, "Row 4: actual_examination_date must be a text date in yyyy-MM-dd format", 4, false, /Dòng 4.*yyyy-MM-dd/],
    [400, "Row 4: actual_examination_date must be between the batch start date and today", 4, false, /Dòng 4.*đến hôm nay/],
    [400, "Row 6: participant appears more than once (first at row 3)", 6, false, /Dòng 6.*dòng 3/],
    [409, "Row 5: participant is not in this batch", 5, true, /Dòng 5.*không thuộc đợt khám/],
    [409, "Row 5: participant is cancelled", 5, true, /Dòng 5.*đã bị hủy/],
    [409, "Row 9: participant was changed after export; export again", 9, true, /Dòng 9.*sau khi xuất file/],
    [409, "Row 12: a marked service is no longer offered in this batch", 12, true, /Dòng 12.*không còn/],
  ] as const)("describes %i %s with its row", (status, text, row, needsNewExport, pattern) => {
    const failure = describeExaminationDetailImportError(fail(status, text))
    expect(failure.rowNumber).toBe(row)
    expect(failure.needsNewExport).toBe(needsNewExport)
    expect(failure.message).toMatch(pattern)
    expect(failure.retryable).toBe(false)
  })

  it.each([
    "The file does not match this batch; export it again",
    "The file layout is not valid; export it again",
    "The file was made with an older template; export it again",
    "The ChiTietKham sheet is missing; export the file again",
    "Merged cells are not allowed in the ChiTietKham sheet",
  ])("asks for a new export when the file is stale: %s", (text) => {
    const failure = describeExaminationDetailImportError(fail(400, text))
    expect(failure.needsNewExport).toBe(true)
    expect(failure.rowNumber).toBeUndefined()
  })

  it("explains a batch that no longer accepts changes", () => {
    const failure = describeExaminationDetailImportError(
      fail(409, "Batch does not accept examination detail changes")
    )
    expect(failure.message).toMatch(/Nháp\/Sẵn sàng/)
    expect(failure.needsNewExport).toBe(false)
  })

  it("marks a request that is still being processed as retryable", () => {
    const failure = describeExaminationDetailImportError(
      fail(409, "A request with this idempotency key is still being processed")
    )
    expect(failure.retryable).toBe(true)
  })

  it("asks for a new file when the key belongs to another request", () => {
    const failure = describeExaminationDetailImportError(
      fail(409, "Idempotency key was used for another request")
    )
    expect(failure.message).toMatch(/chọn lại file/)
  })

  it("never shows the English backend text and falls back to the status", () => {
    const failure = describeExaminationDetailImportError(fail(409, "Something unexpected happened"))
    expect(failure.message).not.toMatch(/Something unexpected/)
    expect(failure.needsNewExport).toBe(true)
    expect(describeExaminationDetailImportError(fail(400, "unknown")).message).toMatch(/không hợp lệ/)
    expect(describeExaminationDetailImportError(fail(413)).message).toMatch(/5 MB/)
    expect(describeExaminationDetailImportError(fail(415)).message).toMatch(/\.xlsx/)
    expect(describeExaminationDetailImportError(fail(403)).message).toMatch(/quyền/)
  })

  it("allows a retry only for a lost connection or a server error", () => {
    expect(describeExaminationDetailImportError(fail(0)).retryable).toBe(true)
    expect(describeExaminationDetailImportError(fail(503)).retryable).toBe(true)
    expect(describeExaminationDetailImportError(fail(404)).retryable).toBe(false)
    expect(describeExaminationDetailImportError(new Error("boom")).retryable).toBe(false)
  })
})
