import { act, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  AppointmentsPage,
  CreateAppointmentDialog,
  EditAppointmentDialog,
} from "@/widgets/appointment-workspace"
import { fetchAppointments } from "@/modules/appointment/api"
import { resetAppointmentsStore } from "@/modules/appointment/__tests__/fixtures/api-fixtures"
import type { Patient } from "@/modules/patient"
import { renderWithClient } from "@/test-utils/render-with-client"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/appointments",
  useSearchParams: () => new URLSearchParams(),
}))

describe("Appointments Module (Lịch hẹn)", () => {
  beforeEach(() => {
    resetAppointmentsStore()
    vi.clearAllMocks()
  })

  it("renders page header, + Tạo lịch hẹn button, tabs, filters, and appointment list", async () => {
    renderWithClient(<AppointmentsPage />)

    // Heading and main action
    expect(screen.getByRole("heading", { name: "Lịch hẹn" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Tạo lịch hẹn/i })
    ).toBeInTheDocument()

    // Tabs
    expect(screen.getByRole("button", { name: "Tất cả" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Hôm nay" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sắp tới" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Đã khám" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Đã hủy" })).toBeInTheDocument()

    // Table data
    await waitFor(() => {
      expect(screen.getByText("Nguyễn Thị Hoa")).toBeInTheDocument()
      expect(screen.getByText("Phạm Quang Huy")).toBeInTheDocument()
      expect(screen.getByText("Lê Thị Mai")).toBeInTheDocument()
    })
  })

  it("renders EditAppointmentDialog with editable fields and low-competing cancel appointment button", async () => {
    const appts = await fetchAppointments()
    const sample = appts[0]

    renderWithClient(
      <EditAppointmentDialog
        open={true}
        onOpenChange={vi.fn()}
        appointment={sample}
      />
    )

    expect(screen.getByText("Chỉnh sửa lịch hẹn")).toBeInTheDocument()
    expect(screen.getByText(sample.patientName)).toBeInTheDocument()

    // Verify presence of Hủy lịch button
    expect(screen.getByRole("button", { name: /Hủy lịch/i })).toBeInTheDocument()

    // Verify presence of primary Lưu thay đổi button
    expect(
      screen.getByRole("button", { name: "Lưu thay đổi" })
    ).toBeInTheDocument()
  })

  it("renders CreateAppointmentDialog with the selected patient and care programs", async () => {
    const mockPatient: Patient = {
      id: "pat-001",
      patientCode: "BN001256",
      fullName: "Nguyễn Văn Minh",
      dateOfBirth: "1985-05-15",
      birthYear: 1985,
      gender: "MALE",
      identificationNumber: "001085002456",
      phoneNumber: "0912345678",
    }

    renderWithClient(
      <CreateAppointmentDialog
        open={true}
        onOpenChange={vi.fn()}
        initialPatient={mockPatient}
      />
    )
    // Let the dialog's catalog queries settle so their state updates stay inside act().
    await act(async () => {})

    expect(
      screen.getByRole("heading", { name: "Tạo lịch hẹn" })
    ).toBeInTheDocument()
    expect(screen.getByText("Nguyễn Văn Minh")).toBeInTheDocument()
    expect(screen.getByText("BN001256")).toBeInTheDocument()
    expect(screen.getByText("Khám cá nhân")).toBeInTheDocument()
    expect(screen.getByText("Khám đơn vị")).toBeInTheDocument()
  })

  it("renders CreateAppointmentDialog in Organization mode and displays corporate selectors", async () => {
    renderWithClient(
      <CreateAppointmentDialog
        open={true}
        onOpenChange={vi.fn()}
        initialCareProgram="ORGANIZATION_HEALTH_EXAMINATION"
      />
    )

    expect(screen.getByText("Khám đơn vị")).toBeInTheDocument()
    expect(screen.getByText("1. Chọn đơn vị, đợt khám & người khám")).toBeInTheDocument()
    expect(screen.getByText("Đơn vị")).toBeInTheDocument()
    expect(screen.getByText("Đợt khám sức khỏe")).toBeInTheDocument()
    expect(screen.getByText("Người khám trong đợt khám")).toBeInTheDocument()
  })

  it("renders operational counters strip matching Reception with 5 key metric cards", async () => {
    renderWithClient(<AppointmentsPage />)

    await waitFor(() => {
      expect(screen.getByText("Lịch hẹn hôm nay")).toBeInTheDocument()
      expect(screen.getByText("Đã xác nhận")).toBeInTheDocument()
      expect(screen.getByText("Đã đến phòng khám")).toBeInTheDocument()
      expect(screen.getByText("Đoàn đơn vị")).toBeInTheDocument()
      expect(screen.getByText("Đã khám / Tiếp nhận")).toBeInTheDocument()
    })
  })

  it("renders pagination and unified row action buttons matching Reception", async () => {
    renderWithClient(<AppointmentsPage />)

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Thị Hoa")).toBeInTheDocument()
    })

    // Pagination info
    const paginationEl = document.querySelector(
      '[data-slot="data-table-pagination"]'
    )
    expect(paginationEl).toBeInTheDocument()
    expect(paginationEl?.textContent).toContain("lịch hẹn")

    // Unified row icon actions
    const viewButtons = screen.getAllByRole("button", { name: /Xem chi tiết/i })
    expect(viewButtons.length).toBeGreaterThan(0)
  })
})


