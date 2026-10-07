import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "../api-client"

afterEach(() => vi.unstubAllGlobals())

describe("apiClient.post", () => {
  it("sends request headers and a multipart body without forcing a JSON content type", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: "OK", code: 201, message: "ok", data: { ok: true } }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      })
    )
    vi.stubGlobal("fetch", fetchMock)
    const body = new FormData()
    body.append("rowVersion", "1")

    await apiClient.post("/api/test", body, { headers: { "Idempotency-Key": "key-1" } })

    const [, init] = fetchMock.mock.calls[0]
    const headers = new Headers(init.headers)
    expect(headers.get("Idempotency-Key")).toBe("key-1")
    expect(headers.get("Content-Type")).toBeNull()
    expect(init.body).toBe(body)
    expect(init.method).toBe("POST")
  })
})
