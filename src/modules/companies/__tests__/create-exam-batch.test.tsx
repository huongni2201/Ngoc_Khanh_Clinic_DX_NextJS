import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CreateExamBatchDialog } from "../components/create-exam-batch-dialog"
import { EnterpriseDetail } from "../types"
import type { ExamBatch } from "@/modules/health-check-batches"
import * as healthBatchesApi from "@/modules/health-check-batches/api"

// Mock next/navigation
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/enterprises/ent-2",
  useSearchParams: () => new URLSearchParams(),
}))

const mockEnterprise: EnterpriseDetail = {
  id: "ent-2",
  code: "DN002",
  name: "Công ty Cổ phần FPT",
  contactName: "Nguyễn Văn Hùng",
  phone: "0912 345 678",
  address: "Tòa nhà FPT, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội",
  shortAddress: "Tòa nhà FPT, Cầu Giấy, Hà Nội",
  status: "PARTNERING",
}

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

describe("CreateExamBatchDialog (Screen 03 – Tạo đợt khám mới)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("1 & 2: opens modal with correct enterprise name in title and subtitle", async () => {
    renderWithClient(
      <CreateExamBatchDialog
        open={true}
        onOpenChange={vi.fn()}
        enterprise={mockEnterprise}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    expect(screen.getByText("Tạo đợt khám mới")).toBeInTheDocument()
    expect(
      screen.getByText("Tạo đợt khám cho Công ty Cổ phần FPT")
    ).toBeInTheDocument()
    expect(screen.getByText("Thông tin đợt khám")).toBeInTheDocument()
    expect(screen.getByText("Chọn hạng mục & giá")).toBeInTheDocument()
  })

  it("3: prevents submit and displays validation error when no item is selected", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <CreateExamBatchDialog
        open={true}
        onOpenChange={vi.fn()}
        enterprise={mockEnterprise}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Khám nội tổng quát")).toBeInTheDocument()
    })

    // Fill basic info
    await user.type(
      screen.getByPlaceholderText("Nhập tên đợt khám"),
      "Khám sức khỏe định kỳ 2026"
    )
    await user.type(
      screen.getByPlaceholderText("Nhập địa điểm khám"),
      "140 Xã Đàn, Hà Nội"
    )

    // Click submit without selecting any item
    const submitBtn = screen.getByRole("button", { name: "Tạo đợt khám" })
    await user.click(submitBtn)

    // Should show validation error
    await waitFor(() => {
      expect(
        screen.getByText("Vui lòng chọn ít nhất một hạng mục khám.")
      ).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it("4: enables price input when item checkbox is checked", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <CreateExamBatchDialog
        open={true}
        onOpenChange={vi.fn()}
        enterprise={mockEnterprise}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Khám nội tổng quát")).toBeInTheDocument()
    })

    const kntqCheckbox = screen.getByRole("checkbox", {
      name: "Khám nội tổng quát",
    })
    const kntqPriceInput = screen.getByRole("textbox", {
      name: "Đơn giá cho Khám nội tổng quát",
    })

    // Initially unchecked and disabled with 0 đ
    expect(kntqCheckbox).not.toBeChecked()
    expect(kntqPriceInput).toBeDisabled()
    expect(kntqPriceInput).toHaveValue("0 đ")

    // Check item
    await user.click(kntqCheckbox)

    // Price input becomes enabled and filled with default catalog price (180.000 đ)
    expect(kntqCheckbox).toBeChecked()
    expect(kntqPriceInput).toBeEnabled()
    expect(kntqPriceInput).toHaveValue("180.000 đ")
  })

  it("5: resets price to 0 and disables input when item is unchecked", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <CreateExamBatchDialog
        open={true}
        onOpenChange={vi.fn()}
        enterprise={mockEnterprise}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Xét nghiệm máu")).toBeInTheDocument()
    })

    const xnmCheckbox = screen.getByRole("checkbox", {
      name: "Xét nghiệm máu",
    })
    const xnmPriceInput = screen.getByRole("textbox", {
      name: "Đơn giá cho Xét nghiệm máu",
    })

    // Check item
    await user.click(xnmCheckbox)
    expect(xnmCheckbox).toBeChecked()
    expect(xnmPriceInput).toBeEnabled()

    // Uncheck item
    await user.click(xnmCheckbox)
    expect(xnmCheckbox).not.toBeChecked()
    expect(xnmPriceInput).toBeDisabled()
    expect(xnmPriceInput).toHaveValue("0 đ")
  })

  it("6 & 7: validates unitPrice > 0 for selected items", async () => {
    const user = userEvent.setup()

    renderWithClient(
      <CreateExamBatchDialog
        open={true}
        onOpenChange={vi.fn()}
        enterprise={mockEnterprise}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Khám nội tổng quát")).toBeInTheDocument()
    })

    // Fill basic info
    await user.type(
      screen.getByPlaceholderText("Nhập tên đợt khám"),
      "Khám sức khỏe định kỳ 2026"
    )

    const kntqCheckbox = screen.getByRole("checkbox", {
      name: "Khám nội tổng quát",
    })
    const kntqPriceInput = screen.getByRole("textbox", {
      name: "Đơn giá cho Khám nội tổng quát",
    })

    // Check item
    await user.click(kntqCheckbox)
    expect(kntqPriceInput).toBeEnabled()

    // Clear price and type 0
    await user.clear(kntqPriceInput)
    await user.type(kntqPriceInput, "0")

    // Attempt submit
    const submitBtn = screen.getByRole("button", { name: "Tạo đợt khám" })
    await user.click(submitBtn)

    // Should show inline error
    await waitFor(() => {
      expect(screen.getByText("Đơn giá phải lớn hơn 0.")).toBeInTheDocument()
    })

    // Now type valid price > 0
    await user.clear(kntqPriceInput)
    await user.type(kntqPriceInput, "180000")

    // Error should disappear when price becomes valid > 0
    await waitFor(() => {
      expect(
        screen.queryByText("Đơn giá phải lớn hơn 0.")
      ).not.toBeInTheDocument()
    })
  })

  it("8, 9 & 10: successfully creates batch, sends only selected items, closes modal, and navigates to batch detail", async () => {
    const user = userEvent.setup()
    const handleOpenChange = vi.fn()
    const createSpy = vi
      .spyOn(healthBatchesApi, "createExamBatch")
      .mockResolvedValueOnce({
        id: "batch-mock-123",
        code: "DK001",
        enterpriseId: "ent-2",
        name: "Khám sức khỏe CBNV 2026",
        examDate: "15/09/2026",
        location: "140 Xã Đàn, Hà Nội",
        employeeCount: 0,
        status: "IN_PROGRESS",
        items: [
          {
            examinationItemId: "item-kntq",
            name: "Khám nội tổng quát",
            unitPrice: 180000,
          },
          {
            examinationItemId: "item-xnm",
            name: "Xét nghiệm máu",
            unitPrice: 220000,
          },
        ],
        createdAt: "15/09/2026",
        updatedAt: "15/09/2026",
      })

    renderWithClient(
      <CreateExamBatchDialog
        open={true}
        onOpenChange={handleOpenChange}
        enterprise={mockEnterprise}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Khám nội tổng quát")).toBeInTheDocument()
    })

    // 1. Basic info
    await user.type(
      screen.getByPlaceholderText("Nhập tên đợt khám"),
      "Khám sức khỏe CBNV 2026"
    )

    // Exam date: click trigger button then pick day
    const dateBtn = screen.getByRole("button", { name: /Chọn ngày khám/i })
    await user.click(dateBtn)

    // Pick a day button
    const dayBtn = await screen.findByText("15")
    await user.click(dayBtn)

    // 2. Select exactly 2 items out of catalog
    const kntqCheckbox = screen.getByRole("checkbox", {
      name: "Khám nội tổng quát",
    })
    const xnmCheckbox = screen.getByRole("checkbox", {
      name: "Xét nghiệm máu",
    })

    await user.click(kntqCheckbox)
    await user.click(xnmCheckbox)

    // 3. Submit
    const submitBtn = screen.getByRole("button", { name: "Tạo đợt khám" })
    await user.click(submitBtn)

    // 4. Verify API called with only the 2 selected items
    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledTimes(1)
    })

    const payload = createSpy.mock.calls[0][0]
    expect(payload.enterpriseId).toBe("ent-2")
    expect(payload.name).toBe("Khám sức khỏe CBNV 2026")
    expect(payload.items).toHaveLength(2)
    expect(payload.items.map((i) => i.examinationItemId)).toEqual([
      "item-kntq",
      "item-xnm",
    ])
    // Unchecked items are NOT sent in the payload
    expect(payload.items.some((i) => i.examinationItemId === "item-xnnt")).toBe(
      false
    )

    // 5. Modal closes & Router navigates to new batch detail
    await waitFor(() => {
      expect(handleOpenChange).toHaveBeenCalledWith(false)
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringMatching(/^\/enterprises\/ent-2\/exam-batches\/batch-/)
      )
    })
  })

  it("11: preserves user entered data and shows error alert when submit fails", async () => {
    const user = userEvent.setup()
    const handleOpenChange = vi.fn()
    vi.spyOn(healthBatchesApi, "createExamBatch").mockRejectedValueOnce(
      new Error("Lỗi kết nối máy chủ phòng khám (500)")
    )

    renderWithClient(
      <CreateExamBatchDialog
        open={true}
        onOpenChange={handleOpenChange}
        enterprise={mockEnterprise}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Khám nội tổng quát")).toBeInTheDocument()
    })

    const nameInput = screen.getByPlaceholderText("Nhập tên đợt khám")
    await user.type(nameInput, "Đợt khám thử nghiệm lỗi")

    // Date
    const dateBtn = screen.getByRole("button", { name: /Chọn ngày khám/i })
    await user.click(dateBtn)
    const dayBtn = await screen.findByText("15")
    await user.click(dayBtn)

    // Check 1 item
    const kntqCheckbox = screen.getByRole("checkbox", {
      name: "Khám nội tổng quát",
    })
    await user.click(kntqCheckbox)

    // Submit
    const submitBtn = screen.getByRole("button", { name: "Tạo đợt khám" })
    await user.click(submitBtn)

    // Verify error shown and modal NOT closed
    await waitFor(() => {
      expect(
        screen.getByText("Lỗi kết nối máy chủ phòng khám (500)")
      ).toBeInTheDocument()
    })

    expect(handleOpenChange).not.toHaveBeenCalledWith(false)
    expect(nameInput).toHaveValue("Đợt khám thử nghiệm lỗi")
  })

  it("12: disables submit button while pending to prevent double-submit", async () => {
    const user = userEvent.setup()
    let resolvePromise!: (val: ExamBatch) => void
    const pendingPromise = new Promise<ExamBatch>((resolve) => {
      resolvePromise = resolve
    })

    vi.spyOn(healthBatchesApi, "createExamBatch").mockReturnValueOnce(
      pendingPromise
    )

    renderWithClient(
      <CreateExamBatchDialog
        open={true}
        onOpenChange={vi.fn()}
        enterprise={mockEnterprise}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Khám nội tổng quát")).toBeInTheDocument()
    })

    await user.type(
      screen.getByPlaceholderText("Nhập tên đợt khám"),
      "Khám kiểm tra double click"
    )

    // Date
    const dateBtn = screen.getByRole("button", { name: /Chọn ngày khám/i })
    await user.click(dateBtn)
    const dayBtn = await screen.findByText("15")
    await user.click(dayBtn)

    // Check item
    const kntqCheckbox = screen.getByRole("checkbox", {
      name: "Khám nội tổng quát",
    })
    await user.click(kntqCheckbox)

    const submitBtn = screen.getByRole("button", { name: "Tạo đợt khám" })
    await user.click(submitBtn)

    // While request is in flight, button is disabled
    expect(submitBtn).toBeDisabled()

    // Resolve promise
    resolvePromise!({
      id: "batch-123",
      code: "DK999",
      enterpriseId: "ent-2",
      name: "Khám kiểm tra double click",
      examDate: "20/09/2026",
      location: "Hà Nội",
      employeeCount: 0,
      status: "IN_PROGRESS",
      items: [],
      createdAt: "20/09/2026",
      updatedAt: "20/09/2026",
    })
  })
})
