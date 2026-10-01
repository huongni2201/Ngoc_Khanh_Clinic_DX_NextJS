import { afterEach, describe, expect, it, vi } from "vitest"
import { httpClient, HttpError } from "../http-client"

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe("HTTP transport", () => {
  it("aborts after 15 seconds without retrying", async () => {
    vi.useFakeTimers()
    const request = vi.fn().mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
    }))
    vi.stubGlobal("fetch", request)
    const assertion = expect(httpClient("/api/test")).rejects.toMatchObject({ code: "TIMEOUT" })
    await vi.advanceTimersByTimeAsync(15_000)
    await assertion
    expect(request).toHaveBeenCalledTimes(1)
  })

  it("propagates caller cancellation without turning it into a network error", async () => {
    const controller = new AbortController()
    vi.stubGlobal("fetch", vi.fn().mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
    })))
    const assertion = expect(httpClient("/api/test", { signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" })
    controller.abort()
    await assertion
  })
  it("sends cookies and accepts an empty 204 response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetchMock)
    await expect(httpClient("/api/v1/auth/logout", { method: "POST" })).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/v1/auth/logout"),
      expect.objectContaining({ credentials: "include", cache: "no-store" }))
  })

  it("keeps status and retry delay without exposing a raw server response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("private stack trace", {
      status: 429, headers: { "Retry-After": "30" },
    })))
    await expect(httpClient("/api/test")).rejects.toMatchObject({ status: 429, retryAfterSeconds: 30 })
    await expect(httpClient("/api/test")).rejects.not.toThrow("private stack trace")
  })

  it("normalizes invalid JSON and network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>error</html>")))
    await expect(httpClient("/api/test")).rejects.toBeInstanceOf(HttpError)
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))
    await expect(httpClient("/api/test")).rejects.toMatchObject({ code: "NETWORK_ERROR" })
  })
})
