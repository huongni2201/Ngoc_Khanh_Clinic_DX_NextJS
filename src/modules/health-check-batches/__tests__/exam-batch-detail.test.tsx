import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ExamBatchDetailPage } from "../pages/exam-batch-detail-page"

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  usePathname: () => "/enterprises/ent-2/exam-batches/batch-1",
  useSearchParams: () => new URLSearchParams(),
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

describe("ExamBatchDetailPage (Screen 04 – Chi tiết đợt khám)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders header, breadcrumbs, title, and action buttons without global export/report buttons", async () => {
    renderWithClient(
      <ExamBatchDetailPage enterpriseId="ent-2" batchId="batch-1" />
    )

    // Wait for batch heading to appear
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    // Subtitle
    expect(
      screen.getByText("Danh sách nhân viên tham gia đợt khám")
    ).toBeInTheDocument()

    // Breadcrumbs
    expect(screen.getByRole("link", { name: "Doanh nghiệp" })).toBeInTheDocument()
    expect(screen.getByText("Đợt khám")).toBeInTheDocument()

    // Top-right buttons
    const importBtn = screen.getByRole("button", { name: /Import nhân sự/i })
    const downloadTemplateBtn = screen.getByRole("button", {
      name: /Tải file mẫu/i,
    })
    expect(importBtn).toBeInTheDocument()
    expect(downloadTemplateBtn).toBeInTheDocument()

    // Global header must NOT show report/export buttons
    expect(
      screen.queryByRole("button", { name: /Xem báo cáo/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Xuất Excel tổng hợp ở global/i })
    ).not.toBeInTheDocument()
  })

  it("displays exactly 4 summary strip blocks with correct data and no extra KPIs", async () => {
    renderWithClient(
      <ExamBatchDetailPage enterpriseId="ent-2" batchId="batch-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    // 1. Doanh nghiệp
    expect(screen.getAllByText("Công ty Cổ phần FPT").length).toBeGreaterThanOrEqual(1)

    // 2. Ngày khám
    expect(screen.getByText("18/09/2026")).toBeInTheDocument()

    // 3. Số nhân sự
    expect(screen.getByText("50")).toBeInTheDocument()

    // 4. Hạng mục
    expect(screen.getByText("7 hạng mục")).toBeInTheDocument()

    // Forbidden metrics must not exist
    expect(screen.queryByText(/Tổng giá trị/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Doanh thu dự kiến/i)).not.toBeInTheDocument()
  })

  it("renders Tab 1 (Nhân sự khám) by default with all 13 fields, status badges, and pagination", async () => {
    renderWithClient(
      <ExamBatchDetailPage enterpriseId="ent-2" batchId="batch-1" />
    )

    // Wait for table to load
    await waitFor(() => {
      expect(screen.getByText("Mã NV")).toBeInTheDocument()
    })

    expect(
      screen.getByPlaceholderText(
        "Tìm theo mã NV, họ tên, CCCD, số điện thoại..."
      )
    ).toBeInTheDocument()

    // Check table headers
    expect(screen.getByText("Họ tên")).toBeInTheDocument()
    expect(screen.getByText("Ngày sinh")).toBeInTheDocument()
    expect(screen.getByText("Giới tính")).toBeInTheDocument()
    expect(screen.getByText("CCCD")).toBeInTheDocument()
    expect(screen.getByText("Số điện thoại")).toBeInTheDocument()
    expect(screen.getByText("Phòng ban")).toBeInTheDocument()
    expect(screen.getByText("Chức vụ")).toBeInTheDocument()
    expect(screen.getByText("Địa chỉ")).toBeInTheDocument()
    expect(screen.getByText("Ngày vào làm")).toBeInTheDocument()
    expect(screen.getByText("Loại HĐ")).toBeInTheDocument()
    expect(screen.getByText("Trạng thái hồ sơ")).toBeInTheDocument()
    expect(screen.getByText("Ghi chú")).toBeInTheDocument()

    // Check reference data rows
    // Row 1: FPT001 Trần Minh Đức, Đủ hồ sơ
    expect(screen.getByText("FPT001")).toBeInTheDocument()
    expect(screen.getByText("Trần Minh Đức")).toBeInTheDocument()
    expect(screen.getByText("090312345678")).toBeInTheDocument()
    expect(screen.getByText("0901 234 567")).toBeInTheDocument()

    // Row 3: FPT003 Lê Quang Huy, Row 7: FPT007 Vũ Thị Thanh Huyền (both Thiếu CCCD)
    expect(screen.getByText("FPT003")).toBeInTheDocument()
    expect(screen.getByText("Lê Quang Huy")).toBeInTheDocument()
    expect(screen.getAllByText("Thiếu CCCD").length).toBe(2)

    // Row 5: FPT005 Đặng Hoàng Nam, Row 9: FPT009 Đỗ Thị Kim Ngân (both Thiếu chữ ký)
    expect(screen.getByText("FPT005")).toBeInTheDocument()
    expect(screen.getByText("Đặng Hoàng Nam")).toBeInTheDocument()
    expect(screen.getAllByText("Thiếu chữ ký").length).toBeGreaterThanOrEqual(2)

    // Pagination info & page buttons
    expect(screen.getByText(/Hiển thị/i)).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Phân trang" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Trang 1" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Trang 2" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Trang 5" })).toBeInTheDocument()
  })

  it("switches to Tab 2 (Chi tiết khám) and renders matrix table with category columns and X marks", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <ExamBatchDetailPage enterpriseId="ent-2" batchId="batch-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    // Click Tab 2: "Chi tiết khám"
    const examTab = screen.getByRole("button", { name: "Chi tiết khám" })
    await user.click(examTab)

    // Wait for Matrix data to load
    await waitFor(() => {
      expect(screen.getByText("Khám nội")).toBeInTheDocument()
    })

    // Subtitle & helper
    expect(
      screen.getByText("Theo dõi nhân sự đã khám các hạng mục nào")
    ).toBeInTheDocument()
    expect(screen.getByText("X = đã khám hạng mục")).toBeInTheDocument()

    // Category columns
    expect(screen.getByText("XN máu")).toBeInTheDocument()
    expect(screen.getByText("XN nước tiểu")).toBeInTheDocument()
    expect(screen.getByText("Siêu âm")).toBeInTheDocument()
    expect(screen.getByText("X-quang")).toBeInTheDocument()
    expect(screen.getByText("Khám mắt")).toBeInTheDocument()
    expect(screen.getByText("TMH")).toBeInTheDocument()

    // Check that 'X' markers are present
    const xMarks = screen.getAllByText("X")
    expect(xMarks.length).toBeGreaterThan(0)
  })

  it("switches to Tab 3 (Báo cáo), displays export buttons, table data, and payment calculation total", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <ExamBatchDetailPage enterpriseId="ent-2" batchId="batch-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    // Click Tab 3: "Báo cáo"
    const reportTab = screen.getByRole("button", { name: "Báo cáo" })
    await user.click(reportTab)

    // Wait for Report to load
    await waitFor(() => {
      expect(screen.getByText("Khám nội tổng quát")).toBeInTheDocument()
    })

    expect(
      screen.getByText("Tổng hợp số lượng khám theo từng hạng mục để thanh toán")
    ).toBeInTheDocument()

    // Export buttons inside Tab 3
    expect(
      screen.getByRole("button", { name: /Xuất Excel chi tiết \(ngang\)/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Xuất Excel tổng hợp \(dọc\)/i })
    ).toBeInTheDocument()

    // Categories in report
    expect(screen.getByText("Khám nội tổng quát")).toBeInTheDocument()
    expect(screen.getByText("Xét nghiệm máu")).toBeInTheDocument()
    expect(screen.getByText("Xét nghiệm nước tiểu")).toBeInTheDocument()
    expect(screen.getByText("Siêu âm ổ bụng")).toBeInTheDocument()
    expect(screen.getByText("X-quang phổi")).toBeInTheDocument()
    expect(screen.getByText("Tai mũi họng")).toBeInTheDocument()

    // Grand total: 35.070.000 đ
    expect(screen.getByText("35.070.000 đ")).toBeInTheDocument()

    // Formula info callout box
    expect(screen.getByText("Ví dụ cách tính")).toBeInTheDocument()
    expect(
      screen.getByText("Khám nội tổng quát: 100.000 x 50 = 5.000.000 đ")
    ).toBeInTheDocument()
  })

  it("opens the Import Employees Dialog when clicking [Import nhân sự]", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <ExamBatchDetailPage enterpriseId="ent-2" batchId="batch-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    const importBtn = screen.getByRole("button", { name: /Import nhân sự/i })
    await user.click(importBtn)

    // Dialog title
    expect(
      screen.getByRole("heading", { name: "Import danh sách nhân sự" })
    ).toBeInTheDocument()

    // Dropzone guidance
    expect(
      screen.getByText(/Kéo thả file Excel vào đây, hoặc click để chọn file/i)
    ).toBeInTheDocument()
  })
})
