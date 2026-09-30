import { describe, expect, it } from "vitest"
import { formatHealthExaminationDate } from "../utils/format-health-examination-date"

describe("formatHealthExaminationDate", () => {
  it("keeps LocalDate values in ISO form for transport and formats them for display", () => {
    expect(formatHealthExaminationDate("2026-09-18")).toBe("18/09/2026")
  })

  it("uses a placeholder for an absent date and preserves malformed values", () => {
    expect(formatHealthExaminationDate()).toBe("—")
    expect(formatHealthExaminationDate("invalid-date")).toBe("invalid-date")
  })
})
