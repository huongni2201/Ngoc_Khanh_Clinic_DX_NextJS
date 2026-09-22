import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { EnterpriseDetailPage } from "../pages/enterprise-detail-page"
import { resetEnterprisesStore } from "../api"

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  usePathname: () => "/enterprises/ent-2",
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

describe("EnterpriseDetailPage (Screen 02)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetEnterprisesStore()
  })

  it("renders enterprise detail header, summary strip, tabs, and info card matching reference", async () => {
    renderWithClient(<EnterpriseDetailPage enterpriseId="ent-2" />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Công ty Cổ phần FPT" })).toBeInTheDocument()
    })

    // Header & Badge
    expect(screen.getByText("Đang hợp tác")).toBeInTheDocument()
    expect(screen.getByText("Khách hàng doanh nghiệp")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Chỉnh sửa doanh nghiệp/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Tạo đợt khám mới/i })
    ).toBeInTheDocument()

    // Summary Strip
    expect(screen.getByText("Mã doanh nghiệp")).toBeInTheDocument()
    expect(screen.getByText("DN002")).toBeInTheDocument()
    expect(screen.getAllByText("Nguyễn Văn Hùng").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("0912 345 678").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Tòa nhà FPT, Cầu Giấy, Hà Nội")).toBeInTheDocument()

    // Tabs
    expect(screen.getByRole("button", { name: "Thông tin" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Đợt khám" })).toBeInTheDocument()

    // Info Card
    expect(
      screen.getByRole("heading", { name: "Thông tin doanh nghiệp" })
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
    renderWithClient(<EnterpriseDetailPage enterpriseId="ent-2" />)

    await waitFor(() => {
      expect(screen.getByText("Thông tin doanh nghiệp")).toBeInTheDocument()
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
      expect(screen.getByText("Thông tin doanh nghiệp")).toBeInTheDocument()
    })
  })

  it("opens edit dialog and can update enterprise details", async () => {
    const user = userEvent.setup()
    renderWithClient(<EnterpriseDetailPage enterpriseId="ent-2" />)

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Chỉnh sửa doanh nghiệp/i })
      ).toBeInTheDocument()
    })

    // Click edit button
    const editBtn = screen.getByRole("button", {
      name: /Chỉnh sửa doanh nghiệp/i,
    })
    await user.click(editBtn)

    // Dialog appears
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Chỉnh sửa doanh nghiệp" })
    ).toBeInTheDocument()

    // Form inputs should be pre-filled
    const nameInput = screen.getByLabelText(/Tên doanh nghiệp/i)
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
    renderWithClient(<EnterpriseDetailPage enterpriseId="ent-2" />)

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

  it("renders error state when enterprise is not found", async () => {
    renderWithClient(<EnterpriseDetailPage enterpriseId="nonexistent-999" />)

    await waitFor(() => {
      expect(
        screen.getByText("Không tìm thấy hoặc không thể tải dữ liệu doanh nghiệp")
      ).toBeInTheDocument()
    })

    expect(
      screen.getByRole("button", { name: /Thử lại/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Về danh sách doanh nghiệp/i })
    ).toBeInTheDocument()
  })
})
