import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import { ReportTab } from "../components/report-tab/report-tab"
import { pickCalculationExample } from "../components/report-tab/calculation-example"

const download = vi.hoisted(() => ({ saveBlobAs: vi.fn() }))
vi.mock("../utils/download-blob", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../utils/download-blob")>()),
  saveBlobAs: download.saveBlobAs,
}))

function report(overrides: Record<string, unknown> = {}) {
  return {
    batchId: "batch-1",
    batchCode: "DK001",
    batchName: "Khám định kỳ",
    batchStatus: "READY",
    provisional: true,
    registeredCount: 120,
    attendedCount: 105,
    reconciledCount: 100,
    items: [
      { batchServiceId: "s1", serviceCode: "KNTQ", serviceName: "Khám nội tổng quát", displayOrder: 1, unitPrice: 100000, examinedCount: 0, amount: 0 },
      { batchServiceId: "s2", serviceCode: "XNM", serviceName: "Xét nghiệm máu", displayOrder: 2, unitPrice: 90000, examinedCount: 50, amount: 4500000 },
      { batchServiceId: "s2", serviceCode: "XNM", serviceName: "Xét nghiệm máu", displayOrder: 2, unitPrice: 80000, examinedCount: 10, amount: 800000 },
    ],
    totalAmount: 5300000,
    generatedAt: "2026-10-07T03:00:00Z",
    ...overrides,
  }
}

const envelope = (data: unknown) => ({ result: "OK" as const, code: 200, message: "ok", data })

function renderTab(props: Partial<React.ComponentProps<typeof ReportTab>> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ReportTab organizationId="org-1" batchId="batch-1" {...props} />
    </QueryClientProvider>
  )
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.restoreAllMocks())

describe("ReportTab", () => {
  it("shows the real report with one line per service and price, the total and the provisional mark", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(envelope(report()))
    renderTab()

    expect(await screen.findByText("Tạm tính")).toBeInTheDocument()
    expect(get).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/reports/payment-summary",
      { signal: expect.any(AbortSignal) }
    )
    const table = within(screen.getByRole("table"))
    expect(table.getAllByText("Xét nghiệm máu")).toHaveLength(2)
    expect(table.getByText("4.500.000 đ")).toBeInTheDocument()
    expect(table.getByText("800.000 đ")).toBeInTheDocument()
    expect(table.getByText("5.300.000 đ")).toBeInTheDocument()
    expect(screen.getByText(/Đăng ký/).textContent).toMatch(/120.*105.*100/)
    expect(screen.getByRole("status")).toHaveTextContent("Số liệu tạm tính")
  })

  it("builds the calculation example from a real line, never from a fixed number", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(envelope(report()))
    renderTab()

    expect(await screen.findByText("Xét nghiệm máu: 90.000 đ x 50 = 4.500.000 đ")).toBeInTheDocument()
    expect(screen.queryByText(/Khám nội tổng quát: 100\.000 x 50/)).not.toBeInTheDocument()
  })

  it("picks the first line somebody was examined for, otherwise the first line", () => {
    const [first, second] = report().items.map((item) => ({ ...item, serviceCode: undefined }))
    expect(pickCalculationExample([first, second])?.batchServiceId).toBe("s2")
    expect(pickCalculationExample([first])?.batchServiceId).toBe("s1")
    expect(pickCalculationExample([])).toBeUndefined()
  })

  it("does not call a finalized report provisional", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(
      envelope(report({ provisional: false, batchStatus: "FINALIZED" }))
    )
    renderTab()

    await screen.findByRole("table")
    expect(screen.queryByText("Tạm tính")).not.toBeInTheDocument()
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("exports the Word file and offers it as a file", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(envelope(report()))
    const blob = new Blob(["docx"])
    const getBlob = vi
      .spyOn(apiClient, "getBlob")
      .mockResolvedValue({ blob, filename: "bao-cao-thanh-toan-DK001.docx" })
    const user = userEvent.setup()
    renderTab()
    await screen.findByRole("table")

    await user.click(screen.getByRole("button", { name: "Xuất Word" }))

    await waitFor(() =>
      expect(download.saveBlobAs).toHaveBeenCalledWith(blob, "bao-cao-thanh-toan-DK001.docx")
    )
    expect(getBlob).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/reports/payment-summary/docx",
      { signal: undefined }
    )
  })

  it("shows the Excel export of the details only for an account that may read them, and no vertical summary", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(envelope(report()))
    const { unmount } = renderTab()
    await screen.findByRole("table")
    expect(screen.queryByRole("button", { name: "Xuất Excel chi tiết" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /tổng hợp \(dọc\)/ })).not.toBeInTheDocument()
    unmount()

    renderTab({ canExportDetails: true })
    expect(await screen.findByRole("button", { name: "Xuất Excel chi tiết" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /tổng hợp \(dọc\)/ })).not.toBeInTheDocument()
  })

  it("offers a retry when the report cannot be loaded and keeps the exports disabled", async () => {
    let fail = true
    vi.spyOn(apiClient, "get").mockImplementation(async () => {
      if (fail) throw new ApiClientError("Máy chủ gặp lỗi. Vui lòng thử lại sau.", 500)
      return envelope(report())
    })
    const user = userEvent.setup()
    renderTab()

    expect(await screen.findByText("Không thể tải báo cáo.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Xuất Word" })).toBeDisabled()
    fail = false
    await user.click(screen.getByRole("button", { name: "Thử lại" }))
    expect(await screen.findByRole("table")).toBeInTheDocument()
  })

  it("explains an empty report", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(envelope(report({ items: [], totalAmount: 0 })))
    renderTab()

    expect(await screen.findByText("Chưa có dữ liệu khám để tổng hợp.")).toBeInTheDocument()
  })
})
