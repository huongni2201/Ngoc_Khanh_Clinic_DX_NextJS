import { describe, expect, it } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"
import {
  describeCreatePrintJobError,
  describeExaminationFormError,
  detectPdfPaper,
  isExaminationFormPrintAllowed,
  orderExaminationFormPrintEntries,
} from "../utils/examination-form-print"

const entries = [
  { id: "c", participantCode: "KSK-001-0010", fullName: "C", departmentName: "Kho vận" },
  { id: "a", participantCode: "KSK-001-0002", fullName: "A", departmentName: "Kế toán" },
  { id: "x", fullName: "X", departmentName: "Kế toán" },
  { id: "b", participantCode: "KSK-001-0009", fullName: "B", departmentName: "Kho vận" },
]

function pdf(mediaBox: string) {
  return new Blob([`%PDF-1.7\n1 0 obj << /Type /Page /MediaBox [${mediaBox}] >> endobj`])
}

describe("examination form printing rules", () => {
  it("prints only READY and FINALIZED batches", () => {
    expect(isExaminationFormPrintAllowed("READY")).toBe(true)
    expect(isExaminationFormPrintAllowed("FINALIZED")).toBe(true)
    expect(isExaminationFormPrintAllowed("DRAFT")).toBe(false)
    expect(isExaminationFormPrintAllowed("CLOSED")).toBe(false)
  })

  it("orders by code with numbers compared as numbers and missing codes last", () => {
    expect(orderExaminationFormPrintEntries(entries, "CODE").map((entry) => entry.id)).toEqual([
      "a",
      "b",
      "c",
      "x",
    ])
  })

  it("orders by department, then by code", () => {
    expect(
      orderExaminationFormPrintEntries(entries, "DEPARTMENT").map((entry) => entry.id)
    ).toEqual(["a", "x", "b", "c"])
  })

  it("never renders the English backend message", () => {
    const conflict = new ApiClientError("x", 409, 409, "Form has 3 pages, template allows 2")
    expect(describeExaminationFormError(conflict)).toContain("tràn sang trang khác")
    expect(describeExaminationFormError(conflict)).not.toContain("pages")
    expect(describeExaminationFormError(new ApiClientError("x", 503))).toContain("PDF")
    expect(describeCreatePrintJobError(new ApiClientError("x", 409))).toContain("3 lệnh in")
    expect(describeCreatePrintJobError(new ApiClientError("x", 503))).toContain("lưu file")
  })

  it("reads the paper of the first page from the PDF", async () => {
    expect(await detectPdfPaper(pdf("0 0 1190.55 841.89"))).toBe("A3 ngang")
    expect(await detectPdfPaper(pdf("0 0 595.3 841.9"))).toBe("A4 dọc")
    expect(await detectPdfPaper(pdf("0 0 226.77 566.93"))).toBe("80 × 200 mm")
    expect(await detectPdfPaper(new Blob(["%PDF-1.7 compressed"]))).toBeNull()
  })
})
