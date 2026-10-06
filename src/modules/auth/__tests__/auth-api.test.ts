import { afterEach, describe, expect, it, vi } from "vitest"
import { authApi } from "../api/auth-api"
import { loginSchema } from "../schemas/login.schema"
import { me, ok, patientSession, staffSession } from "./fixtures"

afterEach(() => vi.unstubAllGlobals())

describe("auth API contract", () => {
  it("logs in with one request, no CSRF token, and returns only the session view", async () => {
    const request = vi.fn().mockResolvedValueOnce(ok(staffSession))
    vi.stubGlobal("fetch", request)
    await expect(authApi.login({ username: "staff.test", password: "unchanged " })).resolves.toEqual(staffSession)
    expect(request).toHaveBeenCalledTimes(1)
    const [url, options] = request.mock.calls[0]
    expect(url).toContain("/api/v1/auth/login")
    expect(new Headers(options.headers).has("X-XSRF-TOKEN")).toBe(false)
    expect(JSON.parse(options.body)).toEqual({ username: "staff.test", password: "unchanged " })
    expect(options.credentials).toBe("include")
    expect(new Headers(options.headers).has("Authorization")).toBe(false)
    expect(localStorage.getItem("nk_auth_token")).toBeNull()
    expect(localStorage.getItem("nk_auth_user")).toBeNull()
  })

  it("logs out with one request and accepts 204", async () => {
    const request = vi.fn().mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", request)
    await expect(authApi.logout()).resolves.toBeUndefined()
    expect(request).toHaveBeenCalledTimes(1)
    expect(request.mock.calls[0][0]).toContain("/api/v1/auth/logout")
  })

  it("accepts /me without a message and Java instants with fractional seconds", async () => {
    const session = { ...staffSession, idleExpiresAt: "2026-10-06T02:30:00.123456Z" }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(me(session)))
    await expect(authApi.me()).resolves.toEqual(session)
  })

  it("accepts a patient session without role assignments and rejects inconsistent IDs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(me(patientSession))
      .mockResolvedValueOnce(me({ ...patientSession, staffId: staffSession.staffId })))
    await expect(authApi.me()).resolves.toEqual(patientSession)
    await expect(authApi.me()).rejects.toMatchObject({ code: "INVALID_RESPONSE" })
  })

  it("rejects the retired assignment shape", async () => {
    const legacy = {
      ...staffSession,
      roleAssignments: [{ assignmentId: staffSession.roleAssignments[0].roleId, roleCode: "DOCTOR", permissions: [] }],
    }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(me(legacy)))
    await expect(authApi.me()).rejects.toMatchObject({ code: "INVALID_RESPONSE" })
  })

  it("distinguishes an anonymous session from unavailable Redis", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 })))
    await expect(authApi.me()).resolves.toBeNull()
    await expect(authApi.me()).rejects.toMatchObject({ status: 503 })
  })

  it("rejects a fabricated token response and does not retry a failed login", async () => {
    const request = vi.fn().mockResolvedValueOnce(me({ accessToken: "wrong-contract" }))
      .mockResolvedValueOnce(new Response(null, { status: 403 }))
    vi.stubGlobal("fetch", request)
    await expect(authApi.me()).rejects.toMatchObject({ code: "INVALID_RESPONSE" })
    await expect(authApi.login({ username: "staff.test", password: "secret" })).rejects.toMatchObject({ status: 403 })
    expect(request).toHaveBeenCalledTimes(2)
  })

  it("keeps credentials exactly as typed and enforces the backend limits", () => {
    expect(loginSchema.parse({ username: " Staff.Test ", password: " secret " }))
      .toEqual({ username: " Staff.Test ", password: " secret " })
    expect(loginSchema.safeParse({ username: "   ", password: "a" }).success).toBe(false)
    expect(loginSchema.safeParse({ username: "a".repeat(150), password: "a" }).success).toBe(true)
    expect(loginSchema.safeParse({ username: "a".repeat(151), password: "a" }).success).toBe(false)
    expect(loginSchema.safeParse({ username: "staff", password: "a".repeat(72) }).success).toBe(true)
    // 19 x ("ậ" 3 bytes + "A" 1 byte) = 76 bytes in only 38 characters.
    expect(loginSchema.safeParse({ username: "staff", password: "ậA".repeat(19) }).success).toBe(false)
  })
})
