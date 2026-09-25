import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DoctorWorklistPage } from "../pages/doctor-worklist-page"
import { resetMockDoctorEncounters } from "../api"
import { AppSidebar } from "@/widgets/app-sidebar/app-sidebar"
import { AppHeader } from "@/widgets/app-header/app-header"

// Mock next/navigation
const mockPush = vi.fn()
const mockPathname = vi.fn(() => "/doctor")
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => mockPathname(),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    void priority
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />
  },
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

describe("Doctor Worklist — Danh sách lượt khám", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetMockDoctorEncounters()
    mockPathname.mockReturnValue("/doctor")
  })

  it("renders the application shell elements with BS. Trần Minh Khoa and highlights Lượt khám in sidebar", () => {
    render(<AppSidebar />)

    // Check brand header
    expect(screen.getByText("Ngọc Khánh Clinic")).toBeInTheDocument()
    expect(screen.getByText("Hệ thống quản lý phòng khám")).toBeInTheDocument()

    // Check all requested nav items are present
    expect(screen.getByRole("link", { name: /Tổng quan/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Lễ tân/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Bệnh nhân/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Lượt khám/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Lịch hẹn/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Thanh toán/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Đơn vị/i })).toBeInTheDocument()

    // Verify Lượt khám is highlighted active
    const activeLink = screen.getByRole("link", { name: /Lượt khám/i })
    expect(activeLink).toHaveAttribute("aria-current", "page")

    // Check header user info
    render(<AppHeader />)
    expect(screen.getByText("BS. Trần Minh Khoa")).toBeInTheDocument()
    expect(screen.getByText("Bác sĩ")).toBeInTheDocument()
    expect(screen.getByText("MK")).toBeInTheDocument()
  })

  it("renders page header with breadcrumbs, title, subtitle, and primary/secondary action buttons", async () => {
    renderWithClient(<DoctorWorklistPage />)

    // Breadcrumb
    expect(screen.getByRole("link", { name: "Bác sĩ" })).toBeInTheDocument()
    expect(screen.getAllByText("Danh sách lượt khám").length).toBeGreaterThan(0)

    // Title and Subtitle
    expect(
      screen.getByRole("heading", { name: "Danh sách lượt khám", level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByText("Theo dõi bệnh nhân đang chờ, đang khám và tiến độ xử lý trong ngày.")
    ).toBeInTheDocument()

    // Action buttons
    expect(screen.getByRole("button", { name: /Làm mới/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Bộ lọc nâng cao/i })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Tiếp tục lượt đang khám|Khám bệnh nhân tiếp theo/i })
    ).toBeInTheDocument()
  })

  it("renders 5 compact workload summary cards with exact counts", async () => {
    renderWithClient(<DoctorWorklistPage />)

    const countersRegion = screen.getByRole("region", { name: "Tổng quan tiến độ trong ngày" })
    await waitFor(() => {
      expect(countersRegion).toHaveTextContent("12") // Chờ khám
      expect(countersRegion).toHaveTextContent("3")  // Đang khám
      expect(countersRegion).toHaveTextContent("6")  // Chờ CLS
      expect(countersRegion).toHaveTextContent("4")  // Chờ kết luận
      expect(countersRegion).toHaveTextContent("18") // Hoàn tất
    })
  })

  it("renders the horizontal filter toolbar with all required fields and default values", async () => {
    renderWithClient(<DoctorWorklistPage />)

    // Search field
    expect(
      screen.getByPlaceholderText("Tìm mã lượt khám, tên bệnh nhân, SĐT...")
    ).toBeInTheDocument()

    // Room select
    expect(screen.getAllByText("Phòng khám").length).toBeGreaterThan(0)

    // Status select
    expect(screen.getAllByText("Trạng thái").length).toBeGreaterThan(0)

    // Doctor select
    expect(screen.getAllByText("Bác sĩ").length).toBeGreaterThan(0)

    // Date input
    expect(screen.getByDisplayValue("25/09/2026")).toBeInTheDocument()

    // Reset button
    expect(screen.getByRole("button", { name: /Xóa lọc/i })).toBeInTheDocument()
  })

  it("renders the sample patient rows with correct data and columns", async () => {
    renderWithClient(<DoctorWorklistPage />)

    await waitFor(() => {
      // Row 1: Trần Thị Hương
      expect(screen.getByText("LK-2026-0913")).toBeInTheDocument()
      expect(screen.getByText("Trần Thị Hương")).toBeInTheDocument()
      expect(screen.getByText("1989 / Nữ")).toBeInTheDocument()
      expect(screen.getByText("08:15")).toBeInTheDocument()
      expect(screen.getByText("Tái khám tăng huyết áp")).toBeInTheDocument()

      // Row 2: Nguyễn Văn Bình
      expect(screen.getByText("LK-2026-0914")).toBeInTheDocument()
      expect(screen.getByText("Nguyễn Văn Bình")).toBeInTheDocument()
      expect(screen.getByText("1978 / Nam")).toBeInTheDocument()
      expect(screen.getByText("08:25")).toBeInTheDocument()
      expect(screen.getByText("Đau ngực, khó thở nhẹ")).toBeInTheDocument()

      // Row 3: Phạm Thu Trang
      expect(screen.getByText("LK-2026-0915")).toBeInTheDocument()
      expect(screen.getByText("Phạm Thu Trang")).toBeInTheDocument()

      // Row 4: Lê Minh Anh
      expect(screen.getByText("LK-2026-0916")).toBeInTheDocument()
      expect(screen.getByText("Lê Minh Anh")).toBeInTheDocument()

      // Row 5: Vũ Thị Hoa
      expect(screen.getByText("LK-2026-0917")).toBeInTheDocument()
      expect(screen.getByText("Vũ Thị Hoa")).toBeInTheDocument()

      // Row 6: Đỗ Quang Huy
      expect(screen.getByText("LK-2026-0918")).toBeInTheDocument()
      expect(screen.getByText("Đỗ Quang Huy")).toBeInTheDocument()

      // Row 7: Bùi Ngọc Lan
      expect(screen.getByText("LK-2026-0919")).toBeInTheDocument()
      expect(screen.getByText("Bùi Ngọc Lan")).toBeInTheDocument()

      // Row 8: Trần Đức Long
      expect(screen.getByText("LK-2026-0920")).toBeInTheDocument()
      expect(screen.getByText("Trần Đức Long")).toBeInTheDocument()
    })

    // Pagination info
    expect(screen.getByText(/Hiển thị/i)).toBeInTheDocument()
    expect(screen.getAllByText("1").length).toBeGreaterThan(0)
    expect(screen.getAllByText("8").length).toBeGreaterThan(0)
    expect(screen.getByText("43")).toBeInTheDocument()
  })

  it("navigates to encounter detail when clicking header action", async () => {
    const user = userEvent.setup()
    renderWithClient(<DoctorWorklistPage />)

    await waitFor(() => {
      expect(screen.getByText("Trần Thị Hương")).toBeInTheDocument()
    })

    const nextBtn = screen.getByRole("button", { name: /Tiếp tục lượt đang khám|Khám bệnh nhân tiếp theo/i })
    await user.click(nextBtn)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
      expect(mockPush.mock.calls[0][0]).toMatch(/\/patients\/.*\/encounters\/.*/)
    })
  })

  it("opens DoctorQuickViewSheet when clicking the quick view eye icon and can navigate to encounter detail", async () => {
    const user = userEvent.setup()
    renderWithClient(<DoctorWorklistPage />)

    await waitFor(() => {
      expect(screen.getByText("Trần Thị Hương")).toBeInTheDocument()
    })

    const eyeBtn = screen.getByRole("button", { name: /Xem nhanh thông tin Trần Thị Hương/i })
    await user.click(eyeBtn)

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Thông tin tiếp nhận")).toBeInTheDocument()
    })

    const detailBtn = screen.getByRole("button", { name: /Mở hồ sơ chi tiết/i })
    await user.click(detailBtn)

    expect(mockPush).toHaveBeenCalledWith("/patients/pat-001/encounters/enc-001")
  })

  it("renders status-aware primary actions in table rows and navigates directly to Encounter Detail", async () => {
    const user = userEvent.setup()
    renderWithClient(<DoctorWorklistPage />)

    await waitFor(() => {
      expect(screen.getByText("Trần Thị Hương")).toBeInTheDocument()
    })

    // Check status-aware button labels exist
    expect(screen.getAllByRole("button", { name: "Bắt đầu khám" }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("button", { name: "Tiếp tục khám" }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("button", { name: "Xem kết quả" }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("button", { name: "Kết luận" }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("button", { name: "Xem hồ sơ" }).length).toBeGreaterThan(0)

    // Click "Bắt đầu khám" for Trần Thị Hương
    const startBtn = screen.getAllByRole("button", { name: "Bắt đầu khám" })[0]
    await user.click(startBtn)

    expect(mockPush).toHaveBeenCalledWith("/patients/pat-001/encounters/enc-001")
  })

  it("opens DoctorAdvancedFilterDialog when clicking 'Bộ lọc nâng cao' with clean business options", async () => {
    const user = userEvent.setup()
    renderWithClient(<DoctorWorklistPage />)

    const filterBtn = screen.getByRole("button", { name: /Bộ lọc nâng cao/i })
    await user.click(filterBtn)

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Mức độ ưu tiên lâm sàng")).toBeInTheDocument()
      expect(screen.getByText("Loại hình khám")).toBeInTheDocument()
      // Business rules: No BHYT, No corporate alias, No children in priority
      expect(screen.queryByText(/BHYT/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/trẻ em/i)).not.toBeInTheDocument()
    })
  })

  it("filters encounters when entering search text in filter toolbar", async () => {
    const user = userEvent.setup()
    renderWithClient(<DoctorWorklistPage />)

    await waitFor(() => {
      expect(screen.getByText("Trần Thị Hương")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Tìm mã lượt khám, tên bệnh nhân, SĐT...")
    await user.type(searchInput, "Nguyễn Văn Bình")

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Bình")).toBeInTheDocument()
      expect(screen.queryByText("Trần Thị Hương")).not.toBeInTheDocument()
    })
  })

  it("supports accurate doctor, date, and examType filtering in API", async () => {
    const { fetchDoctorWorklist, fetchDoctorNextAction, startDoctorEncounter } = await import("../api")

    // Doctor filter
    const anResult = await fetchDoctorWorklist({ doctor: "BS. Nguyễn Văn An" })
    expect(anResult.items.length).toBeGreaterThan(0)
    anResult.items.forEach((item) => {
      expect(item.assignedDoctor).toBe("BS. Nguyễn Văn An")
    })

    // Exam type filter
    const orgResult = await fetchDoctorWorklist({ examType: "ORGANIZATION" })
    expect(orgResult.items.length).toBeGreaterThan(0)
    orgResult.items.forEach((item) => {
      expect(item.examType).toBe("ORGANIZATION")
    })

    // Date filter
    const dateResult = await fetchDoctorWorklist({ date: "25/09/2026" })
    expect(dateResult.items.length).toBeGreaterThan(0)
    const invalidDateResult = await fetchDoctorWorklist({ date: "01/01/2099" })
    expect(invalidDateResult.items.length).toBe(0)

    // Next Action Rule: Prioritize EXAMINING, then WAITING_EXAM by clinical priority
    const nextAction1 = await fetchDoctorNextAction("Của tôi")
    expect(nextAction1.actionType).toBe("CONTINUE")
    expect(nextAction1.encounter?.patientName).toBe("Nguyễn Văn Bình")

    // Start another encounter
    const started = await startDoctorEncounter("enc-001")
    expect(started?.status).toBe("EXAMINING")
  })
})
