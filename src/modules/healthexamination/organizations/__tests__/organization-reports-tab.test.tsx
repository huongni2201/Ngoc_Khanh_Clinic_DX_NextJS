import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { OrganizationReportsTab } from "@/modules/healthexamination/batches/components/report-tab/organization-reports-tab"
import { renderWithClient } from "@/test-utils/render-with-client"

describe("OrganizationReportsTab (Tab 4: Báo cáo)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders batch selector, report notice, and vertical cost summary by default", async () => {
    renderWithClient(
      <OrganizationReportsTab
        organizationId="ent-2"
        organizationName="Công ty Cổ phần FPT"
      />
    )

    // Batch selector
    await waitFor(() => {
      expect(screen.getByText("Đợt khám:")).toBeInTheDocument()
      expect(screen.getByText(/Khám sức khỏe định kỳ 2026/i)).toBeInTheDocument()
    })

    // Notice banner
    expect(screen.getByText(/Dữ liệu tạm tính/i)).toBeInTheDocument()

    // Export buttons
    expect(screen.getByRole("button", { name: /Xuất Excel \(Ngang\)/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Xuất Excel \(Dọc\)/i })).toBeInTheDocument()

    // Vertical table headers
    await waitFor(() => {
      expect(screen.getByText("Hạng mục dịch vụ")).toBeInTheDocument()
      expect(screen.getByText("Số lượng thực tế")).toBeInTheDocument()
      expect(screen.getByText("Đơn giá hợp đồng")).toBeInTheDocument()
      expect(screen.getByText("Thành tiền")).toBeInTheDocument()
      expect(screen.getByText("Tổng cộng chi phí thực tế:")).toBeInTheDocument()
    })

    // Formula principle footnote
    expect(
      screen.getByText(/Nguyên tắc tính: Thành tiền = Số lượng thực tế đã chỉ định và thực hiện × Đơn giá hợp đồng/i)
    ).toBeInTheDocument()
  })

  it("switches to Horizontal Participant Matrix report (Type A)", async () => {
    const user = userEvent.setup()
    renderWithClient(
      <OrganizationReportsTab
        organizationId="ent-2"
        organizationName="Công ty Cổ phần FPT"
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Hạng mục dịch vụ")).toBeInTheDocument()
    })

    const horizontalTabBtn = screen.getByRole("button", {
      name: /Báo cáo theo người khám \(Ngang\)/i,
    })
    await user.click(horizontalTabBtn)

    await waitFor(() => {
      expect(screen.getByText("Mã NK")).toBeInTheDocument()
      expect(screen.getByText("Họ tên")).toBeInTheDocument()
      expect(screen.getByText("Đơn vị công tác")).toBeInTheDocument()
      expect(screen.getByText("Kết luận")).toBeInTheDocument()
    })

    expect(
      screen.getByText(/Báo cáo ngang phản ánh dịch vụ thực tế từng người khám đã thực hiện/i)
    ).toBeInTheDocument()
  })

  it("renders empty state when organization has no batches", async () => {
    renderWithClient(
      <OrganizationReportsTab
        organizationId="nonexistent-org"
        organizationName="Đơn vị mới"
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Chưa có đợt khám nào để tạo báo cáo")).toBeInTheDocument()
    })
  })
})
