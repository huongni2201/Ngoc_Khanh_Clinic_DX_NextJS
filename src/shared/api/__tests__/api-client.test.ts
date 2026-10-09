import { afterEach, describe, expect, it, vi } from "vitest"
import { ApiClientError, apiClient, isApiErrorStatus } from "../api-client"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("apiClient", () => {
  it("sends unsafe requests directly with the session cookie and no CSRF token", async () => {
    const requests: Array<{ path: string; options: RequestInit }> = []
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, options: RequestInit) => {
      requests.push({ path: new URL(String(input)).pathname, options })
      return Response.json({ result: "OK", code: 200 })
    }))

    await apiClient.post("/api/v1/organizations", {})
    await apiClient.put("/api/v1/organizations/one", {})
    await apiClient.delete("/api/v1/organizations/one")

    // The backend rejects cross-site writes by Origin (ADR-0014), so no token is fetched.
    expect(requests.map(({ path }) => path)).toEqual([
      "/api/v1/organizations", "/api/v1/organizations/one", "/api/v1/organizations/one",
    ])
    for (const { options } of requests) {
      expect(new Headers(options.headers).has("X-XSRF-TOKEN")).toBe(false)
      expect(options.credentials).toBe("include")
    }
  })
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
    const request = vi.fn()
      .mockResolvedValueOnce(Response.json({ result: "OK", code: 200 }))
    vi.stubGlobal("fetch", request)
    const upload = new FormData()
    upload.append("file", new File(["roster"], "roster.xlsx"))

    await apiClient.post("/imports", upload, { headers: { "Idempotency-Key": "key-1" } })

    const [, init] = request.mock.calls[0]
    const headers = new Headers(init.headers)
    expect(init.method).toBe("POST")
    expect(init.body).toBe(upload)
    expect(headers.get("Idempotency-Key")).toBe("key-1")
    expect(headers.has("Content-Type")).toBe(false)
  })

  it("accepts a 204 response without an API envelope", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 })))

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

  it("preserves the common API code and keeps the raw server message out of the display message", async () => {
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
      message: "Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ. Vui lòng tải lại.",
      serverMessage: "Preview is stale",
    } satisfies Partial<ApiClientError>)
  })

  it.each([
    [400, "Invalid request", "Thông tin không hợp lệ. Vui lòng kiểm tra lại."],
    [403, "You are not authorized to perform this action", "Không được phép thực hiện thao tác này."],
    [404, "Organization not found", "Không tìm thấy hoặc đã bị xóa/ngừng hoạt động."],
    [409, "Business rule could not be completed", "Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ. Vui lòng tải lại."],
    [500, "An unexpected error occurred", "Máy chủ gặp lỗi. Vui lòng thử lại sau."],
    [503, "Service unavailable", "Máy chủ gặp lỗi. Vui lòng thử lại sau."],
  ])("shows a Vietnamese message for HTTP %i instead of the English server text", async (status, serverMessage, expected) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      Response.json({ result: "NG", code: status, message: serverMessage }, { status })
    ))

    const error = await apiClient.get("/resource").catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(ApiClientError)
    expect(error).toMatchObject({ status, code: status, message: expected, serverMessage })
    expect((error as ApiClientError).message).not.toContain(serverMessage)
  })

  it("shows the Vietnamese status message when the error body is not an API envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>Bad gateway</html>", { status: 502 })))

    await expect(apiClient.get("/resource")).rejects.toMatchObject({
      status: 502,
      message: "Máy chủ gặp lỗi. Vui lòng thử lại sau.",
    })
  })

  it("keeps the server message for statuses without a mapped Vietnamese text", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      Response.json({ result: "NG", code: 429, message: "Too many attempts" }, { status: 429 })
    ))

    await expect(apiClient.get("/resource")).rejects.toMatchObject({
      status: 429,
      message: "Too many attempts",
    })
  })

  it("maps blob download failures to the same Vietnamese messages", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      Response.json({ result: "NG", code: 404, message: "Not found" }, { status: 404 })
    ))

    await expect(apiClient.getBlob("/report")).rejects.toMatchObject({
      status: 404,
      message: "Không tìm thấy hoặc đã bị xóa/ngừng hoạt động.",
      serverMessage: "Not found",
    })
  })

  it.each([
    ["post", (signal: AbortSignal) => apiClient.post("/api/v1/resource", {}, { signal })],
    ["put", (signal: AbortSignal) => apiClient.put("/api/v1/resource", {}, { signal })],
    ["delete", (signal: AbortSignal) => apiClient.delete("/api/v1/resource", { signal })],
  ])("cancels an unsafe %s request through the given signal", async (_name, send) => {
    const controller = new AbortController()
    controller.abort()
    const paths: string[] = []
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      paths.push(new URL(String(input)).pathname)
      return Response.json({ result: "OK", code: 200 })
    }))

    await expect(send(controller.signal)).rejects.toMatchObject({ name: "AbortError" })

    expect(paths).not.toContain("/api/v1/resource")
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

describe("isApiErrorStatus", () => {
  it("matches only an ApiClientError with the same status", () => {
    expect(isApiErrorStatus(new ApiClientError("conflict", 409), 409)).toBe(true)
    expect(isApiErrorStatus(new ApiClientError("conflict", 409), 404)).toBe(false)
    expect(isApiErrorStatus(new Error("409"), 409)).toBe(false)
    expect(isApiErrorStatus(undefined, 409)).toBe(false)
  })
})
