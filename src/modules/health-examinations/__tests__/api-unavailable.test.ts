import { afterEach, describe, expect, it, vi } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"
import { fetchClinicalServiceCatalog } from "../api"

vi.unmock("../api")

afterEach(() => vi.unstubAllEnvs())

describe("health examination backend gaps", () => {
  it("does not invent a service catalog endpoint or load fixture prices in production", async () => {
    vi.stubEnv("NODE_ENV", "production")

    await expect(fetchClinicalServiceCatalog()).rejects.toMatchObject({
      name: "ApiClientError",
      status: 501,
      message: "Backend chưa cung cấp API cho danh mục dịch vụ khám.",
    } satisfies Partial<ApiClientError>)
  })
})
