import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DoctorWorklistPage } from "../pages/doctor-worklist-page"
import { AppSidebar } from "@/widgets/app-sidebar/app-sidebar"
import { AppHeader } from "@/widgets/app-header/app-header"

// Mock next/navigation
const mockPathname = vi.fn(() => "/doctor")
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
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
    expect(screen.getByRole("link", { name: /Chỉ định/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Thanh toán/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Doanh nghiệp/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Báo cáo/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Cài đặt/i })).toBeInTheDocument()

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
      screen.getByRole("button", { name: /Mở lượt khám tiếp theo/i })
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

  it("opens DoctorEncounterDialog when clicking 'Mở lượt khám tiếp theo'", async () => {
    const user = userEvent.setup()
    renderWithClient(<DoctorWorklistPage />)

    await waitFor(() => {
      expect(screen.getByText("Trần Thị Hương")).toBeInTheDocument()
    })

    const nextBtn = screen.getByRole("button", { name: /Mở lượt khám tiếp theo/i })
    await user.click(nextBtn)

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText(/Hồ sơ khám: Trần Thị Hương/i)).toBeInTheDocument()
      expect(screen.getByText("Chỉ số sinh hiệu ban đầu")).toBeInTheDocument()
    })
  })

  it("opens DoctorQuickViewSheet when clicking the quick view eye icon", async () => {
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
  })

  it("opens DoctorOrdersDialog when clicking the clipboard icon", async () => {
    const user = userEvent.setup()
    renderWithClient(<DoctorWorklistPage />)

    await waitFor(() => {
      expect(screen.getByText("Trần Thị Hương")).toBeInTheDocument()
    })

    const ordersBtn = screen.getByRole("button", { name: /Xem phiếu chỉ định của Trần Thị Hương/i })
    await user.click(ordersBtn)

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Phiếu chỉ định cận lâm sàng")).toBeInTheDocument()
    })
  })

  it("opens DoctorAdvancedFilterDialog when clicking 'Bộ lọc nâng cao'", async () => {
    const user = userEvent.setup()
    renderWithClient(<DoctorWorklistPage />)

    const filterBtn = screen.getByRole("button", { name: /Bộ lọc nâng cao/i })
    await user.click(filterBtn)

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Mức độ ưu tiên lâm sàng")).toBeInTheDocument()
      expect(screen.getByText("Loại hình khám")).toBeInTheDocument()
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
})
