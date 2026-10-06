import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as batchApi from "@/modules/health-examinations/api"
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
  vi.unstubAllGlobals()
})

describe("Health examination batch report tab", () => {
  it("shows 'Chưa hỗ trợ' once the report tab is chosen and never asks for a report", async () => {
    vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockResolvedValue(batch)
    const report = vi.spyOn(batchApi, "fetchHealthExaminationBatchReport")
    const exportData = vi.spyOn(batchApi, "fetchExaminationSummaryExportData")
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

    expect(await screen.findByText("Chưa hỗ trợ")).toBeInTheDocument()
    expect(report).not.toHaveBeenCalled()
    expect(exportData).not.toHaveBeenCalled()
  })
})
