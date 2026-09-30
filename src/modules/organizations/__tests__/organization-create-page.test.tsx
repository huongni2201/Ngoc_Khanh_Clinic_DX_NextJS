import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OrganizationCreatePage } from "../pages/organization-create-page"
import { mockOrganizationFetch } from "./organization-api-fixtures"

const mockRouter = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}))

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe("OrganizationCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOrganizationFetch()
  })

  afterEach(() => vi.unstubAllGlobals())

  it("renders fields that match the organization request contract", () => {
    renderWithClient(<OrganizationCreatePage />)

    expect(screen.getByLabelText(/Tên đơn vị/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mã số thuế/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Địa chỉ trụ sở/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Người liên hệ \*/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Số điện thoại/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Chức vụ người liên hệ/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Ghi chú nội bộ/i)).toBeInTheDocument()
  })

  it("validates required organization fields", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationCreatePage />)

    await user.click(screen.getByRole("button", { name: "Lưu đơn vị" }))

    expect(screen.getByText("Tên đơn vị phải có ít nhất 2 ký tự")).toBeInTheDocument()
    expect(screen.getByText("Người liên hệ là bắt buộc")).toBeInTheDocument()
    expect(screen.getByText("Số điện thoại phải từ 9 đến 11 số")).toBeInTheDocument()
  })

  it("creates an organization through the backend API and opens its detail page", async () => {
    const user = userEvent.setup()
    const fetchMock = mockOrganizationFetch()
    renderWithClient(<OrganizationCreatePage />)

    await user.type(screen.getByLabelText(/Tên đơn vị/i), "Đại học Bách Khoa Hà Nội")
    await user.type(screen.getByLabelText(/Mã số thuế/i), "0100998877")
    await user.type(screen.getByLabelText(/Địa chỉ trụ sở/i), "Số 1 Đại Cồ Việt")
    await user.type(screen.getByLabelText(/^Người liên hệ \*/i), "Lê Hoàng Quân")
    await user.type(screen.getByLabelText(/Số điện thoại/i), "0912345678")
    await user.click(screen.getByRole("button", { name: "Lưu đơn vị" }))

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith("/organizations/org-created"))
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/organizations"),
      expect.objectContaining({ method: "POST" })
    )
  })
})
