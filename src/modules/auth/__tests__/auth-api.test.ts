import { afterEach, describe, expect, it, vi } from "vitest"
import { authApi } from "../api/auth-api"
import { loginSchema } from "../schemas/login.schema"
import { csrf, ok, patientSession, staffSession } from "./fixtures"

afterEach(() => vi.unstubAllGlobals())

describe("staff API contract", () => {
  it("fetches masked CSRF before login and returns only the session view", async () => {
    const request = vi.fn().mockResolvedValueOnce(csrf()).mockResolvedValueOnce(ok(staffSession))
    vi.stubGlobal("fetch", request)
    await expect(authApi.login({ username: "staff.test", password: "unchanged " })).resolves.toEqual(staffSession)
    const [url, options] = request.mock.calls[1]
    expect(url).toContain("/api/v1/auth/login")
    expect(new Headers(options.headers).get("X-XSRF-TOKEN")).toBe("masked-token")
    expect(JSON.parse(options.body)).toEqual({ username: "staff.test", password: "unchanged " })
    expect(options.credentials).toBe("include")
    expect(new Headers(options.headers).has("Authorization")).toBe(false)
  })

  it("takes a new CSRF token for logout and accepts 204", async () => {
    const request = vi.fn().mockResolvedValueOnce(csrf()).mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", request)
    await expect(authApi.logout()).resolves.toBeUndefined()
    expect(request.mock.calls[0][0]).toContain("/csrf")
    expect(request.mock.calls[1][0]).toContain("/logout")
  })

  it("accepts a patient session without role assignments and rejects inconsistent IDs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(ok(patientSession))
      .mockResolvedValueOnce(ok({ ...patientSession, staffId: staffSession.staffId })))
    await expect(authApi.me()).resolves.toEqual(patientSession)
    await expect(authApi.me()).rejects.toMatchObject({ code: "INVALID_RESPONSE" })
  })

  it("distinguishes an anonymous session from unavailable Redis", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 })))
    await expect(authApi.me()).resolves.toBeNull()
    await expect(authApi.me()).rejects.toMatchObject({ status: 503 })
  })

  it("rejects a fabricated token response and does not retry a failed login", async () => {
    const request = vi.fn().mockResolvedValueOnce(ok({ accessToken: "wrong-contract" }))
      .mockResolvedValueOnce(csrf()).mockResolvedValueOnce(new Response(null, { status: 403 }))
    vi.stubGlobal("fetch", request)
    await expect(authApi.me()).rejects.toMatchObject({ code: "INVALID_RESPONSE" })
    await expect(authApi.login({ username: "staff.test", password: "secret" })).rejects.toMatchObject({ status: 403 })
    expect(request).toHaveBeenCalledTimes(3)
  })

  it("validates password bytes without trimming or changing username case", () => {
    expect(loginSchema.parse({ username: " Staff.Test ", password: " secret " })).toEqual({ username: "Staff.Test", password: " secret " })
    expect(loginSchema.safeParse({ username: "staff", password: "ắ".repeat(25) }).success).toBe(false)
    expect(loginSchema.safeParse({ username: "staff", password: "a".repeat(72) }).success).toBe(true)
    expect(loginSchema.safeParse({ username: "a".repeat(201), password: "a" }).success).toBe(false)
  })
})
