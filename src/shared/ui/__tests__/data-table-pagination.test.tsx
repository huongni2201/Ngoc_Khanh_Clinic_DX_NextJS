import * as React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DataTablePagination } from "../data-table-pagination"

describe("DataTablePagination (shadcn/ui Composition)", () => {
  it("renders 'Không có dữ liệu' when totalItems is 0", () => {
    render(
      <DataTablePagination
        currentPage={1}
        pageSize={10}
        totalItems={0}
        totalPages={0}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument()
    expect(screen.queryByRole("navigation", { name: "Phân trang" })).not.toBeInTheDocument()
  })

  it("renders summary info and navigation when totalPages > 1", () => {
    render(
      <DataTablePagination
        currentPage={1}
        pageSize={10}
        totalItems={35}
        totalPages={4}
        onPageChange={vi.fn()}
        entityName="đơn vị"
      />
    )

    expect(screen.getByText(/Hiển thị/i)).toBeInTheDocument()
    expect(screen.getByText("35")).toBeInTheDocument()
    expect(screen.getByText(/đơn vị/i)).toBeInTheDocument()

    const nav = screen.getByRole("navigation", { name: "Phân trang" })
    expect(nav).toBeInTheDocument()

    // Previous and Next buttons
    const prevBtn = screen.getByRole("button", { name: "Trang trước" })
    const nextBtn = screen.getByRole("button", { name: "Trang sau" })
    expect(prevBtn).toBeInTheDocument()
    expect(nextBtn).toBeInTheDocument()

    // Page 1 is active
    const page1Btn = screen.getByRole("button", { name: "Trang 1" })
    expect(page1Btn).toHaveAttribute("aria-current", "page")

    // Previous button is disabled on page 1
    expect(prevBtn).toBeDisabled()
    expect(nextBtn).toBeEnabled()
  })

  it("calls onPageChange with correct page number when page link is clicked", async () => {
    const user = userEvent.setup()
    const handlePageChange = vi.fn()

    render(
      <DataTablePagination
        currentPage={1}
        pageSize={10}
        totalItems={35}
        totalPages={4}
        onPageChange={handlePageChange}
      />
    )

    const page2Btn = screen.getByRole("button", { name: "Trang 2" })
    await user.click(page2Btn)

    expect(handlePageChange).toHaveBeenCalledWith(2)
  })

  it("calls onPageChange with next and previous pages when next/previous buttons are clicked", async () => {
    const user = userEvent.setup()
    const handlePageChange = vi.fn()

    render(
      <DataTablePagination
        currentPage={2}
        pageSize={10}
        totalItems={35}
        totalPages={4}
        onPageChange={handlePageChange}
      />
    )

    const prevBtn = screen.getByRole("button", { name: "Trang trước" })
    const nextBtn = screen.getByRole("button", { name: "Trang sau" })

    await user.click(prevBtn)
    expect(handlePageChange).toHaveBeenCalledWith(1)

    await user.click(nextBtn)
    expect(handlePageChange).toHaveBeenCalledWith(3)
  })

  it("disables next button on the last page", () => {
    render(
      <DataTablePagination
        currentPage={4}
        pageSize={10}
        totalItems={35}
        totalPages={4}
        onPageChange={vi.fn()}
      />
    )

    const nextBtn = screen.getByRole("button", { name: "Trang sau" })
    expect(nextBtn).toBeDisabled()
  })

  it("renders ellipsis for large page counts (e.g. 10 pages)", () => {
    render(
      <DataTablePagination
        currentPage={5}
        pageSize={10}
        totalItems={100}
        totalPages={10}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.getByRole("button", { name: "Trang 1" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Trang 4" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Trang 5" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Trang 6" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Trang 10" })).toBeInTheDocument()
    expect(screen.getAllByText("More pages").length).toBeGreaterThanOrEqual(1)
  })
})

