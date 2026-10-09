import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { PatientSearchDialog, CreatePatientDialog, EditPatientDialog, PatientTable, type Patient } from "@/modules/patient"
import { PatientsPage } from "@/widgets/patient-workspace"
import { resetPatientsStore } from "@/modules/patient/__tests__/fixtures/api-fixtures"
import { renderWithClient } from "@/test-utils/render-with-client"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/patients",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: "pat-mock-01" }),
}))

describe("Patients Module & Workflows", () => {
  beforeEach(() => {
    resetPatientsStore()
    vi.clearAllMocks()
  })

  it("renders PatientSearchDialog and allows selecting a patient", async () => {
    const onSelect = vi.fn()
    const onOpenChange = vi.fn()

    renderWithClient(
      <PatientSearchDialog
        open={true}
        onOpenChange={onOpenChange}
        onSelectPatient={onSelect}
      />
    )

    expect(screen.getByText("Tìm bệnh nhân")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument()
    })

    const selectButtons = screen.getAllByRole("button", { name: /Chọn/i })
    expect(selectButtons.length).toBeGreaterThan(0)
    await userEvent.click(selectButtons[0])

    expect(onSelect).toHaveBeenCalled()
  })

  it("validates required fields in CreatePatientDialog", async () => {
    renderWithClient(
      <CreatePatientDialog open={true} onOpenChange={vi.fn()} />
    )

    expect(screen.getByText("Tạo bệnh nhân mới")).toBeInTheDocument()

    const submitBtn = screen.getByRole("button", { name: "Tạo bệnh nhân" })
    await userEvent.click(submitBtn)

    await waitFor(() => {
      expect(
        screen.getByText(/Họ và tên phải có ít nhất 2 ký tự/i)
      ).toBeInTheDocument()
    })
  })

  it("renders PatientTable without any 'Trạng thái' column and has 3 row action buttons", async () => {
    const mockPatients: Patient[] = [
      {
        id: "pat-1",
        patientCode: "BN000123",
        fullName: "Nguyễn Văn Hùng",
        dateOfBirth: "1985-03-12",
        birthYear: 1985,
        gender: "MALE",
        identificationNumber: "012345678901",
        phoneNumber: "0909 123 456",
        lastExamDate: "2024-09-16",
      },
    ]

    const onView = vi.fn()
    const onEdit = vi.fn()
    const onReceive = vi.fn()

    render(
      <PatientTable
        patients={mockPatients}
        selectedIds={[]}
        onSelectPatient={vi.fn()}
        onSelectAll={vi.fn()}
        onViewPatient={onView}
        onEditPatient={onEdit}
        onReceivePatient={onReceive}
        onCreatePatient={vi.fn()}
      />
    )

    // Verify all specified columns are present
    expect(screen.getByText("Mã BN")).toBeInTheDocument()
    expect(screen.getByText("Họ và tên")).toBeInTheDocument()
    expect(screen.getByText("Ngày sinh")).toBeInTheDocument()
    expect(screen.getByText("Giới tính")).toBeInTheDocument()
    expect(screen.getByText("Số điện thoại")).toBeInTheDocument()
    expect(screen.getByText("Số định danh")).toBeInTheDocument()
    expect(screen.getByText("Lần khám gần nhất")).toBeInTheDocument()
    expect(screen.getByText("Thao tác")).toBeInTheDocument()

    // STRICT DOMAIN RULE: NO "Trạng thái" column!
    expect(screen.queryByText("Trạng thái")).not.toBeInTheDocument()

    // Verify patient row content
    expect(screen.getByText("BN000123")).toBeInTheDocument()
    expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument()
    expect(screen.getByText("12/03/1985")).toBeInTheDocument()
    expect(screen.getByText("Nam")).toBeInTheDocument()
    expect(screen.getByText("0909 123 456")).toBeInTheDocument()
    expect(screen.getByText("012345678901")).toBeInTheDocument()
    expect(screen.getByText("16/09/2024")).toBeInTheDocument()

    // Verify 3 row action buttons with tooltips and accessible labels
    const viewBtn = screen.getByRole("button", {
      name: "Xem hồ sơ bệnh nhân Nguyễn Văn Hùng",
    })
    const editBtn = screen.getByRole("button", {
      name: "Chỉnh sửa thông tin bệnh nhân Nguyễn Văn Hùng",
    })
    const receiveBtn = screen.getByRole("button", {
      name: "Tiếp nhận bệnh nhân Nguyễn Văn Hùng",
    })

    expect(viewBtn).toBeInTheDocument()
    expect(editBtn).toBeInTheDocument()
    expect(receiveBtn).toBeInTheDocument()

    await userEvent.click(viewBtn)
    expect(onView).toHaveBeenCalledWith(mockPatients[0])

    await userEvent.click(editBtn)
    expect(onEdit).toHaveBeenCalledWith(mockPatients[0])

    await userEvent.click(receiveBtn)
    expect(onReceive).toHaveBeenCalledWith(mockPatients[0])
  })

  it("renders EditPatientDialog, pre-fills data, and updates successfully", async () => {
    const mockPatient: Patient = {
      id: "pat-mock-01",
      patientCode: "BN000123",
      fullName: "Nguyễn Văn Hùng",
      dateOfBirth: "1985-03-12",
      birthYear: 1985,
      gender: "MALE",
      identificationNumber: "012345678901",
      phoneNumber: "0909123456",
      email: "hung.nguyen@gmail.com",
      address: "Hà Nội",
    }

    const onOpenChange = vi.fn()
    const onSuccess = vi.fn()

    renderWithClient(
      <EditPatientDialog
        open={true}
        onOpenChange={onOpenChange}
        patient={mockPatient}
        onSuccess={onSuccess}
      />
    )

    expect(
      screen.getByText("Chỉnh sửa thông tin bệnh nhân")
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue("BN000123")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Nguyễn Văn Hùng")).toBeInTheDocument()

    const nameInput = screen.getByDisplayValue("Nguyễn Văn Hùng")
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, "Nguyễn Văn Hùng Updated")

    const saveBtn = screen.getByRole("button", { name: "Lưu thay đổi" })
    await userEvent.click(saveBtn)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it("renders PatientsPage with header, actions, and table data", async () => {
    renderWithClient(<PatientsPage />)

    // Verify page header
    expect(screen.getByText("Danh sách bệnh nhân")).toBeInTheDocument()
    expect(
      screen.getByText("Quản lý thông tin hồ sơ bệnh nhân của phòng khám.")
    ).toBeInTheDocument()

    // Verify header action buttons
    expect(
      screen.getByRole("button", { name: /Tiếp nhận bệnh nhân/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Tạo bệnh nhân mới/i })
    ).toBeInTheDocument()

    // Wait for table to load patients
    await waitFor(() => {
      expect(screen.getByText("BN000123")).toBeInTheDocument()
      expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument()
    })

    // Verify pagination summary
    expect(screen.getByText(/Hiển thị/i)).toBeInTheDocument()
    expect(screen.getAllByText(/bệnh nhân/i).length).toBeGreaterThanOrEqual(1)
  })

  it("renders PatientCountersStrip with 5 demographic cards and handles filter clicks", async () => {
    const user = userEvent.setup()
    renderWithClient(<PatientsPage />)

    await waitFor(() => {
      expect(screen.getByText("Tổng hồ sơ bệnh nhân")).toBeInTheDocument()
      expect(screen.getByText("Đến khám hôm nay")).toBeInTheDocument()
      expect(screen.getByText("Bệnh nhân Nam")).toBeInTheDocument()
      expect(screen.getByText("Bệnh nhân Nữ")).toBeInTheDocument()
      expect(screen.getByText("Bệnh nhân cao tuổi (>60)")).toBeInTheDocument()
    })

    // Click "Bệnh nhân Nam" counter button
    const maleCounterBtn = screen.getByRole("button", { name: /Bệnh nhân Nam/i })
    await user.click(maleCounterBtn)

    // Table should filter to show male patients
    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument()
    })
  })
})
