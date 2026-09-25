import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { initialEncounters, resetReceptionStore } from "@/modules/reception/api"
import { resetBillingStore, startTransferPayment } from "../api"
import { PaymentWorklistPage } from "../pages/payment-worklist-page"

const navigation = vi.hoisted(() => ({ searchParams: new URLSearchParams(), replace: vi.fn() }))
vi.mock("next/navigation", () => ({
  usePathname: () => "/billing",
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => navigation.searchParams,
}))

const waitingEncounter = initialEncounters.find((encounter) => encounter.paymentStatus === "PENDING")!

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe("PaymentWorklistPage", () => {
  beforeEach(() => {
    resetReceptionStore()
    resetBillingStore()
    navigation.searchParams = new URLSearchParams()
    vi.clearAllMocks()
  })

  it("opens the same pending payment from the worklist", async () => {
    const user = userEvent.setup()
    await startTransferPayment({ encounter: waitingEncounter })
    renderWithClient(<PaymentWorklistPage />)

    expect(await screen.findByText(waitingEncounter.patientName)).toBeInTheDocument()
    expect(screen.getByText("Đang chờ chuyển khoản")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Xem thanh toán" }))
    expect(await screen.findByText("Đang chờ ngân hàng xác nhận")).toBeInTheDocument()
  })
})
