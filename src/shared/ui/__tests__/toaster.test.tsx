import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { Toaster, toast } from "../toaster"

afterEach(() => {
  act(() => toast.dismiss())
})

describe("Toaster", () => {
  it("shows a success toast with its message and description", async () => {
    render(<Toaster />)

    act(() => {
      toast.success("Đã lưu đơn vị", { description: "Thông tin đã được cập nhật." })
    })

    expect(await screen.findByText("Đã lưu đơn vị")).toBeInTheDocument()
    expect(screen.getByText("Thông tin đã được cập nhật.")).toBeInTheDocument()
  })

  it("announces an error toast urgently", async () => {
    render(<Toaster />)

    act(() => {
      toast.error("Không thể xuất tệp.")
    })

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Không thể xuất tệp.")
  })

  it("closes a toast from its close button", async () => {
    const user = userEvent.setup()
    render(<Toaster />)
    act(() => {
      toast.info("Đã đồng bộ danh sách")
    })

    // Base UI keeps the buttons out of the accessibility tree until the viewport is hovered or
    // focused with F6, so they are found by their label instead of by role.
    await user.click(await screen.findByLabelText("Đóng thông báo"))

    await waitFor(() => expect(screen.queryByText("Đã đồng bộ danh sách")).not.toBeInTheDocument())
  })

  it("dismisses itself after its timeout", async () => {
    render(<Toaster />)
    act(() => {
      toast.success("Đã sao chép", { timeout: 50 })
    })
    expect(await screen.findByText("Đã sao chép")).toBeInTheDocument()

    await waitFor(() => expect(screen.queryByText("Đã sao chép")).not.toBeInTheDocument())
  })

  it("updates a toast with the same id instead of stacking a copy", async () => {
    render(<Toaster />)

    act(() => {
      toast.warning("Phiên đăng nhập đã hết hạn.", { id: "session-expired" })
      toast.warning("Phiên đăng nhập đã hết hạn.", { id: "session-expired" })
    })

    expect(await screen.findAllByText("Phiên đăng nhập đã hết hạn.")).toHaveLength(1)
  })

  it("runs the optional action", async () => {
    const user = userEvent.setup()
    let retried = 0
    render(<Toaster />)
    act(() => {
      toast.error("Không thể tải tệp mẫu.", { action: { label: "Thử lại", onClick: () => retried++ } })
    })

    await user.click(await screen.findByRole("button", { name: "Thử lại", hidden: true }))

    expect(retried).toBe(1)
  })
})
