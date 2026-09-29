import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ok, staffSession } from "@/modules/auth/__tests__/fixtures"
import { AppShell } from "../app-shell/app-shell"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: vi.fn(() => "/organizations"),
}))

vi.mock("next/image", () => ({
  default: ({ priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    void priority
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />
  },
}))

vi.mock("@/modules/billing", () => ({ PaymentCompletionNotifier: () => null }))
afterEach(() => vi.unstubAllGlobals())

describe("AppShell", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(ok(staffSession))))
  })

  it("exposes the active primary navigation and global search", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}><AppShell>
        <p>Nội dung</p>
      </AppShell></QueryClientProvider>
    )

    await screen.findByText("staff.test")
    expect(
      screen.getByRole("navigation", { name: "Điều hướng chính" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Đơn vị" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(
      screen.getByRole("searchbox", { name: "Tìm kiếm toàn hệ thống" })
    ).toBeInTheDocument()
    expect(screen.getByRole("main")).toContainElement(
      screen.getByText("Nội dung")
    )
    expect(
      screen.getByRole("link", { name: "Bỏ qua đến nội dung chính" })
    ).toHaveAttribute("href", "#main-content")
  })
})

