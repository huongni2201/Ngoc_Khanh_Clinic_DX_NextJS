import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OrganizationListPage } from "../pages/organization-list-page"
import { DataTablePagination } from "@/shared/ui"

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  usePathname: () => "/organizations",
  useSearchParams: () => mockSearchParams,
}))

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe("OrganizationListPage (Screen 01 - Updated Table & Pagination)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
  })

  it("renders table with STT and Địa chỉ columns, without Mã column", async () => {
    renderWithClient(<OrganizationListPage />)

    // Wait for data to load
    await waitFor(() => {
      expect(
        screen.getByText("Samsung Electronics Việt Nam")
      ).toBeInTheDocument()
    })

    // Header checks
    expect(screen.getByRole("columnheader", { name: "STT" })).toBeInTheDocument()
    expect(
      screen.getByRole("columnheader", { name: "Tên đơn vị" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("columnheader", { name: "Địa chỉ" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("columnheader", { name: "Người liên hệ" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("columnheader", { name: "Số đợt khám" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("columnheader", { name: "Trạng thái" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("columnheader", { name: "Cập nhật gần nhất" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("columnheader", { name: "Thao tác" })
    ).toBeInTheDocument()

    // Ensure "Mã" and "Ngày khám" column headers do NOT exist
    expect(
      screen.queryByRole("columnheader", { name: "Mã" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("columnheader", { name: "Ngày khám" })
    ).not.toBeInTheDocument()
  })

  it("displays exactly 10 organizations on page 1 with STT and addresses without logos", async () => {
    renderWithClient(<OrganizationListPage />)

    await waitFor(() => {
      expect(
        screen.getByText("Samsung Electronics Việt Nam")
      ).toBeInTheDocument()
    })

    // Data rows check: 1 header row + 10 data rows
    const rows = screen.getAllByRole("row")
    expect(rows).toHaveLength(11)

    // First data row (index 1)
    expect(rows[1]).toHaveTextContent("1")
    expect(rows[1]).toHaveTextContent("Samsung Electronics Việt Nam")
    expect(rows[1]).toHaveTextContent("KCN Yên Bình, Phổ Yên, Thái Nguyên")

    // 10th data row (index 10)
    expect(rows[10]).toHaveTextContent("10")
    expect(rows[10]).toHaveTextContent(
      "Công ty Cổ phần Chuỗi Thực phẩm TH (TH True Milk)"
    )
    expect(rows[10]).toHaveTextContent(
      "Tòa nhà BAC A BANK, 09 Đào Duy Anh, Đống Đa, Hà Nội"
    )

    // 11th item should NOT be on page 1
    expect(
      screen.queryByText("Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)")
    ).not.toBeInTheDocument()
  })

  it("renders shared DataTablePagination showing 10 organizations per page and cursor pointer buttons", async () => {
    renderWithClient(<OrganizationListPage />)

    await waitFor(() => {
      expect(
        screen.getByText("Samsung Electronics Việt Nam")
      ).toBeInTheDocument()
    })

    // Pagination summary text
    expect(
      screen.getByText(/Hiển thị/i)
    ).toBeInTheDocument()
    expect(
      screen.getAllByText("32")[0]
    ).toBeInTheDocument()

    // Pagination navigation buttons
    const prevBtn = screen.getByRole("button", { name: "Trang trước" })
    const nextBtn = screen.getByRole("button", { name: "Trang sau" })
    const page1Btn = screen.getByRole("button", { name: "Trang 1" })
    const page2Btn = screen.getByRole("button", { name: "Trang 2" })

    expect(prevBtn).toBeInTheDocument()
    expect(nextBtn).toBeInTheDocument()
    expect(page1Btn).toBeInTheDocument()
    expect(page2Btn).toBeInTheDocument()

    // Buttons have cursor-pointer class
    expect(prevBtn).toHaveClass("cursor-pointer")
    expect(nextBtn).toHaveClass("cursor-pointer")
    expect(page1Btn).toHaveClass("cursor-pointer")
    expect(page2Btn).toHaveClass("cursor-pointer")
  })

  it("calls onPageChange when page button is clicked in DataTablePagination", async () => {
    const user = userEvent.setup()
    const handlePageChange = vi.fn()

    render(
      <DataTablePagination
        currentPage={1}
        pageSize={10}
        totalItems={32}
        totalPages={4}
        onPageChange={handlePageChange}
        entityName="đơn vị"
      />
    )

    const page2Btn = screen.getByRole("button", { name: "Trang 2" })
    await user.click(page2Btn)

    expect(handlePageChange).toHaveBeenCalledWith(2)
  })

  it("renders OrganizationCountersStrip with 5 KPI cards and handles filter clicks", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationListPage />)

    await waitFor(() => {
      expect(screen.getByText("Tổng đơn vị")).toBeInTheDocument()
      expect(screen.getByText("Đang tổ chức khám")).toBeInTheDocument()
      expect(screen.getByText("Đã hoàn tất đợt khám")).toBeInTheDocument()
      expect(screen.getByText("Tổng số đợt khám")).toBeInTheDocument()
      expect(screen.getByText("Nhân sự dự kiến khám")).toBeInTheDocument()
    })

    // Click "Đang tổ chức khám" counter button
    const inProgressBtn = screen.getByRole("button", { name: /Đang tổ chức khám/i })
    await user.click(inProgressBtn)

    expect(mockReplace).toHaveBeenCalledWith("/organizations?status=IN_PROGRESS&page=1")
  })
})

