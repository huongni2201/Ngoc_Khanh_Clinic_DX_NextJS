import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { MoneyInput, formatVND } from "../money-input"

describe("MoneyInput", () => {
  it("formats numbers in Vietnamese Dong currency style", () => {
    expect(formatVND(180000)).toBe("180.000 đ")
    expect(formatVND(0)).toBe("0 đ")
    expect(formatVND(null)).toBe("0 đ")
    expect(formatVND(undefined)).toBe("0 đ")
  })

  it("renders disabled state with '0 đ' and muted styles", () => {
    render(<MoneyInput value={0} disabled={true} />)
    const input = screen.getByRole("textbox")
    expect(input).toBeDisabled()
    expect(input).toHaveValue("0 đ")
    expect(input).toHaveClass("cursor-not-allowed")
  })

  it("renders enabled state with formatted value", () => {
    render(<MoneyInput value={220000} disabled={false} />)
    const input = screen.getByRole("textbox")
    expect(input).toBeEnabled()
    expect(input).toHaveValue("220.000 đ")
  })

  it("calls onChange with parsed integer value when user types", async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<MoneyInput value={0} onChange={handleChange} disabled={false} />)
    const input = screen.getByRole("textbox")

    await user.clear(input)
    await user.type(input, "150000")

    expect(handleChange).toHaveBeenCalled()
    expect(handleChange).toHaveBeenLastCalledWith(150000)
  })
})
