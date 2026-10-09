import { describe, expect, it } from "vitest"
import {
  matchesServiceQuery,
  normalizeSearchText,
  orderServiceRows,
} from "../utils/service-search"

const items = [
  { id: "a", name: "Tìm kí sinh trùng sốt rét trong máu", code: "CLS58526" },
  { id: "b", name: "Máu lắng", code: "CLS58527" },
  { id: "c", name: "Định nhóm máu hệ ABO", code: "CLS58530" },
  { id: "d", name: "Acid Uric", code: "CLS58533" },
]

describe("service search", () => {
  it("ignores case, diacritics and the letter đ", () => {
    expect(normalizeSearchText("  Định  NHÓM Máu ")).toBe("dinh nhom mau")
    expect(matchesServiceQuery(items[2], "dinh nhom")).toBe(true)
  })

  it("matches on the code and requires every word", () => {
    expect(matchesServiceQuery(items[1], "58527")).toBe(true)
    expect(matchesServiceQuery(items[1], "CLS58527")).toBe(true)
    expect(matchesServiceQuery(items[0], "mau ret")).toBe(true)
    expect(matchesServiceQuery(items[1], "mau ret")).toBe(false)
  })

  it("keeps catalog order when nothing is pinned", () => {
    expect(orderServiceRows(items, "", new Set())).toEqual([0, 1, 2, 3])
  })

  it("puts pinned rows first and keeps catalog order inside each group", () => {
    expect(orderServiceRows(items, "", new Set(["c", "a"]))).toEqual([0, 2, 1, 3])
  })

  it("filters before pinning", () => {
    expect(orderServiceRows(items, "mau", new Set(["c"]))).toEqual([2, 0, 1])
  })
})
