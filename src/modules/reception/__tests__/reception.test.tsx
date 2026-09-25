import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReceptionPage } from "../pages/reception-page"
import { PaymentDialog } from "../components/payment-dialog"
import { PrintExaminationDialog } from "../components/print-examination-dialog"
import { AssignRoomDialog } from "../components/assign-room-dialog"
import { resetReceptionStore, initialEncounters } from "../api"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/reception",
  useSearchParams: () => new URLSearchParams(),
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

describe("Reception Module (Screen 01 - 07)", () => {
  beforeEach(() => {
    resetReceptionStore()
    vi.clearAllMocks()
  })

  it("renders page header, compact actions, operational counters, and patient worklist table", async () => {
    renderWithClient(<ReceptionPage />)

    // Title and breadcrumb
    expect(screen.getByRole("heading", { name: "Lễ tân" })).toBeInTheDocument()

    // Header compact actions: Only global, non-patient-specific actions
    expect(
      screen.getByRole("button", { name: /Tiếp nhận bệnh nhân/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Tìm bệnh nhân/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Tạo bệnh nhân mới/i })
    ).toBeInTheDocument()

    // Operational Counters strip (Height 72-88px row)
    await waitFor(() => {
      expect(screen.getAllByText("Chờ tiếp nhận").length).toBeGreaterThan(0)
      expect(screen.getAllByText("Đang khám").length).toBeGreaterThan(0)
      expect(screen.getAllByText("Chờ thu phí").length).toBeGreaterThan(0)
      expect(screen.getAllByText("Chờ kết quả").length).toBeGreaterThan(0)
      expect(screen.getAllByText("Hoàn tất hôm nay").length).toBeGreaterThan(0)
    })

    // Main Work Area: Bệnh nhân hôm nay
    expect(screen.getByText("Bệnh nhân hôm nay")).toBeInTheDocument()

    // Verify patient rows loaded
    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Minh")).toBeInTheDocument()
      expect(screen.getByText("Trần Thị Mai")).toBeInTheDocument()
      expect(screen.getByText("Lê Đức Anh")).toBeInTheDocument()
    })

    // Verify per-patient quick action buttons in table rows
    expect(
      screen.getByRole("button", { name: /In giấy khám bệnh cho Nguyễn Văn Minh/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /In giấy khám bệnh cho Trần Thị Mai/i })
    ).toBeInTheDocument()
  })

  it("displays context-sensitive actions for different patient stages", async () => {
    renderWithClient(<ReceptionPage />)

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Minh")).toBeInTheDocument()
    })

    // WAITING_RECEPTION has "Tiếp nhận"
    const tiepNhanBtns = screen.getAllByRole("button", { name: "Tiếp nhận" })
    expect(tiepNhanBtns.length).toBeGreaterThan(0)

    // RECEIVED has "Phân phòng"
    const phanPhongBtns = screen.getAllByRole("button", { name: "Phân phòng" })
    expect(phanPhongBtns.length).toBeGreaterThan(0)

    // WAITING_PAYMENT has "Thu phí"
    const thuPhiBtns = screen.getAllByRole("button", { name: "Thu phí" })
    expect(thuPhiBtns.length).toBeGreaterThan(0)

    // WAITING_EXAM & EXAMINING have "Xem lượt khám"
    const xemLuotKhamBtns = screen.getAllByRole("button", { name: "Xem lượt khám" })
    expect(xemLuotKhamBtns.length).toBeGreaterThan(0)

    // WAITING_RESULT has "Xem tiến trình"
    const xemTienTrinhBtns = screen.getAllByRole("button", { name: "Xem tiến trình" })
    expect(xemTienTrinhBtns.length).toBeGreaterThan(0)

    // COMPLETED has "Xem hồ sơ"
    const xemHoSoBtns = screen.getAllByRole("button", { name: "Xem hồ sơ" })
    expect(xemHoSoBtns.length).toBeGreaterThan(0)
  })

  it("opens PrintExaminationDialog for the exact patient when clicking row print button", async () => {
    renderWithClient(<ReceptionPage />)

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Minh")).toBeInTheDocument()
    })

    const printBtn = screen.getByRole("button", {
      name: /In giấy khám bệnh cho Nguyễn Văn Minh/i,
    })
    await userEvent.click(printBtn)

    await waitFor(() => {
      expect(screen.getByText("In giấy khám bệnh")).toBeInTheDocument()
      expect(screen.getByText("NGUYỄN VĂN MINH")).toBeInTheDocument()
    })
  })

  it("strictly enforces that Receptionist does NOT add clinical orders during payment", async () => {
    const enc = initialEncounters.find((e) => e.status === "WAITING_PAYMENT")!

    renderWithClient(
      <PaymentDialog
        open={true}
        onOpenChange={vi.fn()}
        encounter={enc}
      />
    )

    // Must show patient and payment title
    expect(screen.getByText("Thu phí khám bệnh")).toBeInTheDocument()
    expect(screen.getByText(enc.patientName)).toBeInTheDocument()

    // Must NOT have any "+ Thêm dịch vụ" button (violates receptionist clinical boundary)
    expect(screen.queryByText(/Thêm dịch vụ/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Chỉ định dịch vụ/i)).not.toBeInTheDocument()

    // Verifies payment method options (Tiền mặt / Chuyển khoản)
    expect(screen.getByText("Tiền mặt")).toBeInTheDocument()
    expect(screen.getByText("Chuyển khoản")).toBeInTheDocument()
  })

  it("handles payment confirmation and prevents accidental submissions", async () => {
    const enc = initialEncounters.find((e) => e.status === "WAITING_PAYMENT")!
    const onSuccess = vi.fn()

    renderWithClient(
      <PaymentDialog
        open={true}
        onOpenChange={vi.fn()}
        encounter={enc}
        onSuccess={onSuccess}
      />
    )

    // Clicking primary button opens confirmation alert prompt
    const confirmBtn = screen.getByRole("button", { name: "Xác nhận thu tiền" })
    await userEvent.click(confirmBtn)

    // Check confirmation prompt appearance
    await waitFor(() => {
      expect(
        screen.getByText(/Bạn có chắc chắn muốn xác nhận đã thu số tiền/i)
      ).toBeInTheDocument()
    })

    // Now clicking the final confirmation button triggers payment
    const finalBtn = screen.getByRole("button", { name: "Đồng ý thu tiền" })
    await userEvent.click(finalBtn)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it("renders PrintExaminationDialog with clinic branding and patient demographics", async () => {
    const enc = initialEncounters[0]

    renderWithClient(
      <PrintExaminationDialog
        open={true}
        onOpenChange={vi.fn()}
        encounter={enc}
      />
    )

    expect(screen.getByText("In giấy khám bệnh")).toBeInTheDocument()
    expect(
      screen.getByText(/Phòng Khám Đa Khoa Ngọc Khánh/i)
    ).toBeInTheDocument()
    expect(screen.getByText(enc.patientName.toUpperCase())).toBeInTheDocument()
    expect(screen.getByText(enc.identificationNumber)).toBeInTheDocument()
    expect(screen.getByText(enc.phoneNumber)).toBeInTheDocument()
  })

  it("allows assigning room and attending doctor in AssignRoomDialog", async () => {
    const enc = initialEncounters.find((e) => e.status === "RECEIVED")!
    const onSuccess = vi.fn()

    renderWithClient(
      <AssignRoomDialog
        open={true}
        onOpenChange={vi.fn()}
        encounter={enc}
        onSuccess={onSuccess}
      />
    )

    expect(screen.getByText("Phân phòng / Bác sĩ")).toBeInTheDocument()

    // Wait for rooms to load
    await waitFor(() => {
      expect(screen.getByText("Phòng 101")).toBeInTheDocument()
    })

    const confirmBtn = screen.getByRole("button", { name: "Xác nhận phân phòng" })
    await userEvent.click(confirmBtn)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it("opens TodayAppointmentsDialog when clicking Lịch hẹn hôm nay button in header", async () => {
    renderWithClient(<ReceptionPage />)

    const appointmentsBtn = screen.getByRole("button", {
      name: /Lịch hẹn hôm nay/i,
    })
    expect(appointmentsBtn).toBeInTheDocument()

    await userEvent.click(appointmentsBtn)

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Lịch hẹn hôm nay/i })
      ).toBeInTheDocument()
    })
  })
})

