import * as React from "react"
import { render, screen, waitFor, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LoginPage } from "../pages/login-page"
import { me, ok, patientSession, staffSession } from "./fixtures"

const replace = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }))
const request = vi.fn()

function renderLogin() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<QueryClientProvider client={client}><LoginPage /></QueryClientProvider>)
  return client
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  vi.stubGlobal("fetch", request)
  request.mockResolvedValue(new Response(null, { status: 401 }))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

async function fill() {
  const user = userEvent.setup()
  await user.type(await screen.findByPlaceholderText("Nhập tên đăng nhập"), "staff.test")
  await user.type(screen.getByPlaceholderText("Nhập mật khẩu"), "secret")
  return user
}

describe("staff login screen", () => {
  it("shows login without calling /me for a fresh visitor, even when the backend is offline", async () => {
    request.mockRejectedValue(new TypeError("Failed to fetch"))
    renderLogin()
    expect(await screen.findByRole("button", { name: "Đăng nhập" })).toBeDisabled()
    expect(request).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })

  it("displays the form and omits unsupported options", async () => {
    renderLogin()
    expect(await screen.findByRole("button", { name: "Đăng nhập" })).toBeDisabled()
    expect(screen.queryByText("Quên mật khẩu?")).not.toBeInTheDocument()
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
  })

  it("keeps password visibility accessible", async () => {
    renderLogin()
    const user = await fill()
    await user.click(screen.getByRole("button", { name: "Hiện mật khẩu" }))
    expect(screen.getByPlaceholderText("Nhập mật khẩu")).toHaveAttribute("type", "text")
  })

  it("shows a generic credential error without redirecting", async () => {
    renderLogin()
    const user = await fill()
    request.mockResolvedValueOnce(new Response(null, { status: 401 }))
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }))
    expect(await screen.findByText("Tên đăng nhập hoặc mật khẩu không chính xác.")).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("logs in, clears old data and redirects without storing a token", async () => {
    const client = renderLogin()
    const user = await fill()
    client.setQueryData(["patients"], ["previous-user-data"])
    request.mockResolvedValueOnce(ok(staffSession))
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }))
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/organizations"))
    expect(client.getQueryData(["patients"])).toBeUndefined()
    expect(localStorage.getItem("nkc-session-present")).toBe("1")
    expect(localStorage.getItem("nk_auth_token")).toBeNull()
    expect(localStorage.getItem("nk_auth_user")).toBeNull()
    await waitFor(() => expect(client.getMutationCache().getAll()).toHaveLength(0))
  })

  it.each([
    ["staff with roles", staffSession],
    ["staff without roles", { ...staffSession, roleAssignments: [] }],
  ])("redirects an existing %s session to organizations", async (_, session) => {
    localStorage.setItem("nkc-session-present", "1")
    request.mockResolvedValueOnce(me(session))
    renderLogin()
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/organizations"))
  })

  it("keeps a patient session on login with a logout action", async () => {
    localStorage.setItem("nkc-session-present", "1")
    request.mockResolvedValueOnce(me(patientSession))
    renderLogin()
    expect(await screen.findByRole("button", { name: "Đăng xuất" })).toBeInTheDocument()
    expect(screen.getByText("patient.test")).toBeInTheDocument()
    expect(screen.queryByPlaceholderText("Nhập mật khẩu")).not.toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("sends the username exactly as typed", async () => {
    renderLogin()
    const user = userEvent.setup()
    await user.type(await screen.findByPlaceholderText("Nhập tên đăng nhập"), " Staff.Test ")
    await user.type(screen.getByPlaceholderText("Nhập mật khẩu"), "secret")
    request.mockResolvedValueOnce(ok(staffSession))
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }))
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/organizations"))
    const [, options] = request.mock.calls.at(-1)!
    expect(JSON.parse(options.body).username).toBe(" Staff.Test ")
  })

  it("blocks a Vietnamese password longer than 72 bytes before sending it", async () => {
    renderLogin()
    const user = userEvent.setup()
    await user.type(await screen.findByPlaceholderText("Nhập tên đăng nhập"), "staff.test")
    await user.type(screen.getByPlaceholderText("Nhập mật khẩu"), "ậA".repeat(19))
    expect(await screen.findByText("Mật khẩu không được vượt quá 72 byte UTF-8")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeDisabled()
  })

  it("shows a patient without staff access after successful login", async () => {
    renderLogin()
    const user = await fill()
    request.mockResolvedValueOnce(ok(patientSession))
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }))
    expect(await screen.findByText("patient.test")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Đăng xuất" })).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalledWith("/organizations")
  })

  it("shows retry for a /me outage instead of the login form", async () => {
    localStorage.setItem("nkc-session-present", "1")
    request.mockResolvedValueOnce(new Response(null, { status: 503 }))
    renderLogin()
    expect(await screen.findByRole("button", { name: "Thử lại" })).toBeInTheDocument()
    expect(screen.queryByPlaceholderText("Nhập mật khẩu")).not.toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("honors Retry-After and blocks duplicate attempts", async () => {
    renderLogin()
    const user = await fill()
    request.mockResolvedValueOnce(new Response(null, { status: 429, headers: { "Retry-After": "30" } }))
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }))
    expect(await screen.findByText(/Vui lòng thử lại sau/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeDisabled()
  })
})
