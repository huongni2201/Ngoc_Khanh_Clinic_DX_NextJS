import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ScreenLayout } from "../screen-layout"
import { ScreenLoadingSkeleton } from "../screen-loading-skeleton"

describe("shared screen UI", () => {
  it("provides a stable page canvas contract", () => {
    render(<ScreenLayout>Danh sách</ScreenLayout>)

    expect(screen.getByText("Danh sách")).toHaveAttribute("data-slot", "screen-layout")
  })

  it("announces the loading state accessibly", () => {
    render(<ScreenLoadingSkeleton variant="worklist" />)

    expect(screen.getByRole("status", { name: "Đang tải nội dung…" })).toBeInTheDocument()
  })
})
