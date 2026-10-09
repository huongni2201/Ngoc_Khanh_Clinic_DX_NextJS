import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "@/shared/api/api-client"
import { ApiUnavailableError } from "@/shared/api/api-unavailable"

/**
 * The global test setup replaces these modules with in-memory fixtures. Their production
 * implementations are `unavailableApi` stubs because the backend has no endpoint yet, so
 * this is the only place that exercises the real exports.
 */
const legacyApis = [
  "@/modules/appointment/api",
  "@/modules/billing/api",
  "@/modules/patient/api",
  "@/widgets/doctor/api",
  "@/widgets/reception/api",
] as const

afterEach(() => vi.restoreAllMocks())

describe("legacy module APIs without backend contracts", () => {
  it.each(legacyApis)("%s rejects every call as unavailable without sending a request", async (apiPath) => {
    const requests = [
      vi.spyOn(apiClient, "get"),
      vi.spyOn(apiClient, "post"),
      vi.spyOn(apiClient, "put"),
      vi.spyOn(apiClient, "getBlob"),
    ]
    const api = await vi.importActual<Record<string, (...args: unknown[]) => Promise<unknown>>>(apiPath)
    const functions = Object.values(api).filter((value) => typeof value === "function")

    expect(functions.length).toBeGreaterThan(0)
    for (const call of functions) {
      await expect(call()).rejects.toBeInstanceOf(ApiUnavailableError)
    }
    for (const request of requests) expect(request).not.toHaveBeenCalled()
  })
})
