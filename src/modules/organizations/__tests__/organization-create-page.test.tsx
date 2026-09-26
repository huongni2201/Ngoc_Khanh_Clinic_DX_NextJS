import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OrganizationCreatePage } from "../pages/organization-create-page"
import { resetOrganizationsStore } from "../api"

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/organizations/new",
}))

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe("OrganizationCreatePage (/organizations/new)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetOrganizationsStore()
  })

  it("renders all form fields per Section 4.1", () => {
    renderWithClient(<OrganizationCreatePage />)

    expect(screen.getByRole("heading", { name: "Thêm đơn vị mới" })).toBeInTheDocument()
    expect(screen.getByLabelText(/Tên đơn vị/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Loại tổ chức/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mã số thuế/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Địa chỉ trụ sở/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Người liên hệ/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Số điện thoại/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email liên hệ/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Ghi chú nội bộ/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Lưu đơn vị" })).toBeInTheDocument()
  })

  it("validates required fields on submit", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationCreatePage />)

    const submitBtn = screen.getByRole("button", { name: "Lưu đơn vị" })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText("Tên đơn vị phải có ít nhất 2 ký tự")).toBeInTheDocument()
      expect(screen.getByText("Người liên hệ là bắt buộc")).toBeInTheDocument()
      expect(screen.getByText("Số điện thoại phải từ 9 đến 11 số")).toBeInTheDocument()
    })
  })

  it("successfully creates organization and navigates to detail page", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationCreatePage />)

    await user.type(screen.getByLabelText(/Tên đơn vị/i), "Đại học Bách Khoa Hà Nội")
    await user.type(screen.getByLabelText(/Mã số thuế/i), "0100998877")
    await user.type(screen.getByLabelText(/Địa chỉ trụ sở/i), "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội")
    await user.type(screen.getByLabelText(/Người liên hệ/i), "TS. Lê Hoàng Quân")
    await user.type(screen.getByLabelText(/Số điện thoại/i), "0912345678")
    await user.type(screen.getByLabelText(/Email liên hệ/i), "contact@hust.edu.vn")
    await user.type(screen.getByLabelText(/Ghi chú nội bộ/i), "Đơn vị đào tạo công nghệ trọng điểm")

    const submitBtn = screen.getByRole("button", { name: "Lưu đơn vị" })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/organizations\/ent-/))
    })
  })
})
