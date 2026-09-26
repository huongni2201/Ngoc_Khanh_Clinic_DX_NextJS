import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OrganizationExaminationDetailTab } from "../components/organization-examination-detail-tab"
import { resetOrganizationsStore } from "../api"

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

describe("OrganizationExaminationDetailTab (Tab 3: Chi tiết khám)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetOrganizationsStore()
  })

  it("renders batch selector, operational counters, and patient-centric table", async () => {
    renderWithClient(<OrganizationExaminationDetailTab organizationId="ent-2" />)

    // Batch selector & active batch metadata
    await waitFor(() => {
      expect(screen.getByText("Đợt khám:")).toBeInTheDocument()
      expect(screen.getByText(/Khám sức khỏe định kỳ 2026/i)).toBeInTheDocument()
    })

    // Counters strip
    expect(screen.getByText("Tổng số người")).toBeInTheDocument()
    expect(screen.getByText("Đã tiếp nhận")).toBeInTheDocument()
    expect(screen.getByText("Đang khám")).toBeInTheDocument()
    expect(screen.getByText("Hoàn thành")).toBeInTheDocument()
    expect(screen.getByText("Chưa đến")).toBeInTheDocument()

    // Patient-centric table headers per Section 8.5
    expect(screen.getByText("Người khám")).toBeInTheDocument()
    expect(screen.getByText("Tiếp nhận")).toBeInTheDocument()
    expect(screen.getByText("Khám BS")).toBeInTheDocument()
    expect(screen.getByText("Dịch vụ")).toBeInTheDocument()
    expect(screen.getByText("Kết luận")).toBeInTheDocument()
    expect(screen.getByText("Trạng thái")).toBeInTheDocument()
    expect(screen.getByText("Thao tác")).toBeInTheDocument()
  })

  it("filters participants by search input", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationExaminationDetailTab organizationId="ent-2" />)

    await waitFor(() => {
      expect(screen.getByText("Trần Minh Đức")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Tìm theo họ tên, CCCD, mã người khám/i)
    await user.type(searchInput, "Nguyễn Thu Hà")

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Thu Hà")).toBeInTheDocument()
      expect(screen.queryByText("Trần Minh Đức")).not.toBeInTheDocument()
    })
  })

  it("toggles uncompletedOnly filter", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationExaminationDetailTab organizationId="ent-2" />)

    await waitFor(() => {
      expect(screen.getByText("Trần Minh Đức")).toBeInTheDocument()
    })

    const uncompletedCheckbox = screen.getByRole("checkbox", { name: /Chưa hoàn thành/i })
    await user.click(uncompletedCheckbox)

    await waitFor(() => {
      // Completed badges should be filtered out
      const badges = screen.queryAllByText("Hoàn thành")
      // Filter label might match or summary counter, but table rows shouldn't have status "Hoàn thành"
      const completedRows = badges.filter(
        (el) => el.tagName === "SPAN" && el.className.includes("text-status-completed")
      )
      expect(completedRows.length).toBe(0)
    })
  })

  it("opens participant drawer on row click and shows encounter and services progress", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationExaminationDetailTab organizationId="ent-2" />)

    await waitFor(() => {
      expect(screen.getByText("Trần Minh Đức")).toBeInTheDocument()
    })

    // Click participant row
    await user.click(screen.getByText("Trần Minh Đức"))

    // Drawer should open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Thông tin tiếp nhận & Khám lâm sàng")).toBeInTheDocument()
      expect(screen.getByText(/Tiến độ dịch vụ/i)).toBeInTheDocument()
      expect(screen.getByText("Kết luận khám sức khỏe")).toBeInTheDocument()
      expect(screen.getByText(/Mở hồ sơ lượt khám chi tiết/i)).toBeInTheDocument()
    })
  })

  it("renders empty state when organization has no batches", async () => {
    renderWithClient(<OrganizationExaminationDetailTab organizationId="nonexistent-org" />)

    await waitFor(() => {
      expect(screen.getByText("Chưa có đợt khám nào")).toBeInTheDocument()
    })
    expect(screen.getByText(/Đơn vị này chưa có đợt khám sức khỏe nào được cấu hình/i)).toBeInTheDocument()
  })
})
