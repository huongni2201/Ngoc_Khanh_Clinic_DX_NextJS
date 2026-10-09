import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { initialEncounters, resetReceptionStore } from "@/widgets/reception/__tests__/fixtures/api-fixtures"
import { startTransferPayment } from "../api"
import { resetBillingStore } from "./fixtures/api-fixtures"
import { PaymentWorklistPage } from "../pages/payment-worklist-page"
import { renderWithClient } from "@/test-utils/render-with-client"

const navigation = vi.hoisted(() => ({ searchParams: new URLSearchParams(), replace: vi.fn() }))
vi.mock("next/navigation", () => ({
  usePathname: () => "/billing",
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => navigation.searchParams,
}))

const waitingEncounter = initialEncounters.find((encounter) => encounter.paymentStatus === "PENDING")!

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
