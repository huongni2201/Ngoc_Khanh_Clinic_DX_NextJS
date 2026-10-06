import type { ReactNode } from "react"
import { act, cleanup, render, renderHook, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useLogout } from "../hooks/use-auth"
import { useUserSession } from "../hooks/use-user-session"
import { AuthBoundary } from "../components/auth-boundary"
import { AuthSessionSync } from "../components/auth-session-sync"
import { replaceSession, SESSION_QUERY_KEY } from "../utils/session-cache"
import { me as ok, patientSession, staffSession } from "./fixtures"
import { QueryProvider } from "@/providers/query-provider"
import { httpClient } from "@/shared/api/http-client"
import { apiClient } from "@/shared/api/api-client"

const replace = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }))
beforeEach(() => {
  // Each test owns its browser context; native Node channels must not cross workers.
  vi.stubGlobal("BroadcastChannel", class {
    postMessage() {}
    close() {}
  })
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks() })

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
  return { client, wrapper }
}

describe("session lifecycle", () => {
  it("preserves a form draft while revalidating an already verified session", async () => {
    const { client, wrapper } = setup()
    let complete!: (response: Response) => void
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(ok(staffSession))
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { complete = resolve })))
    render(<AuthBoundary>{() => <input aria-label="Draft" defaultValue="unsaved" />}</AuthBoundary>, { wrapper })
    const field = await screen.findByRole("textbox", { name: "Draft" })
    act(() => { void client.invalidateQueries({ queryKey: SESSION_QUERY_KEY }) })
    await waitFor(() => expect(complete).toBeDefined())
    expect(screen.getByRole("textbox", { name: "Draft" })).toBe(field)
    await act(async () => { complete(ok(staffSession)) })
    expect(screen.getByRole("textbox", { name: "Draft" })).toBe(field)
  })

  it.each([
    [401, "httpClient"],
    [403, "httpClient"],
    [401, "apiClient"],
    [403, "apiClient"],
  ] as const)("handles a protected API %s through %s without confusing authentication and permission", async (status, transport) => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation((url: string) => Promise.resolve(
      url.endsWith("/me") ? ok(staffSession) : new Response(null, { status }),
    )))
    function ProtectedData() {
      const query = useQuery({
        queryKey: ["protected"],
        queryFn: () => transport === "httpClient"
          ? httpClient("/api/protected")
          : apiClient.get("/api/protected"),
        meta: { requiresAuth: true }, retry: false,
      })
      return <p>{query.error ? "Access failed" : "Protected page"}</p>
    }
    render(<QueryProvider><AuthBoundary>{() => <ProtectedData />}</AuthBoundary></QueryProvider>)
    if (status === 401) {
      await waitFor(() => expect(replace).toHaveBeenCalledWith("/auth/login"))
      expect(screen.queryByText("Protected page")).not.toBeInTheDocument()
    } else {
      expect(await screen.findByText("Access failed")).toBeInTheDocument()
      expect(replace).not.toHaveBeenCalled()
    }
  })

  it("does not render protected children before verifying the session", async () => {
    const { wrapper } = setup()
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })))
    render(<AuthBoundary>{() => <p>Clinical data</p>}</AuthBoundary>, { wrapper })
    expect(screen.queryByText("Clinical data")).not.toBeInTheDocument()
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/auth/login"))
  })

  it("keeps the session on failed revocation, then clears it only after 204", async () => {
    const { client, wrapper } = setup()
    client.setQueryData(SESSION_QUERY_KEY, staffSession)
    client.setQueryData(["patients"], ["private"])
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 })))
    const { result } = renderHook(() => useLogout(), { wrapper })
    await act(async () => { expect(await result.current.logout()).toBe(false) })
    expect(client.getQueryData(SESSION_QUERY_KEY)).toEqual(staffSession)
    expect(result.current.logoutError).toBeTruthy()
    await act(async () => { expect(await result.current.logout()).toBe(true) })
    expect(client.getQueryData(SESSION_QUERY_KEY)).toBeNull()
    expect(client.getQueryData(["patients"])).toBeUndefined()
  })

  it("does not resurrect an old /me result after logout", async () => {
    const { client, wrapper } = setup()
    let complete!: (response: Response) => void
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise<Response>((resolve) => { complete = resolve })))
    renderHook(() => useUserSession(), { wrapper })
    await waitFor(() => expect(complete).toBeDefined())
    await act(async () => { await replaceSession(client, null) })
    await act(async () => { complete(ok(staffSession)); await Promise.resolve() })
    expect(client.getQueryData(SESSION_QUERY_KEY)).toBeNull()
  })

  it("removes another user's cache when /me identifies a changed browser session", async () => {
    const { client, wrapper } = setup()
    client.setQueryData(SESSION_QUERY_KEY, { ...staffSession, userId: "44444444-4444-4444-8444-444444444444" })
    client.setQueryData(["patients"], ["previous-user"])
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok(staffSession)))
    const { result } = renderHook(() => useUserSession(), { wrapper })
    await waitFor(() => expect(result.current.isFetching).toBe(false))
    expect(result.current.data?.userId).toBe(staffSession.userId)
    expect(client.getQueryData(["patients"])).toBeUndefined()
  })

  it("lets staff without roles into the workspace, as the backend does", async () => {
    const { client, wrapper } = setup()
    client.setQueryData(SESSION_QUERY_KEY, staffSession)
    client.setQueryData(["patients"], ["private"])
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({ ...staffSession, roleAssignments: [] })))
    render(<AuthBoundary>{() => <p>Clinical data</p>}</AuthBoundary>, { wrapper })
    expect(await screen.findByText("Clinical data")).toBeInTheDocument()
    expect(client.getQueryData(["patients"])).toEqual(["private"])
  })

  it("removes business data when the same account is no longer staff", async () => {
    const { client, wrapper } = setup()
    client.setQueryData(SESSION_QUERY_KEY, staffSession)
    client.setQueryData(["patients"], ["private"])
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({ ...patientSession, userId: staffSession.userId })))
    render(<AuthBoundary>{() => <p>Clinical data</p>}</AuthBoundary>, { wrapper })
    expect(await screen.findByRole("button", { name: "Đăng xuất" })).toBeInTheDocument()
    expect(screen.queryByText("Clinical data")).not.toBeInTheDocument()
    expect(client.getQueryData(["patients"])).toBeUndefined()
  })

  it("does not mount staff children for a patient session", async () => {
    const { wrapper } = setup()
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok(patientSession)))
    render(<AuthBoundary>{() => <p>Clinical data</p>}</AuthBoundary>, { wrapper })
    expect(await screen.findByText("patient.test")).toBeInTheDocument()
    expect(screen.queryByText("Clinical data")).not.toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("cleans legacy storage and rechecks /me on a cross-tab signal", async () => {
    const { client, wrapper } = setup()
    const channels: { onmessage?: (event: { data: string }) => Promise<void> }[] = []
    vi.stubGlobal("BroadcastChannel", class {
      onmessage?: (event: { data: string }) => Promise<void>
      constructor() { channels.push(this) }
      close() {}
    })
    localStorage.setItem("nk_auth_token", "legacy")
    localStorage.setItem("nk_auth_user", "legacy")
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(ok(staffSession))))
    render(<AuthSessionSync />, { wrapper })
    const { result } = renderHook(() => useUserSession(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    client.setQueryData(["patients"], ["private"])
    expect(localStorage.getItem("nk_auth_token")).toBeNull()
    await act(async () => { await channels[0].onmessage?.({ data: "changed" }) })
    expect(client.getQueryData(["patients"])).toBeUndefined()
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
