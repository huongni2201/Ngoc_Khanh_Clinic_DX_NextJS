import { describe, expect, it } from "vitest"
import { batchServerFieldIssue, batchServerFieldIssues } from "../utils/batch-server-errors"

describe("batch server field errors", () => {
  it("points an empty service selection at the services section", () => {
    expect(batchServerFieldIssue({ field: "services", code: "NotEmpty" })).toEqual({
      target: "services",
      message: "Vui lòng chọn ít nhất một hạng mục khám.",
    })
  })

  it("names a required field the form does not send, so an outdated backend is visible", () => {
    const issue = batchServerFieldIssue({ field: "examinationSiteName", code: "NotBlank" })

    expect(issue.target).toBeNull()
    expect(issue.message).toContain('"examinationSiteName"')
    expect(issue.message).toContain("khởi động lại backend")
  })

  it("maps a negotiated price to its table row and drops duplicate messages", () => {
    const issues = batchServerFieldIssues([
      { field: "services[2].negotiatedPrice", code: "NotNull" },
      { field: "services[2].negotiatedPrice", code: "NotNull" },
    ])

    expect(issues).toEqual([
      { target: "services.2.negotiatedPrice", message: "Giá thỏa thuận là bắt buộc." },
    ])
  })

  it("maps the batch name and the organization-site address to their inputs", () => {
    expect(batchServerFieldIssue({ field: "batchName", code: "NotBlank" }).target).toBe("batchName")
    expect(batchServerFieldIssue({ field: "examinationSiteAddress", code: "AssertTrue" })).toEqual({
      target: "examinationSiteAddress",
      message: "Địa chỉ địa điểm khám là bắt buộc khi khám tại đơn vị.",
    })
  })
})
