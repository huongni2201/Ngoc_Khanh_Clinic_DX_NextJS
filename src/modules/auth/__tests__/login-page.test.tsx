import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LoginPage } from "../pages/login-page"

const mockRouter = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ ...mockRouter, prefetch: vi.fn() }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
}))

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => localStorage.clear())

  it("shows that login is unavailable until the backend auth API exists", () => {
    renderWithClient(<LoginPage />)

    expect(screen.getByAltText("Ngọc Khánh Clinic Logo")).toBeInTheDocument()
    expect(screen.getByText("Đăng nhập hệ thống")).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent(
      "Backend chưa cung cấp API đăng nhập."
    )
    expect(screen.queryByPlaceholderText("Nhập tên đăng nhập")).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText("Nhập mật khẩu")).not.toBeInTheDocument()
  })

  it("does not trust an old fake token in localStorage", async () => {
    localStorage.setItem("nk_auth_token", "test-token")
    localStorage.setItem("nk_auth_user", JSON.stringify({ id: "fake-user" }))

    renderWithClient(<LoginPage />)

    await waitFor(() => expect(mockRouter.replace).not.toHaveBeenCalled())
    expect(screen.getByRole("status")).toBeInTheDocument()
  })
})
