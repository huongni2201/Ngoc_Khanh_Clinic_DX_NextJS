import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import { ExaminationDetailTab } from "../components/examination-detail-tab/examination-detail-tab"
import { Toaster } from "@/shared/ui/toaster"
import { ExaminationMatrixTable } from "../components/examination-detail-tab/examination-matrix-table"
import type { ExaminationDetailRow, HealthExaminationBatchService } from "../types"

const download = vi.hoisted(() => ({ saveBlobAs: vi.fn() }))
vi.mock("../utils/download-blob", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../utils/download-blob")>()),
  saveBlobAs: download.saveBlobAs,
}))

const services: HealthExaminationBatchService[] = [
  { id: "s1", serviceId: "c1", code: "KNTQ", name: "Khám nội", referencePrice: 1, negotiatedPrice: 1, displayOrder: 1 },
  { id: "s2", serviceId: "c2", code: null, name: null, referencePrice: 1, negotiatedPrice: 1, displayOrder: 2 },
]

function backendRow(index: number, overrides: Record<string, unknown> = {}) {
  return {
    id: `p-${index}`,
    participantCode: `NV${String(index).padStart(3, "0")}`,
    fullName: `Người khám ${index}`,
    identificationNumberMasked: "********8901",
    departmentName: "Phòng Kế toán",
    positionName: "Kế toán viên",
    examinationDate: "2026-10-20",
    attendanceStatus: "UNCONFIRMED",
    actualExaminationDate: null,
    reconciliationStatus: "PENDING",
    performedBatchServiceIds: [],
    rowVersion: 0,
    ...overrides,
  }
}

const summaryData = {
  registered: 4,
  unconfirmed: 1,
  attended: 3,
  absent: 0,
  reconciled: 2,
  pendingReconciliation: 1,
}

function envelope(data: unknown) {
  return { result: "OK" as const, code: 200, message: "ok", data }
}

function page(items: unknown[]) {
  return envelope({ items, page: 1, size: 10, totalElements: items.length, totalPages: items.length ? 1 : 0 })
}

function mockGet(items: unknown[]) {
  return vi.spyOn(apiClient, "get").mockImplementation(async (path: string) =>
    path.includes("/summary") ? envelope(summaryData) : page(items)
  )
}

function renderTab(props: Partial<React.ComponentProps<typeof ExaminationDetailTab>> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <ExaminationDetailTab
        organizationId="org-1"
        batch={{ id: "batch-1", status: "READY", services }}
        canImport
        {...props}
      />
      <Toaster />
    </QueryClientProvider>
  )
  return { ...view, queryClient }
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.restoreAllMocks())

describe("ExaminationMatrixTable", () => {
  const row: ExaminationDetailRow = {
    id: "p-1",
    participantCode: "NV001",
    fullName: "Nguyễn Văn A",
    identificationNumberMasked: "********8901",
    departmentName: "Kỹ thuật",
    positionName: "Kỹ sư",
    examinationDate: "2026-10-20",
    attendanceStatus: "ATTENDED",
    reconciliationStatus: "RECONCILED",
    performedBatchServiceIds: ["s1"],
    rowVersion: 1,
  }

  it("renders one column per batch service, an X only where it was performed, and the status label", () => {
    render(
      <ExaminationMatrixTable
        services={services}
        items={[row]}
        totalItems={1}
        currentPage={1}
        pageSize={10}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.getByText("Khám nội")).toBeInTheDocument()
    expect(screen.getByText("Dịch vụ không còn trong danh mục")).toBeInTheDocument()
    expect(screen.getAllByText("X")).toHaveLength(1)
    expect(screen.getByText("Đã đối soát")).toBeInTheDocument()
    expect(screen.queryByText("Ghi chú")).not.toBeInTheDocument()
    expect(screen.queryByText("********8901")).not.toBeInTheDocument()
  })

  it("shows the update button and the row click only when editing is wired", async () => {
    const onEditRow = vi.fn()
    const user = userEvent.setup()
    const props = {
      services,
      items: [row],
      totalItems: 1,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      onPageChange: vi.fn(),
    }
    const { rerender } = render(<ExaminationMatrixTable {...props} />)
    expect(screen.queryByRole("button", { name: /Cập nhật chi tiết khám của/ })).not.toBeInTheDocument()

    rerender(<ExaminationMatrixTable {...props} onEditRow={onEditRow} />)
    await user.click(screen.getByRole("button", { name: "Cập nhật chi tiết khám của Nguyễn Văn A" }))
    expect(onEditRow).toHaveBeenCalledTimes(1)
    expect(onEditRow).toHaveBeenCalledWith(row)

    await user.click(screen.getByText("Kỹ thuật"))
    expect(onEditRow).toHaveBeenCalledTimes(2)
  })

  it("tells an empty roster apart from an empty filter result", () => {
    const props = {
      services,
      items: [],
      totalItems: 0,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      onPageChange: vi.fn(),
    }
    const { rerender } = render(<ExaminationMatrixTable {...props} />)
    expect(screen.getByText("Đợt khám chưa có người khám trong danh sách.")).toBeInTheDocument()
    rerender(<ExaminationMatrixTable {...props} filtered />)
    expect(screen.getByText(/Không tìm thấy người khám phù hợp/)).toBeInTheDocument()
  })
})

describe("ExaminationDetailTab", () => {
  it("loads the matrix and the counters from the batch endpoints", async () => {
    const get = mockGet([
      backendRow(1, { attendanceStatus: "ATTENDED", performedBatchServiceIds: ["s1"] }),
      backendRow(2, { attendanceStatus: "ATTENDED", reconciliationStatus: "RECONCILED", performedBatchServiceIds: ["s1", "s2"] }),
    ])
    renderTab()

    expect(await screen.findByText("Người khám 1")).toBeInTheDocument()
    expect(screen.getAllByText("X")).toHaveLength(3)
    expect(screen.getByText("Đã đến – chờ đối soát")).toBeInTheDocument()
    const counters = within(await screen.findByLabelText("Số liệu chi tiết khám"))
    await waitFor(() => expect(counters.getByText("Đăng ký").nextElementSibling).toHaveTextContent("4"))
    expect(counters.getByText("Chờ đối soát").nextElementSibling).toHaveTextContent("1")
    expect(counters.getByText("Đã đối soát").nextElementSibling).toHaveTextContent("2")
    const paths = get.mock.calls.map(([path]) => path as string)
    expect(paths.some((path) => path.includes("/organizations/org-1/health-examination-batches/batch-1/examination-details?"))).toBe(true)
    expect(paths.some((path) => path.endsWith("/examination-details/summary"))).toBe(true)
  })

  it("filters by the screen status through backend parameters", async () => {
    const get = mockGet([backendRow(1)])
    const user = userEvent.setup()
    renderTab()
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("combobox", { name: "Lọc theo trạng thái khám" }))
    await user.click(await screen.findByRole("option", { name: "Đã đến – chờ đối soát" }))

    await waitFor(() =>
      expect(
        get.mock.calls.some(([path]) =>
          String(path).includes("attendanceStatus=ATTENDED&reconciliationStatus=PENDING")
        )
      ).toBe(true)
    )
  })

  it("exports the workbook and offers it as a file", async () => {
    mockGet([backendRow(1)])
    const blob = new Blob(["xlsx"])
    const getBlob = vi
      .spyOn(apiClient, "getBlob")
      .mockResolvedValue({ blob, filename: "chi-tiet-kham-DK001.xlsx" })
    const user = userEvent.setup()
    renderTab()
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("button", { name: "Xuất Excel" }))

    await waitFor(() => expect(download.saveBlobAs).toHaveBeenCalledWith(blob, "chi-tiet-kham-DK001.xlsx"))
    expect(getBlob).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/examination-details/export",
      { signal: undefined }
    )
  })

  it("tells the user with a toast that the export finished", async () => {
    mockGet([backendRow(1)])
    vi.spyOn(apiClient, "getBlob").mockResolvedValue({
      blob: new Blob(["xlsx"]),
      filename: "chi-tiet-kham-DK001.xlsx",
    })
    const user = userEvent.setup()
    renderTab()
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("button", { name: "Xuất Excel" }))

    expect(await screen.findByText("Đã xuất file chi tiết khám.")).toBeInTheDocument()
  })

  it("tells the user with a toast when the export fails", async () => {
    mockGet([backendRow(1)])
    vi.spyOn(apiClient, "getBlob").mockRejectedValue(new Error("Bạn không có quyền xuất file."))
    const user = userEvent.setup()
    renderTab()
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("button", { name: "Xuất Excel" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Bạn không có quyền xuất file.")
  })

  it("shows the import only with the reconcile permission and while the batch accepts changes", async () => {
    mockGet([backendRow(1)])
    const { rerender, queryClient } = renderTab({ canImport: false })
    await screen.findByText("Người khám 1")
    expect(screen.queryByRole("button", { name: "Nhập Excel" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Xuất Excel" })).toBeInTheDocument()

    rerender(
      <QueryClientProvider client={queryClient}>
        <ExaminationDetailTab organizationId="org-1" batch={{ id: "batch-1", status: "DRAFT", services }} canImport />
      </QueryClientProvider>
    )
    expect(await screen.findByRole("button", { name: "Nhập Excel" })).toBeInTheDocument()

    rerender(
      <QueryClientProvider client={queryClient}>
        <ExaminationDetailTab organizationId="org-1" batch={{ id: "batch-1", status: "FINALIZED", services }} canImport />
      </QueryClientProvider>
    )
    await waitFor(() => expect(screen.queryByRole("button", { name: "Nhập Excel" })).not.toBeInTheDocument())
  })

  it("downloads the pre-filled template from the toolbar with the template permission", async () => {
    mockGet([backendRow(1)])
    const blob = new Blob(["xlsx"])
    const getBlob = vi
      .spyOn(apiClient, "getBlob")
      .mockResolvedValue({ blob, filename: "mau-nhap-chi-tiet-kham-DK001.xlsx" })
    const user = userEvent.setup()
    renderTab({ canDownloadTemplate: true })
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("button", { name: "Tải file mẫu" }))

    await waitFor(() =>
      expect(download.saveBlobAs).toHaveBeenCalledWith(blob, "mau-nhap-chi-tiet-kham-DK001.xlsx")
    )
    expect(getBlob).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/examination-details/import-template",
      { signal: undefined }
    )
  })

  it("hides the template without its permission", async () => {
    mockGet([backendRow(1)])
    renderTab({ canDownloadTemplate: false })
    await screen.findByText("Người khám 1")
    expect(screen.queryByRole("button", { name: "Tải file mẫu" })).not.toBeInTheDocument()
  })

  it("falls back to the export inside the import dialog when the user cannot download the template", async () => {
    mockGet([backendRow(1)])
    const getBlob = vi
      .spyOn(apiClient, "getBlob")
      .mockResolvedValue({ blob: new Blob(["xlsx"]), filename: "chi-tiet-kham-DK001.xlsx" })
    const user = userEvent.setup()
    renderTab({ canDownloadTemplate: false })
    await screen.findByText("Người khám 1")

    await user.click(screen.getByRole("button", { name: "Nhập Excel" }))
    await user.click(await screen.findByRole("button", { name: "Tải file mẫu" }))

    await waitFor(() => expect(getBlob).toHaveBeenCalledTimes(1))
    expect(String(getBlob.mock.calls[0][0])).toMatch(/\/examination-details\/export$/)
  })

  it("offers the manual entry only with the record permission and while the batch accepts changes", async () => {
    mockGet([backendRow(1)])
    const user = userEvent.setup()
    const { rerender, queryClient } = renderTab()
    await screen.findByText("Người khám 1")
    expect(screen.queryByRole("button", { name: /Cập nhật chi tiết khám của/ })).not.toBeInTheDocument()

    rerender(
      <QueryClientProvider client={queryClient}>
        <ExaminationDetailTab organizationId="org-1" batch={{ id: "batch-1", status: "READY", services }} canRecord />
      </QueryClientProvider>
    )
    await user.click(await screen.findByRole("button", { name: "Cập nhật chi tiết khám của Người khám 1" }))
    expect(await screen.findByRole("radio", { name: "Đã đến" })).toBeInTheDocument()

    rerender(
      <QueryClientProvider client={queryClient}>
        <ExaminationDetailTab organizationId="org-1" batch={{ id: "batch-1", status: "FINALIZED", services }} canRecord />
      </QueryClientProvider>
    )
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Cập nhật chi tiết khám của/ })).not.toBeInTheDocument()
    )
  })

  it("opens the Sheet on a row click, saves and shows the stored row in the matrix", async () => {
    mockGet([backendRow(1), backendRow(2)])
    vi.spyOn(apiClient, "put").mockResolvedValue(
      envelope(backendRow(1, { attendanceStatus: "ATTENDED", actualExaminationDate: "2026-10-20", performedBatchServiceIds: ["s1"], rowVersion: 1 }))
    )
    const user = userEvent.setup()
    renderTab({ canRecord: true, batch: { id: "batch-1", status: "READY", services, startDate: "2026-10-01" } })
    await user.click(await screen.findByText("Người khám 1"))

    await user.click(await screen.findByRole("checkbox", { name: "Khám nội" }))
    await user.click(screen.getByRole("button", { name: "Lưu & người tiếp theo" }))

    await waitFor(() => expect(screen.getAllByText("Người khám 2").length).toBeGreaterThan(1))
    expect(screen.getAllByText("X")).toHaveLength(1)
  })

  it("requests nothing and explains the missing permission", () => {
    const get = vi.spyOn(apiClient, "get")
    renderTab({ canRead: false })

    expect(screen.getByText("Không có quyền xem")).toBeInTheDocument()
    expect(get).not.toHaveBeenCalled()
  })

  it("offers a retry when the list cannot be loaded", async () => {
    let fail = true
    vi.spyOn(apiClient, "get").mockImplementation(async (path: string) => {
      if (path.includes("/summary")) return envelope(summaryData)
      if (fail) throw new ApiClientError("Máy chủ gặp lỗi. Vui lòng thử lại sau.", 500)
      return page([backendRow(1)])
    })
    const user = userEvent.setup()
    renderTab()

    expect(await screen.findByText("Không thể tải chi tiết khám.")).toBeInTheDocument()
    fail = false
    await user.click(screen.getByRole("button", { name: "Thử lại" }))
    expect(await screen.findByText("Người khám 1")).toBeInTheDocument()
  })
})
