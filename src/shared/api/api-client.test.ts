import { afterEach, describe, expect, it, vi } from "vitest"
import { ApiClientError, apiClient } from "./api-client"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("apiClient", () => {
  it("accepts a 204 response without an API envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(apiClient.delete<void>("/resource")).resolves.toEqual({
      result: "OK",
      code: 204,
    })
  })

  it("normalizes blob network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")))

    await expect(apiClient.getBlob("/report")).rejects.toMatchObject({
      name: "ApiClientError",
      status: 0,
    } satisfies Partial<ApiClientError>)
  })

  it("preserves the common API code for server errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ result: "NG", code: 409, message: "Preview is stale" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        })
      )
    )

    await expect(apiClient.get("/resource")).rejects.toMatchObject({
      status: 409,
      code: 409,
      message: "Preview is stale",
    } satisfies Partial<ApiClientError>)
  })

  it("requires an API base URL in production", async () => {
    vi.stubEnv("NODE_ENV", "production")
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "")
    const fetch = vi.fn()
    vi.stubGlobal("fetch", fetch)

    await expect(apiClient.get("/organizations")).rejects.toThrow(
      "NEXT_PUBLIC_API_BASE_URL is required outside development"
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})
