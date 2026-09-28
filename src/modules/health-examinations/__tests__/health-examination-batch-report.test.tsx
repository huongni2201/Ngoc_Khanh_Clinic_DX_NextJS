import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HealthExaminationBatchDetailPage } from "../pages/health-examination-batch-detail-page"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/organizations/org-1/batches/batch-1",
  useSearchParams: () => new URLSearchParams(),
}))

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe("Health examination batch report tab", () => {
  it("stays empty until a report API exists", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("API unavailable")))
    const user = userEvent.setup()

    renderWithClient(
      <HealthExaminationBatchDetailPage
        organizationId="org-1"
        batchId="batch-1"
      />
    )

    await user.click(screen.getByRole("button", { name: "Báo cáo" }))

    expect(screen.getByText("Chưa có API cho nội dung này.")).toBeInTheDocument()
    vi.unstubAllGlobals()
  })
})
