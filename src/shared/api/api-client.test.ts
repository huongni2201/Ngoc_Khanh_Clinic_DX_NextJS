import { afterEach, describe, expect, it, vi } from "vitest"
import { ApiClientError, apiClient } from "./api-client"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("apiClient", () => {
  it("sends the session cookie for protected JSON and file requests", async () => {
    const request = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: "OK", code: 200, data: [] })))
      .mockResolvedValueOnce(new Response("report"))
    vi.stubGlobal("fetch", request)

    await apiClient.get("/organizations")
    await apiClient.getBlob("/report")

    for (const [, options] of request.mock.calls) {
      expect(options).toMatchObject({ credentials: "include", cache: "no-store" })
    }
  })

  it("forwards cancellation to fetch without turning it into a service error", async () => {
    const controller = new AbortController()
    vi.stubGlobal("fetch", vi.fn().mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
    })))

    const assertion = expect(apiClient.get("/organizations", { signal: controller.signal }))
      .rejects.toMatchObject({ name: "AbortError" })
    controller.abort()
    await assertion
  })

  it("times out after 15 seconds without retrying", async () => {
    vi.useFakeTimers()
    const request = vi.fn().mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
    }))
    vi.stubGlobal("fetch", request)

    const assertion = expect(apiClient.get("/organizations"))
      .rejects.toMatchObject({ name: "ApiClientError", status: 0 })
    await vi.advanceTimersByTimeAsync(14_999)
    expect(request.mock.calls[0][1].signal.aborted).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(request.mock.calls[0][1].signal.aborted).toBe(true)
    await assertion
    expect(request).toHaveBeenCalledTimes(1)
  })

  it("does not force a JSON content type onto a multipart upload", async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: "OK", code: 200 })))
    vi.stubGlobal("fetch", request)
    const upload = new FormData()
    upload.append("file", new File(["roster"], "roster.xlsx"))

    await apiClient.post("/imports", upload)

    expect(request.mock.calls[0][1].body).toBe(upload)
    expect(new Headers(request.mock.calls[0][1].headers).has("Content-Type")).toBe(false)
  })

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
