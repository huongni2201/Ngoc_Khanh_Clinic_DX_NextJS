import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AlertCircle, Search, UserPlus } from "../product-icon"

describe("product icons", () => {
  it("render through the Hugeicons boundary and preserve accessible props", () => {
    render(
      <>
        <AlertCircle aria-label="Cảnh báo" className="size-4" />
        <Search aria-label="Tìm kiếm" />
        <UserPlus aria-hidden="true" />
      </>
    )

    expect(screen.getByLabelText("Cảnh báo")).toHaveAttribute(
      "data-slot",
      "product-icon"
    )
    expect(screen.getByLabelText("Tìm kiếm")).toHaveAttribute(
      "data-slot",
      "product-icon"
    )
    expect(document.querySelectorAll('[data-slot="product-icon"]')).toHaveLength(
      3
    )
  })
})
