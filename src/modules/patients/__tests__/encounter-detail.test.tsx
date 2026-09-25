import * as React from "react"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, it, expect, vi } from "vitest"
import { EncounterHeaderCard } from "../components/encounter/encounter-header-card"
import { EncounterSummaryView } from "../components/encounter/encounter-summary-view"
import { EncounterDiagnosisView } from "../components/encounter/encounter-diagnosis-view"
import { EncounterPrescriptionView } from "../components/encounter/encounter-prescription-view"
import { PrintPrescriptionDialog } from "../components/encounter/print-prescription-dialog"
import { EncounterLabOrdersView } from "../components/encounter/encounter-lab-orders-view"
import { EncounterLabDetailCBCView } from "../components/encounter/encounter-lab-detail-cbc-view"
import { EncounterImagingDetailXRayView } from "../components/encounter/encounter-imaging-detail-xray-view"
import { EncounterDocumentsView } from "../components/encounter/encounter-documents-view"
import { mockEncounterDetail } from "../api/encounter-mock-data"

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe("Encounter Detail Screens", () => {
  it("EncounterHeaderCard renders patient and encounter metadata correctly", () => {
    renderWithClient(
      <EncounterHeaderCard data={mockEncounterDetail} />
    )
    expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument()
    expect(screen.getAllByText("BN000123")[0]).toBeInTheDocument()
    expect(screen.getAllByText("LK000456")[0]).toBeInTheDocument()
    expect(screen.getByText("Đã khám")).toBeInTheDocument()
    expect(screen.getByText("16/09/2024 10:30")).toBeInTheDocument()
    expect(screen.getByText("Khám tổng quát")).toBeInTheDocument()
    expect(screen.getByText("BS. Trần Minh Đức")).toBeInTheDocument()
    expect(screen.getByText("Phòng 101")).toBeInTheDocument()
  })

  it("Screen 01 — EncounterSummaryView renders vital signs and clinical findings", () => {
    renderWithClient(
      <EncounterSummaryView
        data={mockEncounterDetail}
        onNavigateTab={vi.fn()}
      />
    )
    expect(screen.getByText("Lý do khám & Triệu chứng ban đầu")).toBeInTheDocument()
    expect(screen.getByText("Ho nhiều, sốt nhẹ 2 ngày nay, đau rát họng, mệt mỏi")).toBeInTheDocument()
    expect(screen.getByText("78")).toBeInTheDocument() // Mạch
    expect(screen.getByText("120/80")).toBeInTheDocument() // Huyết áp
    expect(screen.getByText("37.8")).toBeInTheDocument() // Nhiệt độ
    expect(screen.getByText("98")).toBeInTheDocument() // SpO2
    expect(screen.getAllByText("Bình thường")[0]).toBeInTheDocument() // BMI class
    expect(screen.getByText(/Niêm mạc họng sung huyết đỏ nhẹ/)).toBeInTheDocument()
  })

  it("Screen 02 — EncounterDiagnosisView renders ICD-10 table and reasoning", () => {
    renderWithClient(
      <EncounterDiagnosisView data={mockEncounterDetail} />
    )
    expect(screen.getByText("Danh sách chẩn đoán bệnh")).toBeInTheDocument()
    expect(screen.getByText("J06.9")).toBeInTheDocument()
    expect(screen.getByText("Chẩn đoán chính")).toBeInTheDocument()
    expect(screen.getByText("R05")).toBeInTheDocument()
    expect(screen.getByText("J20.9")).toBeInTheDocument()
    expect(screen.getByText(/Khởi phát cấp tính ngày thứ 2/)).toBeInTheDocument()
    expect(screen.getByText("Nhận xét lâm sàng & Biện luận của bác sĩ")).toBeInTheDocument()
  })

  it("Screen 03 — EncounterPrescriptionView renders 3 medications matching reference", () => {
    renderWithClient(
      <EncounterPrescriptionView data={mockEncounterDetail} />
    )
    expect(screen.getByText("Đơn thuốc (3 thuốc)")).toBeInTheDocument()
    expect(screen.getByText("Paracetamol")).toBeInTheDocument()
    expect(screen.getByText("Amoxicillin")).toBeInTheDocument()
    expect(screen.getByText("Cetirizine")).toBeInTheDocument()
    expect(screen.getByText("15 viên")).toBeInTheDocument()
    expect(screen.getByText("21 viên")).toBeInTheDocument()
    expect(screen.getByText("10 viên")).toBeInTheDocument()
    expect(screen.getByText(/Uống nhiều nước, nghỉ ngơi/)).toBeInTheDocument()
  })

  it("Screen 03b — PrintPrescriptionDialog displays official prescription sheet", () => {
    const handleClose = vi.fn()
    renderWithClient(
      <PrintPrescriptionDialog
        open={true}
        onOpenChange={handleClose}
        data={mockEncounterDetail}
      />
    )
    expect(screen.getByText("Xem trước & In đơn thuốc")).toBeInTheDocument()
    expect(screen.getByText("PHÒNG KHÁM ĐA KHOA NGỌC KHÁNH")).toBeInTheDocument()
    expect(screen.getByText("ĐƠN THUỐC")).toBeInTheDocument()
    expect(screen.getByText("In ngay")).toBeInTheDocument()
  })

  it("Screen 04 — EncounterLabOrdersView renders 7 orders matching reference", () => {
    renderWithClient(
      <EncounterLabOrdersView
        data={mockEncounterDetail}
        onViewDetail={vi.fn()}
      />
    )
    expect(screen.getByText("Danh sách kết quả cận lâm sàng")).toBeInTheDocument()
    expect(screen.getByText("Công thức máu (CBC)")).toBeInTheDocument()
    expect(screen.getByText("Sinh hóa máu")).toBeInTheDocument()
    expect(screen.getByText("Siêu âm ổ bụng")).toBeInTheDocument()
    expect(screen.getByText("X-quang ngực thẳng")).toBeInTheDocument()
    expect(screen.getByText("Điện tâm đồ (ECG)")).toBeInTheDocument()
    expect(screen.getByText("Nội soi dạ dày")).toBeInTheDocument()
    expect(screen.getByText("Tổng phân tích nước tiểu")).toBeInTheDocument()
    expect(screen.getAllByText("Hoàn tất").length).toBe(7)
  })

  it("Screen 05 — EncounterLabDetailCBCView renders 10 lab indicators with reference ranges", () => {
    renderWithClient(
      <EncounterLabDetailCBCView
        data={mockEncounterDetail}
        onBack={vi.fn()}
      />
    )
    expect(screen.getByText("Công thức máu toàn phần (CBC)")).toBeInTheDocument()
    expect(screen.getByText("WBC")).toBeInTheDocument()
    expect(screen.getByText("7.4")).toBeInTheDocument()
    expect(screen.getByText("RBC")).toBeInTheDocument()
    expect(screen.getByText("4.85")).toBeInTheDocument()
    expect(screen.getByText("PLT")).toBeInTheDocument()
    expect(screen.getByText("245")).toBeInTheDocument()
    expect(screen.getAllByText("BS. CKI. Vũ Đình Trọng")[0]).toBeInTheDocument()
  })

  it("Screen 06 — EncounterImagingDetailXRayView renders X-Ray findings and viewer", () => {
    renderWithClient(
      <EncounterImagingDetailXRayView
        data={mockEncounterDetail}
        onBack={vi.fn()}
      />
    )
    expect(screen.getByText("Chụp X-quang ngực thẳng (PA)")).toBeInTheDocument()
    expect(screen.getAllByText("BS. CKI. Hoàng Văn Hùng")[0]).toBeInTheDocument()
    expect(screen.getByText(/Shimadzu Radspeed Pro/)).toBeInTheDocument()
    expect(screen.getByText("Mô tả hình ảnh X-quang")).toBeInTheDocument()
    expect(screen.getByText(/Hiện tại chưa phát hiện bất thường trên phim X-quang ngực thẳng/)).toBeInTheDocument()
  })

  it("Screen 07 — EncounterDocumentsView renders 5 medical documents", () => {
    renderWithClient(
      <EncounterDocumentsView data={mockEncounterDetail} />
    )
    expect(screen.getByText("Tài liệu y tế đính kèm lượt khám LK000456")).toBeInTheDocument()
    expect(screen.getByText("Phiếu khám tổng quát - LK000456.pdf")).toBeInTheDocument()
    expect(screen.getByText("Đơn thuốc - DT000456.pdf")).toBeInTheDocument()
    expect(screen.getByText("Phiếu kết quả CBC - XN00456.pdf")).toBeInTheDocument()
    expect(screen.getByText("Phim X-quang ngực thẳng - HA00456.dcm")).toBeInTheDocument()
    expect(screen.getByText("Kết quả siêu âm ổ bụng - SA00456.pdf")).toBeInTheDocument()
  })
})
