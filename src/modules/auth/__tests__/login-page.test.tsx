import * as React from "react"
import { render, screen, waitFor, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LoginPage } from "../pages/login-page"
import { csrf, ok, staffSession } from "./fixtures"

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
  it("restores /me before displaying the form and omits unsupported options", async () => {
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
    request.mockResolvedValueOnce(csrf()).mockResolvedValueOnce(new Response(null, { status: 401 }))
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }))
    expect(await screen.findByText("Tên đăng nhập hoặc mật khẩu không chính xác.")).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("logs in, clears old data and redirects without storing a token", async () => {
    const client = renderLogin()
    const user = await fill()
    client.setQueryData(["patients"], ["previous-user-data"])
    request.mockResolvedValueOnce(csrf()).mockResolvedValueOnce(ok(staffSession))
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }))
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/organizations"))
    expect(client.getQueryData(["patients"])).toBeUndefined()
    expect(localStorage.length).toBe(0)
    await waitFor(() => expect(client.getMutationCache().getAll()).toHaveLength(0))
  })

  it("redirects an existing session to organizations", async () => {
    request.mockResolvedValueOnce(ok(staffSession))
    renderLogin()
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/organizations"))
  })

  it("shows retry for a /me outage instead of the login form", async () => {
    request.mockResolvedValueOnce(new Response(null, { status: 503 }))
    renderLogin()
    expect(await screen.findByRole("button", { name: "Thử lại" })).toBeInTheDocument()
    expect(screen.queryByPlaceholderText("Nhập mật khẩu")).not.toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("honors Retry-After and blocks duplicate attempts", async () => {
    renderLogin()
    const user = await fill()
    request.mockResolvedValueOnce(csrf()).mockResolvedValueOnce(new Response(null, { status: 429, headers: { "Retry-After": "30" } }))
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }))
    expect(await screen.findByText(/Vui lòng thử lại sau/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeDisabled()
  })
})
