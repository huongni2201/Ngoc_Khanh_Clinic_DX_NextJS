import { describe, expect, it } from "vitest"
import type { RoleSummary } from "../types/role"
import { selectRolePage } from "../utils/role-labels"

function role(code: string, name: string, active = true): RoleSummary {
  return { id: code, code, name, active, permissionCount: 0, userCount: 0, rowVersion: 0 }
}

const roles = [
  role("RECEPTIONIST", "Receptionist"),
  role("NURSE", "Nurse", false),
  role("ADMINISTRATOR", "Administrator"),
  role("LAB_TECH", "Kỹ thuật viên xét nghiệm"),
]

describe("selectRolePage", () => {
  it("searches the Vietnamese name shown on screen, ignoring case", () => {
    expect(selectRolePage(roles, { search: "lễ TÂN", page: 1, pageSize: 10 }).items).toEqual([
      roles[0],
    ])
    expect(selectRolePage(roles, { search: "xét nghiệm", page: 1, pageSize: 10 }).total).toBe(1)
    expect(selectRolePage(roles, { search: "Receptionist", page: 1, pageSize: 10 }).total).toBe(0)
    expect(selectRolePage(roles, { search: "RECEPTIONIST", page: 1, pageSize: 10 }).total).toBe(0)
  })

  it("filters by status and orders by the Vietnamese name", () => {
    expect(
      selectRolePage(roles, { search: "", status: "ACTIVE", page: 1, pageSize: 10 }).items.map(
        (item) => item.code
      )
    ).toEqual(["LAB_TECH", "RECEPTIONIST", "ADMINISTRATOR"])
    expect(
      selectRolePage(roles, { search: "", status: "INACTIVE", page: 1, pageSize: 10 }).items
    ).toEqual([roles[1]])
  })

  it("pages the matching roles and keeps the page in range", () => {
    const second = selectRolePage(roles, { search: "", page: 2, pageSize: 3 })
    expect(second).toMatchObject({ total: 4, page: 2, totalPages: 2 })
    expect(second.items).toHaveLength(1)
    expect(selectRolePage(roles, { search: "", page: 9, pageSize: 3 }).page).toBe(2)
    expect(selectRolePage([], { search: "", page: 1, pageSize: 3 })).toMatchObject({
      total: 0,
      page: 1,
      totalPages: 1,
    })
  })
})
