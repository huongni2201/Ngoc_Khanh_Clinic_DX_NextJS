import { describe, expect, it } from "vitest"
import { formatFileSize } from "../format-file-size"

describe("formatFileSize", () => {
  it.each([
    [0, "1 KB"],
    [1536, "2 KB"],
    [1024 * 1024 - 1, "1024 KB"],
    [1024 * 1024, "1.0 MB"],
    [5.25 * 1024 * 1024, "5.3 MB"],
  ])("formats %d bytes as %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected)
  })
})
