import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HealthExaminationBatchDetailPage } from "../pages/health-examination-batch-detail-page"

const mockNavigation = vi.hoisted(() => ({ push: vi.fn(), search: "" }))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockNavigation.push }),
  usePathname: () => "/organizations/org-1/batches/batch-1",
  useSearchParams: () => new URLSearchParams(mockNavigation.search),
}))

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(ui, {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe("Health examination batch report tab", () => {
  it("stays empty until a report API exists", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("API unavailable")))
    const user = userEvent.setup()

    const page = (
      <HealthExaminationBatchDetailPage
        organizationId="org-1"
        batchId="batch-1"
      />
    )
    const rendered = renderWithClient(page)

    await user.click(screen.getByRole("button", { name: "Báo cáo" }))
    await waitFor(() => expect(mockNavigation.push).toHaveBeenCalled())
    mockNavigation.search = new URL(
      mockNavigation.push.mock.calls.at(-1)?.[0] as string,
      "http://localhost"
    ).search
    rendered.rerender(React.cloneElement(page))

    expect(screen.getByText("Chưa có API cho nội dung này.")).toBeInTheDocument()
    vi.unstubAllGlobals()
  })
})
