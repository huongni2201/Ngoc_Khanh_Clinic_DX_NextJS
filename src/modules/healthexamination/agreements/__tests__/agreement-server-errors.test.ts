import { describe, expect, it } from "vitest"
import { agreementServerFieldIssue, agreementServerFieldIssues } from "../utils/agreement-server-errors"

describe("agreement server field errors", () => {
  it("points an empty service selection at the services section", () => {
    expect(agreementServerFieldIssue({ field: "services", code: "NotEmpty" })).toEqual({
      target: "services",
      message: "Vui lòng chọn ít nhất một hạng mục khám.",
    })
  })

  it("names a required field the form does not send, so an outdated backend is visible", () => {
    const issue = agreementServerFieldIssue({ field: "someNewField", code: "NotBlank" })

    expect(issue.target).toBeNull()
    expect(issue.message).toContain('"someNewField"')
    expect(issue.message).toContain("khởi động lại backend")
  })

  it("maps a negotiated price to its table row and drops duplicate messages", () => {
    const issues = agreementServerFieldIssues([
      { field: "services[2].negotiatedPrice", code: "NotNull" },
      { field: "services[2].negotiatedPrice", code: "NotNull" },
    ])

    expect(issues).toEqual([
      { target: "services.2.negotiatedPrice", message: "Giá thỏa thuận là bắt buộc." },
    ])
  })

  it("maps the agreement name and the validity dates to their inputs", () => {
    expect(agreementServerFieldIssue({ field: "agreementName", code: "NotBlank" }).target).toBe("agreementName")
    expect(agreementServerFieldIssue({ field: "validFrom", code: "Invalid" })).toEqual({
      target: "validFrom",
      message: "Ngày bắt đầu hiệu lực không hợp lệ.",
    })
    expect(agreementServerFieldIssue({ field: "validityPeriodValid", code: "AssertTrue" })).toEqual({
      target: "validTo",
      message: "Ngày bắt đầu hiệu lực không được sau ngày kết thúc.",
    })
  })

  it("no longer knows the site fields of the old batch form", () => {
    expect(agreementServerFieldIssue({ field: "examinationSiteAddress", code: "AssertTrue" })).toEqual({
      target: null,
      message: "Trường \"examinationSiteAddress\" không hợp lệ.",
    })
  })
})
