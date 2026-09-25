import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { initialEncounters, resetReceptionStore } from "@/modules/reception/api"
import { fetchInvoiceByEncounter, resetBillingStore, startTransferPayment } from "../api"
import * as billingApi from "../api"
import { PaymentDialog } from "../components/payment-dialog"

const waitingEncounter = initialEncounters.find((encounter) => encounter.paymentStatus === "PENDING")!

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe("PaymentDialog", () => {
  beforeEach(() => {
    resetReceptionStore()
    resetBillingStore()
    vi.clearAllMocks()
  })

  it("closes a pending transfer without cancelling it", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    await startTransferPayment({ encounter: waitingEncounter })
    renderWithClient(<PaymentDialog open onOpenChange={onOpenChange} encounter={waitingEncounter} />)

    expect(await screen.findByText("Đang chờ ngân hàng xác nhận")).toBeInTheDocument()
    expect(screen.getByText("Chưa nhận được mã QR từ hệ thống thanh toán.")).toBeInTheDocument()
    expect(screen.queryByAltText("Mã QR thanh toán")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Đóng và tiếp tục" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect((await fetchInvoiceByEncounter(waitingEncounter)).paymentStatus).toBe("PENDING")
  })

  it("shows a paid invoice as read-only", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const invoice = await fetchInvoiceByEncounter(waitingEncounter)
    invoice.paymentStatus = "PAID"
    renderWithClient(<PaymentDialog open onOpenChange={onOpenChange} encounter={waitingEncounter} />)

    expect(await screen.findByText("Thanh toán thành công")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Xác nhận thu tiền" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Hoàn tất" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("shows a recoverable error when cash finalization fails", async () => {
    const user = userEvent.setup()
    const failure = vi.spyOn(billingApi, "processCashPayment").mockRejectedValueOnce(new Error("Ngân hàng tạm thời không phản hồi"))
    renderWithClient(<PaymentDialog open onOpenChange={vi.fn()} encounter={waitingEncounter} />)

    await user.click(await screen.findByRole("button", { name: "Xác nhận thu tiền" }))

    expect(await screen.findByText("Ngân hàng tạm thời không phản hồi")).toBeInTheDocument()
    failure.mockRestore()
  })
})
