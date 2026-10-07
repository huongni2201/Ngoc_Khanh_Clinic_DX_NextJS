import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as batchApi from "@/modules/health-examinations/api"
import { apiClient } from "@/shared/api/api-client"
import { HealthExaminationBatchDetailPage } from "../pages/health-examination-batch-detail-page"
import type { HealthExaminationBatch } from "../types"

const mockNavigation = vi.hoisted(() => ({ push: vi.fn(), search: "" }))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockNavigation.push, replace: vi.fn() }),
  usePathname: () => "/organizations/org-1/health-examination-batches/batch-1",
  useSearchParams: () => new URLSearchParams(mockNavigation.search),
}))

const batch: HealthExaminationBatch = {
  id: "batch-1", organizationId: "org-1", code: "DK001", name: "Khám định kỳ", status: "DRAFT",
  startDate: "2026-10-01", endDate: "2026-10-01", createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-01T00:00:00Z", rowVersion: 0, examinationDates: ["2026-10-01"],
  examinationSiteType: "CLINIC", examinationSiteName: "Phòng khám",
  examinationSiteAddress: "Hà Nội", createdBy: "staff-1", services: [],
}

afterEach(() => {
  mockNavigation.search = ""
  vi.restoreAllMocks()
})

describe("Health examination batch report tab", () => {
  it("reads the payment summary once the report tab is chosen and never uses the organization-level report", async () => {
    vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockResolvedValue(batch)
    const legacyReport = vi.spyOn(batchApi, "fetchHealthExaminationBatchReport")
    const legacyExport = vi.spyOn(batchApi, "fetchExaminationSummaryExportData")
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({
      result: "OK",
      code: 200,
      message: "ok",
      data: {
        batchId: "batch-1", batchCode: "DK001", batchName: "Khám định kỳ", batchStatus: "FINALIZED",
        provisional: false, registeredCount: 1, attendedCount: 1, reconciledCount: 1, items: [],
        totalAmount: 0, generatedAt: "2026-10-07T03:00:00Z",
      },
    })
    const user = userEvent.setup()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const page = () => (
      <QueryClientProvider client={queryClient}>
        <HealthExaminationBatchDetailPage organizationId="org-1" batchId="batch-1" />
      </QueryClientProvider>
    )
    const rendered = render(page())

    await user.click(await screen.findByRole("button", { name: "Báo cáo" }))
    await waitFor(() => expect(mockNavigation.push).toHaveBeenCalled())
    mockNavigation.search = new URL(
      mockNavigation.push.mock.calls.at(-1)?.[0] as string,
      "http://localhost"
    ).search
    rendered.rerender(page())

    expect(await screen.findByText("Chưa có dữ liệu khám để tổng hợp.")).toBeInTheDocument()
    expect(get).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/reports/payment-summary",
      expect.anything()
    )
    expect(legacyReport).not.toHaveBeenCalled()
    expect(legacyExport).not.toHaveBeenCalled()
  })
})
