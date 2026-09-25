import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppointmentsPage } from "../pages/appointments-page"
import { CreateAppointmentDialog } from "../components/create-appointment-dialog"
import { EditAppointmentDialog } from "../components/edit-appointment-dialog"
import { resetAppointmentsStore, createAppointment, fetchAppointments } from "../api"
import { Patient } from "@/modules/patients"

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

  it("creates an appointment with booking channel automatically recorded as front desk", async () => {
    const created = await createAppointment({
      patientId: "pat-001",
      examinationType: "Khám tổng quát",
      physicianId: "doc-04",
      roomId: "room-104",
      date: "2026-09-25",
      time: "08:30",
      notes: "Hẹn khám sức khỏe",
      bookingChannel: "FRONT_DESK",
    })

    expect(created.bookingChannel).toBe("FRONT_DESK")
    expect(created.appointmentCode).toMatch(/^LH-/)
    expect(created.patientName).toBe("Nguyễn Văn Minh")
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

  it("renders CreateAppointmentDialog and handles patient selector", async () => {
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
    expect(screen.getByText("1. Chọn đoàn & Nhân viên")).toBeInTheDocument()
    expect(screen.getByText("Đơn vị")).toBeInTheDocument()
    expect(screen.getByText("Đợt khám sức khỏe")).toBeInTheDocument()
    expect(screen.getByText("Nhân viên trong đợt khám")).toBeInTheDocument()
  })

  it("supports creating organization appointment with organization and employee metadata", async () => {
    const created = await createAppointment({
      patientId: "pat-103",
      examinationType: "Khám sức khỏe đơn vị",
      physicianId: "doc-04",
      roomId: "room-104",
      date: "2026-09-26",
      time: "09:30",
      careProgram: "ORGANIZATION_HEALTH_EXAMINATION",
      organizationId: "ent-1",
      organizationName: "Công ty Cổ phần FPT",
      healthExaminationBatchId: "batch-1",
      healthExaminationBatchName: "Khám sức khỏe định kỳ 2026",
      participantCode: "FPT001",
      bookingChannel: "IMPORT",
    })

    expect(created.careProgram).toBe("ORGANIZATION_HEALTH_EXAMINATION")
    expect(created.organizationName).toBe("Công ty Cổ phần FPT")
    expect(created.participantCode).toBe("FPT001")
    expect(created.bookingChannel).toBe("IMPORT")
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

  it("renders header actions with Tạo lịch hẹn primary CTA", async () => {
    renderWithClient(<AppointmentsPage />)

    expect(
      screen.getByRole("button", { name: /Tạo lịch hẹn/i })
    ).toBeInTheDocument()
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


