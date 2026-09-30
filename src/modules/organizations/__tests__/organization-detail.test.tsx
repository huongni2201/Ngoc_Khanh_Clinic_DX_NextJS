import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OrganizationDetailPage } from "../pages/organization-detail-page"
import { mockOrganizationFetch, organizationFixture } from "./organization-api-fixtures"

vi.unmock("@/modules/health-examinations/api")

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

  it("uses the URL as the batch tab source of truth and reads the available batch API", async () => {
    vi.stubEnv("NODE_ENV", "production")
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080")
    mockNavigation.search = "tab=batches"
    const fetchMock = mockOrganizationFetch()
    fetchMock.mockImplementation(async (input) => {
      const isBatchList = new URL(String(input)).pathname.endsWith("/health-examination-batches")
      return Response.json({
        result: "OK", code: 200,
        data: isBatchList
          ? { items: [], page: 1, size: 10, totalElements: 0, totalPages: 0 }
          : organizationFixture,
      })
    })
    renderWithClient(<OrganizationDetailPage organizationId="org-1" />)
    expect(await screen.findByText("Chưa có đợt khám nào cho đơn vị này")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/organizations/org-1/health-examination-batches?"),
      expect.objectContaining({ credentials: "include" })
    )

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
})
