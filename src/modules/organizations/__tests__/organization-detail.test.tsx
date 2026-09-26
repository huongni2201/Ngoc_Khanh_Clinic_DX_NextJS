import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OrganizationDetailPage } from "../pages/organization-detail-page"
import { resetOrganizationsStore } from "../api"

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  usePathname: () => "/organizations/ent-2",
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

describe("OrganizationDetailPage (Screen 02)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetOrganizationsStore()
  })

  it("renders organization detail header, summary strip, tabs, and info card matching reference", async () => {
    renderWithClient(<OrganizationDetailPage organizationId="ent-2" />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Công ty Cổ phần FPT" })).toBeInTheDocument()
    })

    // Header & Badge
    expect(screen.getByText("Đang hợp tác")).toBeInTheDocument()
    expect(screen.getByText("Khách hàng đơn vị")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Chỉnh sửa đơn vị/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Tạo đợt khám mới/i })
    ).toBeInTheDocument()

    // Summary Strip
    expect(screen.getByText("Mã đơn vị")).toBeInTheDocument()
    expect(screen.getByText("DN002")).toBeInTheDocument()
    expect(screen.getAllByText("Nguyễn Văn Hùng").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("0912 345 678").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Tòa nhà FPT, Cầu Giấy, Hà Nội")).toBeInTheDocument()

    // Tabs
    expect(screen.getByRole("button", { name: "Thông tin" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Đợt khám" })).toBeInTheDocument()

    // Info Card
    expect(
      screen.getByRole("heading", { name: "Thông tin đơn vị" })
    ).toBeInTheDocument()
    expect(screen.getByText("0101243150")).toBeInTheDocument()
    expect(screen.getByText("hungnv@fpt.com.vn")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Tòa nhà FPT, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội"
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText("Đối tác khám sức khỏe định kỳ hằng năm.")
    ).toBeInTheDocument()
  })

  it("switches tabs between 'Thông tin' and 'Đợt khám'", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationDetailPage organizationId="ent-2" />)

    await waitFor(() => {
      expect(screen.getByText("Thông tin đơn vị")).toBeInTheDocument()
    })

    // Switch to Đợt khám tab
    const batchesTab = screen.getByRole("button", { name: "Đợt khám" })
    await user.click(batchesTab)

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Tìm kiếm đợt khám...")
      ).toBeInTheDocument()
    })

    // Switch back to Thông tin tab
    const infoTab = screen.getByRole("button", { name: "Thông tin" })
    await user.click(infoTab)

    await waitFor(() => {
      expect(screen.getByText("Thông tin đơn vị")).toBeInTheDocument()
    })
  })

  it("opens edit dialog and can update organization details", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationDetailPage organizationId="ent-2" />)

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Chỉnh sửa đơn vị/i })
      ).toBeInTheDocument()
    })

    // Click edit button
    const editBtn = screen.getByRole("button", {
      name: /Chỉnh sửa đơn vị/i,
    })
    await user.click(editBtn)

    // Dialog appears
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Chỉnh sửa đơn vị" })
    ).toBeInTheDocument()

    // Form inputs should be pre-filled
    const nameInput = screen.getByLabelText(/Tên đơn vị/i)
    expect(nameInput).toHaveValue("Công ty Cổ phần FPT")

    // Update name
    await user.clear(nameInput)
    await user.type(nameInput, "Công ty Cổ phần FPT (Đã đổi tên)")

    // Submit form
    const submitBtn = screen.getByRole("button", { name: "Lưu thay đổi" })
    await user.click(submitBtn)

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  it("opens create exam batch dialog", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationDetailPage organizationId="ent-2" />)

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Tạo đợt khám mới/i })
      ).toBeInTheDocument()
    })

    // Click create exam batch
    const createBatchBtn = screen.getByRole("button", {
      name: /Tạo đợt khám mới/i,
    })
    await user.click(createBatchBtn)

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })
    expect(
      screen.getByText(/Tạo đợt khám cho/i)
    ).toBeInTheDocument()
    expect(screen.getByText("Thông tin đợt khám")).toBeInTheDocument()
    expect(screen.getByText("Chọn hạng mục & giá")).toBeInTheDocument()

    // Close dialog
    const cancelBtn = screen.getByRole("button", { name: "Hủy" })
    await user.click(cancelBtn)

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  it("renders error state when organization is not found", async () => {
    renderWithClient(<OrganizationDetailPage organizationId="nonexistent-999" />)

    await waitFor(() => {
      expect(
        screen.getByText("Không tìm thấy hoặc không thể tải dữ liệu đơn vị")
      ).toBeInTheDocument()
    })

    expect(
      screen.getByRole("button", { name: /Thử lại/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Về danh sách đơn vị/i })
    ).toBeInTheDocument()
  })

  it("renders all 4 tabs and switches to 'Chi tiết khám' tab with operational summary and drawer", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationDetailPage organizationId="ent-2" />)

    await waitFor(() => {
      expect(screen.getByText("Thông tin đơn vị")).toBeInTheDocument()
    })

    // Verify all 4 tabs exist
    expect(screen.getByRole("button", { name: "Thông tin" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Đợt khám" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Chi tiết khám" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Báo cáo" })).toBeInTheDocument()

    // Click 'Chi tiết khám' tab
    const examTab = screen.getByRole("button", { name: "Chi tiết khám" })
    await user.click(examTab)

    // Should call router.replace with ?tab=examinations
    expect(mockReplace).toHaveBeenCalledWith("/organizations/ent-2?tab=examinations", { scroll: false })

    // Verify operational summary cards in Chi tiết khám
    await waitFor(() => {
      expect(screen.getByText("Tổng số người")).toBeInTheDocument()
      expect(screen.getByText("Đã tiếp nhận")).toBeInTheDocument()
      expect(screen.getByText("Đang khám")).toBeInTheDocument()
      expect(screen.getByText("Hoàn thành")).toBeInTheDocument()
      expect(screen.getByText("Chưa đến")).toBeInTheDocument()
    })

    // Verify patient-centric table headers
    expect(screen.getByText("Người khám")).toBeInTheDocument()
    expect(screen.getByText("Tiếp nhận")).toBeInTheDocument()
    expect(screen.getByText("Khám BS")).toBeInTheDocument()
    expect(screen.getByText("Dịch vụ")).toBeInTheDocument()
    expect(screen.getByText("Kết luận")).toBeInTheDocument()

    // Find a participant row and click it to open drawer
    await waitFor(() => {
      expect(screen.getByText("Trần Minh Đức")).toBeInTheDocument()
    })

    const participantRow = screen.getByText("Trần Minh Đức")
    await user.click(participantRow)

    // Verify drawer appears with participant details
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Thông tin tiếp nhận & Khám lâm sàng")).toBeInTheDocument()
      expect(screen.getByText(/Tiến độ dịch vụ/i)).toBeInTheDocument()
      expect(screen.getByText("Kết luận khám sức khỏe")).toBeInTheDocument()
    })
  })

  it("switches to 'Báo cáo' tab, shows cost calculation and supports switching between vertical and horizontal reports", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationDetailPage organizationId="ent-2" />)

    await waitFor(() => {
      expect(screen.getByText("Thông tin đơn vị")).toBeInTheDocument()
    })

    // Click 'Báo cáo' tab
    const reportsTab = screen.getByRole("button", { name: "Báo cáo" })
    await user.click(reportsTab)

    expect(mockReplace).toHaveBeenCalledWith("/organizations/ent-2?tab=reports", { scroll: false })

    // Verify report notice banner & export buttons
    await waitFor(() => {
      expect(screen.getByText(/Dữ liệu tạm tính/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Xuất Excel \(Ngang\)/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Xuất Excel \(Dọc\)/i })).toBeInTheDocument()
    })

    // Verify default view is Vertical Cost Report (Report Type B)
    expect(
      screen.getByRole("button", { name: /Báo cáo theo dịch vụ & chi phí \(Dọc\)/i })
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Hạng mục dịch vụ")).toBeInTheDocument()
      expect(screen.getByText("Số lượng thực tế")).toBeInTheDocument()
      expect(screen.getByText("Đơn giá hợp đồng")).toBeInTheDocument()
      expect(screen.getByText("Thành tiền")).toBeInTheDocument()
      expect(screen.getByText("Tổng cộng chi phí thực tế:")).toBeInTheDocument()
    })

    // Switch to Horizontal Participant Matrix Report (Report Type A)
    const horizontalReportBtn = screen.getByRole("button", {
      name: /Báo cáo theo người khám \(Ngang\)/i,
    })
    await user.click(horizontalReportBtn)

    await waitFor(() => {
      expect(screen.getByText("Mã NK")).toBeInTheDocument()
      expect(screen.getByText("Đơn vị công tác")).toBeInTheDocument()
    })
  })
})

