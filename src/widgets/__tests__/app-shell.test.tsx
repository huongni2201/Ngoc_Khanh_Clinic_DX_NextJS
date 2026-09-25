import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AppShell } from "../app-shell/app-shell"

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/enterprises"),
}))

vi.mock("next/image", () => ({
  default: ({ priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    void priority
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />
  },
}))

describe("AppShell", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("exposes the active primary navigation and global search", () => {
    render(
      <AppShell>
        <p>Nội dung</p>
      </AppShell>
    )

    expect(
      screen.getByRole("navigation", { name: "Điều hướng chính" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Doanh nghiệp" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(
      screen.getByRole("searchbox", { name: "Tìm kiếm toàn hệ thống" })
    ).toBeInTheDocument()
    expect(screen.getByRole("main")).toContainElement(
      screen.getByText("Nội dung")
    )
  })
})
