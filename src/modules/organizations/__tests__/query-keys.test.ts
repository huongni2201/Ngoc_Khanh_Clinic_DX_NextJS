import { describe, expect, it } from "vitest"
import { organizationKeys } from "../query-keys"

describe("organizationKeys", () => {
  it("groups list queries beneath a shared list prefix", () => {
    expect(organizationKeys.list({ page: 2, pageSize: 10 })).toEqual([
      "organizations",
      "list",
      { page: 2, pageSize: 10 },
    ])
    expect(organizationKeys.lists()).toEqual(["organizations", "list"])
  })

  it("groups detail queries beneath a shared detail prefix", () => {
    expect(organizationKeys.detail("org-1")).toEqual([
      "organizations",
      "detail",
      "org-1",
    ])
    expect(organizationKeys.details()).toEqual(["organizations", "detail"])
  })
})
