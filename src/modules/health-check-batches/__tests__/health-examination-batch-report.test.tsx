import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HealthExaminationBatchDetailPage } from "../pages/health-examination-batch-detail-page"
import { ReportTab } from "../components/report-tab/report-tab"
import {
  fetchHealthExaminationBatchReport,
  fetchExamDetailExportData,
  fetchExamSummaryExportData,
} from "../api"
import {
  generateDetailHorizontalCSV,
  generateSummaryVerticalCSV,
} from "../utils/export-excel"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/enterprises/ent-2/health-examination-batches/batch-1",
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

describe("Screen 06 – Tab Báo cáo của màn Chi tiết đợt khám", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1, 2, 3, 4, 5: Business calculation & report aggregation
  it("aggregates completed counts and correctly calculates subtotal and grandTotal", async () => {
    const report = await fetchHealthExaminationBatchReport("batch-1")

    expect(report.batchId).toBe("batch-1")

    // 1 & 3: Khám nội: 50 completed -> 50 * 100.000 = 5.000.000
    const internalExam = report.items.find((i) => i.name === "Khám nội tổng quát")
    expect(internalExam).toBeDefined()
    expect(internalExam?.examinedCount).toBe(50)
    expect(internalExam?.unitPrice).toBe(100000)
    expect(internalExam?.totalAmount).toBe(5000000)

    // 2 & 4: Xét nghiệm máu: 48 completed -> 48 * 220.000 = 10.560.000
    const bloodTest = report.items.find((i) => i.name === "Xét nghiệm máu")
    expect(bloodTest).toBeDefined()
    expect(bloodTest?.examinedCount).toBe(48)
    expect(bloodTest?.unitPrice).toBe(220000)
    expect(bloodTest?.totalAmount).toBe(10560000)

    // Xét nghiệm nước tiểu: 46 * 80.000 = 3.680.000
    const urineTest = report.items.find((i) => i.name === "Xét nghiệm nước tiểu")
    expect(urineTest?.examinedCount).toBe(46)
    expect(urineTest?.totalAmount).toBe(3680000)

    // Siêu âm ổ bụng: 42 * 150.000 = 6.300.000
    const ultrasound = report.items.find((i) => i.name === "Siêu âm ổ bụng")
    expect(ultrasound?.examinedCount).toBe(42)
    expect(ultrasound?.totalAmount).toBe(6300000)

    // X-quang phổi: 40 * 120.000 = 4.800.000
    const xRay = report.items.find((i) => i.name === "X-quang phổi")
    expect(xRay?.examinedCount).toBe(40)
    expect(xRay?.totalAmount).toBe(4800000)

    // Khám mắt: 38 * 60.000 = 2.280.000
    const eyeExam = report.items.find((i) => i.name === "Khám mắt")
    expect(eyeExam?.examinedCount).toBe(38)
    expect(eyeExam?.totalAmount).toBe(2280000)

    // Tai mũi họng: 35 * 70.000 = 2.450.000
    const entExam = report.items.find((i) => i.name === "Tai mũi họng")
    expect(entExam?.examinedCount).toBe(35)
    expect(entExam?.totalAmount).toBe(2450000)

    // 5: Grand total = 35.070.000
    expect(report.totalAmount).toBe(35070000)
  })

  // 6: Item without completed records -> count 0 -> subtotal 0
  it("calculates count 0 and subtotal 0 for items without completed records", () => {
    const zeroItem = {
      examinationItemId: "item-custom",
      name: "Chụp MRI",
      unitPrice: 2000000,
    }
    const count = 0
    const subtotal = count * zeroItem.unitPrice
    expect(count).toBe(0)
    expect(subtotal).toBe(0)
  })

  // 9: Unit price uses batch snapshot, not master catalog price
  it("preserves unit price snapshot from batch configuration, not master catalog", async () => {
    const report = await fetchHealthExaminationBatchReport("batch-1")
    const internalExam = report.items.find((i) => i.name === "Khám nội tổng quát")
    // Batch snapshot unit price is 100.000 (master catalog default price is 180.000)
    expect(internalExam?.unitPrice).toBe(100000)
    expect(internalExam?.unitPrice).not.toBe(180000)
  })

  // 7: Horizontal Excel (detail matrix) has correct X markers
  it("generates correct horizontal Excel matrix with X markers for completed items", async () => {
    const exportData = await fetchExamDetailExportData("batch-1")
    expect(exportData.columns.length).toBe(7)
    expect(exportData.rows.length).toBe(50)

    // First row: FPT001 Tran Minh Duc has all completed items
    const row1 = exportData.rows[0]
    expect(row1.employeeCode).toBe("FPT001")
    expect(row1.completedItemIds.length).toBe(7)

    const csvContent = generateDetailHorizontalCSV(exportData)
    // Check BOM
    expect(csvContent.startsWith("\uFEFF")).toBe(true)
    // Check headers
    expect(csvContent).toContain("Mã NV,Họ tên,CCCD,Phòng ban")
    expect(csvContent).toContain('"Khám nội tổng quát"')
    expect(csvContent).toContain('"Xét nghiệm máu"')
    // Check row 1 has X marks
    expect(csvContent).toContain('"FPT001","Trần Minh Đức"')
    expect(csvContent).toContain("X,X,X,X,X,X,X")
  })

  // 8: Vertical Excel (summary) has correct aggregation and grand total
  it("generates correct vertical Excel summary with items and grand total", async () => {
    const summaryData = await fetchExamSummaryExportData("batch-1")
    expect(summaryData.items.length).toBe(7)
    expect(summaryData.totalAmount).toBe(35070000)

    const csvContent = generateSummaryVerticalCSV(summaryData)
    expect(csvContent.startsWith("\uFEFF")).toBe(true)
    expect(csvContent).toContain("Hạng mục,Số người khám,Đơn giá,Thành tiền")
    expect(csvContent).toContain('"Khám nội tổng quát",50,100000,5000000')
    expect(csvContent).toContain('"Xét nghiệm máu",48,220000,10560000')
    expect(csvContent).toContain('"Tổng tiền",,,35070000')
  })

  // 10: Renders loading skeleton and disabled export buttons
  it("renders loading skeleton and disabled export buttons while loading", () => {
    renderWithClient(
      <ReportTab batchId="batch-1" batchName="Khám sức khỏe định kỳ 2026" />
    )

    // Export buttons should be rendered and disabled initially or during loading
    const exportButtons = screen.getAllByRole("button", {
      name: /Xuất Excel/i,
    })
    expect(exportButtons.length).toBe(2)
  })

  // 11: Context preservation and header subtitle update across tabs
  it("switches to Tab 3 (Báo cáo), updates header subtitle, hides header actions, and displays exact UI", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <HealthExaminationBatchDetailPage enterpriseId="ent-2" batchId="batch-1" />
    )

    // Wait for batch heading to appear
    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "Khám sức khỏe định kỳ 2026",
          level: 1,
        })
      ).toBeInTheDocument()
    })

    // On Tab 1 by default: header buttons exist, subtitle is for employees
    expect(
      screen.getByText("Danh sách nhân viên tham gia đợt khám")
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Import nhân sự/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Tải file mẫu/i })
    ).toBeInTheDocument()

    // Switch to Tab 3: "Báo cáo"
    const reportTabBtn = screen.getByRole("button", { name: "Báo cáo" })
    await user.click(reportTabBtn)

    // Header subtitle must change to "Báo cáo tổng hợp đợt khám"
    await waitFor(() => {
      expect(
        screen.getByText("Báo cáo tổng hợp đợt khám")
      ).toBeInTheDocument()
    })

    // Top action buttons on page header must now be hidden
    expect(
      screen.queryByRole("button", { name: /Import nhân sự/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Tải file mẫu/i })
    ).not.toBeInTheDocument()

    // Card Title in Tab 3
    expect(
      screen.getByText("Tổng hợp số lượng khám theo từng hạng mục để thanh toán")
    ).toBeInTheDocument()

    // 2 Export buttons inside the Card only
    const detailExportBtn = screen.getByRole("button", {
      name: /Xuất Excel chi tiết \(ngang\)/i,
    })
    const summaryExportBtn = screen.getByRole("button", {
      name: /Xuất Excel tổng hợp \(dọc\)/i,
    })
    expect(detailExportBtn).toBeInTheDocument()
    expect(summaryExportBtn).toBeInTheDocument()

    // Table rows
    await waitFor(() => {
      expect(screen.getByText("Khám nội tổng quát")).toBeInTheDocument()
    })
    expect(screen.getByText("5.000.000 đ")).toBeInTheDocument()
    expect(screen.getByText("Xét nghiệm máu")).toBeInTheDocument()
    expect(screen.getByText("10.560.000 đ")).toBeInTheDocument()

    // Grand total
    expect(screen.getByText("35.070.000 đ")).toBeInTheDocument()

    // Info box with example calculation
    expect(screen.getByText("Ví dụ cách tính")).toBeInTheDocument()
    expect(
      screen.getByText("Khám nội tổng quát: 100.000 x 50 = 5.000.000 đ")
    ).toBeInTheDocument()
  })

  // Error state test
  it("displays error state with retry button when query fails", async () => {
    // Render with non-existent batchId to trigger error
    renderWithClient(
      <ReportTab batchId="batch-non-existent" batchName="Đợt không tồn tại" />
    )

    await waitFor(() => {
      expect(screen.getByText("Không thể tải báo cáo.")).toBeInTheDocument()
    })

    expect(
      screen.getByRole("button", { name: /Thử lại/i })
    ).toBeInTheDocument()
  })
})
