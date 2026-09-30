import { describe, expect, it } from "vitest"
import { organizationResponseSchema } from "../types/transport"
import { organizationFixture } from "./organization-api-fixtures"

describe("organization transport contract", () => {
  it("accepts backend fields without frontend-only legacy fields", () => {
    const organization = organizationResponseSchema.parse(organizationFixture)

    expect(organization).toHaveProperty("contactPhone")
    expect(organization).not.toHaveProperty("phone")
    expect(organization).not.toHaveProperty("type")
    expect(organization).not.toHaveProperty("code")
  })
})
