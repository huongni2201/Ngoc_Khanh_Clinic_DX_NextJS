import { describe, expect, it } from "vitest"
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, parsePageSize } from "../page-size"

describe("parsePageSize", () => {
  it("accepts every offered size", () => {
    for (const size of PAGE_SIZE_OPTIONS) expect(parsePageSize(String(size))).toBe(size)
  })

  it("falls back for missing, malformed or unoffered values", () => {
    for (const value of [null, undefined, "", "abc", "0", "-10", "15", "500", "10.5"]) {
      expect(parsePageSize(value)).toBe(DEFAULT_PAGE_SIZE)
    }
  })

  it("uses the given fallback", () => {
    expect(parsePageSize("999", 20)).toBe(20)
  })
})
