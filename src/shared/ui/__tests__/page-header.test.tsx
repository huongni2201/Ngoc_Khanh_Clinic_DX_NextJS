import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "@/components/ui/button"
import { PageHeader } from "../page-header"

describe("PageHeader", () => {
  it("keeps page context and the primary action in one accessible header", () => {
    render(
      <PageHeader
        breadcrumbs={[
          { label: "Đơn vị", href: "/organizations" },
          { label: "Đợt khám" },
        ]}
        title="Đợt khám tháng 9"
        titleAccessory={<span>Đang diễn ra</span>}
        description="Danh sách nhân viên tham gia đợt khám"
        actions={<Button>Import nhân sự</Button>}
      />
    )

    expect(
      screen.getByRole("heading", { level: 1, name: "Đợt khám tháng 9" })
    ).toBeInTheDocument()
    expect(screen.getByText("Đang diễn ra")).toBeInTheDocument()
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Đơn vị" })).toHaveAttribute(
      "href",
      "/organizations"
    )
    expect(screen.getByText("Đợt khám")).toHaveAttribute("aria-current", "page")
    expect(
      screen.getByText("Danh sách nhân viên tham gia đợt khám")
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Import nhân sự" })
    ).toBeInTheDocument()
  })
})

