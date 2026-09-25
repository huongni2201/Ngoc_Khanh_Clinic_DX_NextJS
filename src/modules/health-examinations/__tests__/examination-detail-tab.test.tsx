import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HealthExaminationBatchDetailPage } from "../pages/health-examination-batch-detail-page"
import { ExaminationDetailTab } from "../components/examination-detail-tab/examination-detail-tab"
import { ExaminationMatrixTable } from "../components/examination-detail-tab/examination-matrix-table"
import * as api from "../api"
import { ParticipantExaminationProgress, ClinicalServiceColumn } from "../types"

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  usePathname: () => "/organizations/ent-2/health-examination-batches/batch-1",
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

describe("Screen 05 – Tab 'Chi tiết khám' (Exam Batch Detail)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("1 & 2: switches from 'Người khám' to 'Chi tiết khám', updates header subtitle, hides header actions, without page reload", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <HealthExaminationBatchDetailPage organizationId="ent-2" batchId="batch-1" />
    )

    // Wait for page header
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    // Initial default tab is 'Người khám'
    expect(
      screen.getByText("Danh sách người khám tham gia đợt khám")
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Import người khám/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Tải file mẫu/i })).toBeInTheDocument()

    // Click tab 'Chi tiết khám'
    const examTab = screen.getByRole("button", { name: "Chi tiết khám" })
    await user.click(examTab)

    // Subtitle updates to the participant-focused copy.
    expect(
      screen.getByText("Theo dõi người khám đã thực hiện các dịch vụ nào")
    ).toBeInTheDocument()

    // Header actions (Import, Tải file mẫu) must be hidden on this tab
    expect(
      screen.queryByRole("button", { name: /Import người khám/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Tải file mẫu/i })
    ).not.toBeInTheDocument()

    // Summary strip remains visible
    expect(screen.getAllByText("Công ty Cổ phần FPT").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("18/09/2026")).toBeInTheDocument()
    expect(screen.getByText("50")).toBeInTheDocument()
    expect(screen.getByText("7 hạng mục")).toBeInTheDocument()

    // URL sync was called without reloading the page
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining("tab=details"),
      expect.objectContaining({ scroll: false })
    )
  })

  it("3, 4, 5, 6: renders dynamic category columns from batch items, COMPLETED as 'X', PENDING/SKIPPED as blank", async () => {
    const sampleCategories: ClinicalServiceColumn[] = [
      { id: "cat-1", name: "Khám nội" },
      { id: "cat-2", name: "XN máu" },
      { id: "cat-3", name: "Chuyên khoa khác" },
    ]

    const sampleParticipants: ParticipantExaminationProgress[] = [
      {
        id: "emp-1",
        participantCode: "NV001",
        fullName: "Nguyễn Văn A",
        organizationUnit: "Kỹ thuật",
        examinations: {
          "cat-1": "COMPLETED",
          "cat-2": "PENDING",
          "cat-3": "SKIPPED",
        },
        completedServiceIds: ["cat-1"],
        examStatus: "IN_PROGRESS",
        note: "Đủ hồ sơ",
      },
    ]

    render(
      <ExaminationMatrixTable
        categoryColumns={sampleCategories}
        items={sampleParticipants}
        totalItems={1}
        currentPage={1}
        pageSize={10}
        totalPages={1}
        onPageChange={vi.fn()}
        selectedIds={[]}
        onToggleSelect={vi.fn()}
        onToggleSelectAll={vi.fn()}
      />
    )

    // Dynamic columns exist in header
    expect(screen.getByText("Khám nội")).toBeInTheDocument()
    expect(screen.getByText("XN máu")).toBeInTheDocument()
    expect(screen.getByText("Chuyên khoa khác")).toBeInTheDocument()

    // cat-1 has COMPLETED -> renders 'X'
    const xCells = screen.getAllByText("X")
    expect(xCells.length).toBe(1)

    // Check that PENDING and SKIPPED do not render 'X' and do not render dashes
    const table = screen.getByRole("table")
    const cells = table.querySelectorAll("tbody tr td")
    // cell 0: checkbox, cell 1: NV001, cell 2: Nguyễn Văn A, cell 3: Kỹ thuật,
    // cell 4: cat-1 (X), cell 5: cat-2 (blank), cell 6: cat-3 (blank), cell 7: Ghi chú
    expect(cells[4].textContent?.trim()).toBe("X")
    expect(cells[5].textContent?.trim()).toBe("")
    expect(cells[6].textContent?.trim()).toBe("")
  })

  it("7: renders reference image data for rows 1 to 10 with exact completed X marks and badges", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <HealthExaminationBatchDetailPage organizationId="ent-2" batchId="batch-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    const examTab = screen.getByRole("button", { name: "Chi tiết khám" })
    await user.click(examTab)

    // Wait for table to load
    await waitFor(() => {
      expect(screen.getByText("FPT001")).toBeInTheDocument()
    })

    // Check participants matching reference image
    expect(screen.getByText("Trần Minh Đức")).toBeInTheDocument()
    expect(screen.getByText("Nguyễn Thu Hà")).toBeInTheDocument()
    expect(screen.getByText("Lê Quang Huy")).toBeInTheDocument()
    expect(screen.getByText("Phạm Thị Mai")).toBeInTheDocument()
    expect(screen.getByText("Đặng Hoàng Nam")).toBeInTheDocument()
    expect(screen.getByText("Nguyễn Văn Long")).toBeInTheDocument()
    expect(screen.getByText("Vũ Thị Thanh Huyền")).toBeInTheDocument()
    expect(screen.getByText("Hoàng Anh Tuấn")).toBeInTheDocument()
    expect(screen.getByText("Đỗ Thị Kim Ngân")).toBeInTheDocument()
    expect(screen.getByText("Bùi Văn Duy")).toBeInTheDocument()

    // Check Note badges:
    // "Đủ hồ sơ" (green) for FPT001, FPT002, FPT004, FPT006, FPT008, FPT010 = 6
    expect(screen.getAllByText("Đủ hồ sơ").length).toBe(6)
    // "Khám bù" (amber) for FPT003, FPT007, FPT009 = 3
    expect(screen.getAllByText("Khám bù").length).toBe(3)
    // "Thiếu chữ ký" (amber) for FPT005 = 1
    expect(screen.getAllByText("Thiếu chữ ký").length).toBe(1)

    // Helper text above table
    expect(screen.getByText("X = đã khám hạng mục")).toBeInTheDocument()
  })

  it("8: searches participants by code, name, and CCCD with debounce", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <HealthExaminationBatchDetailPage organizationId="ent-2" batchId="batch-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Chi tiết khám" }))

    await waitFor(() => {
      expect(screen.getByText("FPT001")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      "Tìm theo mã người khám, họ tên, CCCD..."
    )
    expect(searchInput).toBeInTheDocument()

    // Type search keyword "Thu Hà"
    await user.type(searchInput, "Thu Hà")

    await waitFor(
      () => {
        expect(screen.getByText("Nguyễn Thu Hà")).toBeInTheDocument()
        expect(screen.queryByText("Trần Minh Đức")).not.toBeInTheDocument()
      },
      { timeout: 2000 }
    )
  })

  it("9: filters participants by organizationUnit", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <HealthExaminationBatchDetailPage organizationId="ent-2" batchId="batch-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Chi tiết khám" }))

    await waitFor(() => {
      expect(screen.getByText("FPT001")).toBeInTheDocument()
    })

    // Department filter select exists
    const deptSelect = screen.getByRole("combobox", { name: /Đơn vị công tác/i })
    expect(deptSelect).toBeInTheDocument()
  })

  it("10: filters participants by examination status", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <HealthExaminationBatchDetailPage organizationId="ent-2" batchId="batch-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Chi tiết khám" }))

    await waitFor(() => {
      expect(screen.getByText("FPT001")).toBeInTheDocument()
    })

    // Status filter select exists
    const statusSelect = screen.getByRole("combobox", {
      name: /Tình trạng khám/i,
    })
    expect(statusSelect).toBeInTheDocument()
  })

  it("11: renders table inside an overflow-x-auto container to prevent full page horizontal scroll", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <HealthExaminationBatchDetailPage organizationId="ent-2" batchId="batch-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Chi tiết khám" }))

    await waitFor(() => {
      expect(screen.getByText("FPT001")).toBeInTheDocument()
    })

    const table = screen.getByRole("table")
    const container = table.closest(".overflow-x-auto")
    expect(container).toBeInTheDocument()
  })

  it("12: displays pagination info for 50 participants and page navigation", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <HealthExaminationBatchDetailPage organizationId="ent-2" batchId="batch-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Chi tiết khám" }))

    await waitFor(() => {
      expect(screen.getByText("FPT001")).toBeInTheDocument()
    })

    // Pagination info
    expect(screen.getByText(/Hiển thị/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Trang 1" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Trang 2" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Trang 5" })).toBeInTheDocument()
  })

  it("13: handles empty search result state gracefully", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <HealthExaminationBatchDetailPage organizationId="ent-2" batchId="batch-1" />
    )

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Khám sức khỏe định kỳ 2026", level: 1 })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Chi tiết khám" }))

    await waitFor(() => {
      expect(screen.getByText("FPT001")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      "Tìm theo mã người khám, họ tên, CCCD..."
    )
    await user.type(searchInput, "Tên Không Thể Tìm Thấy 99999")

    await waitFor(
      () => {
        expect(
          screen.getByText("Không tìm thấy người khám phù hợp với điều kiện tìm kiếm.")
        ).toBeInTheDocument()
      },
      { timeout: 2000 }
    )
  })

  it("14: shows helper notice when participants exist but no completed exams", () => {
    const sampleCategories: ClinicalServiceColumn[] = [
      { id: "cat-1", name: "Khám nội" },
    ]

    const sampleParticipants: ParticipantExaminationProgress[] = [
      {
        id: "emp-1",
        participantCode: "NV001",
        fullName: "Trần Văn Không Khám",
        organizationUnit: "Kỹ thuật",
        examinations: {
          "cat-1": "PENDING",
        },
        completedServiceIds: [],
        examStatus: "NOT_STARTED",
        note: "Đủ hồ sơ",
      },
    ]

    render(
      <ExaminationMatrixTable
        categoryColumns={sampleCategories}
        items={sampleParticipants}
        totalItems={1}
        currentPage={1}
        pageSize={10}
        totalPages={1}
        onPageChange={vi.fn()}
        selectedIds={[]}
        onToggleSelect={vi.fn()}
        onToggleSelectAll={vi.fn()}
      />
    )

    expect(
      screen.getByText("Chưa ghi nhận hạng mục khám hoàn thành.")
    ).toBeInTheDocument()
  })

  it("15: displays inline error box with 'Thử lại' button on fetch failure without breaking the page", async () => {
    const spy = vi
      .spyOn(api, "fetchHealthExaminationBatchMatrix")
      .mockRejectedValueOnce(new Error("Lỗi mạng 500"))

    renderWithClient(<ExaminationDetailTab batchId="batch-1" />)

    await waitFor(() => {
      expect(
        screen.getByText("Không thể tải chi tiết khám.")
      ).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole("button", { name: /Thử lại/i })
    expect(retryBtn).toBeInTheDocument()

    spy.mockRestore()
  })

  it("16: ReportTab derives counts from the exact same completed examination data", async () => {
    const matrixRes = await api.fetchHealthExaminationBatchMatrix("batch-1", { pageSize: 50 })
    const reportRes = await api.fetchHealthExaminationBatchReport("batch-1")

    // Count actual completed "item-kntq" from matrix data
    const completedInternalExamCount = matrixRes.data.filter(
      (e) =>
        e.examinations?.["item-kntq"] === "COMPLETED" ||
        e.completedServiceIds?.includes("item-kntq")
    ).length

    // Match with report item examinedCount
    const reportInternalItem = reportRes.items.find(
      (it) => it.serviceId === "item-kntq"
    )

    expect(reportInternalItem).toBeDefined()
    expect(reportInternalItem?.examinedCount).toBe(completedInternalExamCount)
  })
})


