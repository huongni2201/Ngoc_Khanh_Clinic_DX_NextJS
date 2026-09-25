import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LoginPage } from "../pages/login-page"

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
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

describe("LoginPage & LoginForm (Ngọc Khánh Clinic Login Screen)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("renders all required UI elements according to the design specification", async () => {
    renderWithClient(<LoginPage />)

    // Header & Logo
    expect(screen.getByAltText("Ngọc Khánh Clinic Logo")).toBeInTheDocument()
    expect(screen.getByText("Ngọc Khánh")).toBeInTheDocument()
    expect(screen.getByText("Clinic")).toBeInTheDocument()
    expect(
      screen.getByText("Quản lý khám sức khỏe đơn vị")
    ).toBeInTheDocument()

    // Title & Subtitle
    expect(screen.getByText("Đăng nhập hệ thống")).toBeInTheDocument()
    expect(
      screen.getByText("Vui lòng đăng nhập để tiếp tục sử dụng hệ thống.")
    ).toBeInTheDocument()

    // Form Fields
    expect(
      screen.getByLabelText(/^Tên đăng nhập/i, { selector: "input" })
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/^Mật khẩu/i, { selector: "input" })
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText("Nhập tên đăng nhập")
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Nhập mật khẩu")).toBeInTheDocument()

    // Options Row
    expect(
      screen.getByRole("checkbox", { name: /Ghi nhớ đăng nhập/i })
    ).toBeInTheDocument()
    expect(screen.getByText("Quên mật khẩu?")).toBeInTheDocument()

    // Submit Button
    const submitBtn = screen.getByRole("button", { name: "Đăng nhập" })
    expect(submitBtn).toBeInTheDocument()
    expect(submitBtn).toBeDisabled() // Disabled initially because form is empty

    // Footers
    expect(
      screen.getByText("Cần hỗ trợ? Liên hệ quản trị viên hệ thống.")
    ).toBeInTheDocument()
    expect(
      screen.getByText("© 2026 Ngọc Khánh Clinic. Tất cả quyền được bảo lưu.")
    ).toBeInTheDocument()
  })

  it("enables submit button only when both fields are filled", async () => {
    const user = userEvent.setup()
    renderWithClient(<LoginPage />)

    const usernameInput = screen.getByPlaceholderText("Nhập tên đăng nhập")
    const passwordInput = screen.getByPlaceholderText("Nhập mật khẩu")
    const submitBtn = screen.getByRole("button", { name: "Đăng nhập" })

    expect(submitBtn).toBeDisabled()

    await user.type(usernameInput, "admin")
    expect(submitBtn).toBeDisabled()

    await user.type(passwordInput, "secret123")
    expect(submitBtn).toBeEnabled()

    await user.clear(usernameInput)
    expect(submitBtn).toBeDisabled()
  })

  it("toggles password visibility when Eye/EyeOff icon is clicked", async () => {
    const user = userEvent.setup()
    renderWithClient(<LoginPage />)

    const passwordInput = screen.getByPlaceholderText("Nhập mật khẩu")
    expect(passwordInput).toHaveAttribute("type", "password")

    const toggleBtn = screen.getByRole("button", { name: "Hiện mật khẩu" })
    await user.click(toggleBtn)

    expect(passwordInput).toHaveAttribute("type", "text")
    expect(screen.getByRole("button", { name: "Ẩn mật khẩu" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Ẩn mật khẩu" }))
    expect(passwordInput).toHaveAttribute("type", "password")
  })

  it("displays 401 error message when credentials are wrong", async () => {
    const user = userEvent.setup()
    renderWithClient(<LoginPage />)

    const usernameInput = screen.getByPlaceholderText("Nhập tên đăng nhập")
    const passwordInput = screen.getByPlaceholderText("Nhập mật khẩu")
    const submitBtn = screen.getByRole("button", { name: "Đăng nhập" })

    await user.type(usernameInput, "invalid")
    await user.type(passwordInput, "wrongpassword")
    await user.click(submitBtn)

    // Should display the 401 message
    await waitFor(() => {
      expect(
        screen.getByText("Tên đăng nhập hoặc mật khẩu không chính xác.")
      ).toBeInTheDocument()
    })
  })

  it("submits form successfully and redirects to /dashboard when valid credentials are provided", async () => {
    const user = userEvent.setup()
    renderWithClient(<LoginPage />)

    const usernameInput = screen.getByPlaceholderText("Nhập tên đăng nhập")
    const passwordInput = screen.getByPlaceholderText("Nhập mật khẩu")
    const submitBtn = screen.getByRole("button", { name: "Đăng nhập" })

    await user.type(usernameInput, "admin@ngockhanh.vn")
    await user.type(passwordInput, "Password123!")
    await user.click(submitBtn)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard")
    })
  })

  it("redirects to /dashboard immediately if user is already authenticated", async () => {
    // Set authenticated state in localStorage
    localStorage.setItem("nk_auth_token", "test-token")
    localStorage.setItem(
      "nk_auth_user",
      JSON.stringify({
        id: "1",
        username: "admin",
        name: "Admin",
        role: "Quản trị viên",
      })
    )

    renderWithClient(<LoginPage />)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/dashboard")
    })
  })
})

