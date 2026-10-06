import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OrganizationDetailPage } from "../pages/organization-detail-page"
import { mockOrganizationFetch, organizationFixture } from "./organization-api-fixtures"

const mockNavigation = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  search: "",
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockNavigation.push, replace: mockNavigation.replace }),
  usePathname: () => "/organizations/org-1",
  useSearchParams: () => new URLSearchParams(mockNavigation.search),
}))

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe("OrganizationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    mockNavigation.search = ""
    mockOrganizationFetch()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it("renders details from the backend contract and only available tabs", async () => {
    renderWithClient(<OrganizationDetailPage organizationId="org-1" />)

    expect(await screen.findByRole("heading", { name: organizationFixture.name })).toBeInTheDocument()
    expect(screen.getAllByText(organizationFixture.contactPhone)).not.toHaveLength(0)
    expect(screen.getByRole("button", { name: "Thông tin" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Đợt khám" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Chi tiết khám" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Báo cáo" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Tạo đợt khám mới" })).not.toBeInTheDocument()
  })

  it("uses the URL for the batch tab and shows the organization's batch list", async () => {
    mockNavigation.search = "tab=batches"
    renderWithClient(<OrganizationDetailPage organizationId="org-1" />)
    expect(await screen.findByText("Chưa có đợt khám nào cho đơn vị này")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Tạo đợt khám" })).toBeInTheDocument()
    expect(screen.queryByText(/Backend chưa cung cấp API/)).not.toBeInTheDocument()

    await userEvent.setup().click(screen.getByRole("button", { name: "Thông tin" }))
    expect(mockNavigation.push).toHaveBeenCalledWith("/organizations/org-1", { scroll: false })
  })

  it("shows a safe error state when the organization cannot be loaded", async () => {
    mockNavigation.search = ""
    mockOrganizationFetch()
    renderWithClient(<OrganizationDetailPage organizationId="nonexistent-999" />)

    expect(
      await screen.findByText("Không tìm thấy hoặc không thể tải dữ liệu đơn vị")
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Thử lại/i })).toBeInTheDocument()
  })

  it("deactivates after a dialog confirmation using the row version of the detail endpoint", async () => {
    const fetchMock = mockOrganizationFetch()
    const confirm = vi.fn(() => true)
    vi.stubGlobal("confirm", confirm)
    const user = userEvent.setup()
    renderWithClient(<OrganizationDetailPage organizationId="org-1" />)

    await user.click(await screen.findByRole("button", { name: "Ngừng hoạt động" }))
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === "DELETE")).toBe(false)
    await user.click(await screen.findByRole("button", { name: "Xác nhận ngừng hoạt động" }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/api/v1/organizations/org-1?rowVersion=${organizationFixture.rowVersion}`),
      expect.objectContaining({ method: "DELETE" })
    ))
    await waitFor(() => expect(mockNavigation.push).toHaveBeenCalledWith("/organizations"))
    expect(confirm).not.toHaveBeenCalled()
  })

  it("does not deactivate when the dialog is cancelled", async () => {
    const fetchMock = mockOrganizationFetch()
    const user = userEvent.setup()
    renderWithClient(<OrganizationDetailPage organizationId="org-1" />)

    await user.click(await screen.findByRole("button", { name: "Ngừng hoạt động" }))
    await user.click(await screen.findByRole("button", { name: "Hủy" }))

    expect(fetchMock.mock.calls.some(([, init]) => init?.method === "DELETE")).toBe(false)
    expect(mockNavigation.push).not.toHaveBeenCalled()
  })

  it("keeps the dialog on a 409, offers a reload and never resends the deactivation", async () => {
    const base = mockOrganizationFetch()
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "DELETE") {
        return Response.json(
          { result: "NG", code: 409, message: "Concurrent update" },
          { status: 409 }
        )
      }
      return base(input, init)
    })
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    renderWithClient(<OrganizationDetailPage organizationId="org-1" />)

    await user.click(await screen.findByRole("button", { name: "Ngừng hoạt động" }))
    await user.click(await screen.findByRole("button", { name: "Xác nhận ngừng hoạt động" }))

    expect(await screen.findByText(/Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ/)).toBeInTheDocument()
    expect(screen.queryByText("Concurrent update")).not.toBeInTheDocument()
    expect(mockNavigation.push).not.toHaveBeenCalled()

    const detailReads = () =>
      fetchMock.mock.calls.filter(([url, init]) =>
        init?.method !== "DELETE" && String(url).endsWith("/api/v1/organizations/org-1")).length
    const before = detailReads()
    await user.click(screen.getByRole("button", { name: "Tải lại dữ liệu mới nhất" }))

    await waitFor(() => expect(detailReads()).toBe(before + 1))
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === "DELETE")).toHaveLength(1)
    expect(screen.queryByText(/Dữ liệu đã thay đổi/)).not.toBeInTheDocument()
  })
})
