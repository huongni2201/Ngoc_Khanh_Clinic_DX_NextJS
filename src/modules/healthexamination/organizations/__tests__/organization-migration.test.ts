import { describe, expect, it } from "vitest"
import { organizationResponseSchema } from "../types/transport"
import { organizationFixture } from "./organization-api-fixtures"

describe("organization transport contract", () => {
  it("accepts backend fields without frontend-only legacy fields", () => {
    const organization = organizationResponseSchema.parse(organizationFixture)

    expect(organization).toHaveProperty("contactPhone")
    expect(organization).toHaveProperty("phone")
    expect(organization).toHaveProperty("taxCode")
    expect(organization).toHaveProperty("contactFullName")
    expect(organization).toHaveProperty("rowVersion")
    expect(organization).not.toHaveProperty("code")
    expect(organization).not.toHaveProperty("organizationType")
    expect(organization).not.toHaveProperty("contactPosition")
    expect(organization).not.toHaveProperty("contactName")
  })
})
