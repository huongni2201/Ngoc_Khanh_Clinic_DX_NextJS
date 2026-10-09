import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { OrganizationListPage } from "../pages/organization-list-page"
import { mockOrganizationFetch, organizationFixture } from "./organization-api-fixtures"
import { renderWithClient } from "@/test-utils/render-with-client"

const mockNavigation = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  search: "",
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockNavigation.push, replace: mockNavigation.replace }),
  usePathname: () => "/organizations",
  useSearchParams: () => new URLSearchParams(mockNavigation.search),
}))

describe("OrganizationListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigation.search = ""
    mockOrganizationFetch()
  })

  afterEach(() => vi.unstubAllGlobals())

  it("renders organization data from the backend response", async () => {
    renderWithClient(<OrganizationListPage />)

    expect(await screen.findByText(organizationFixture.name)).toBeInTheDocument()
    expect(screen.getByText(organizationFixture.address!)).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Tên đơn vị" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Địa chỉ" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Mã số thuế" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "SĐT người liên hệ" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Email người liên hệ" })).toBeInTheDocument()
  })

  it("normalizes an invalid page query to page 1", async () => {
    mockNavigation.search = "page=-3"
    const fetchMock = mockOrganizationFetch()
    renderWithClient(<OrganizationListPage />)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("page=1"),
        expect.objectContaining({ cache: "no-store" })
      )
    })
  })

  it("links each organization name to its detail page so it can be opened from the keyboard", async () => {
    renderWithClient(<OrganizationListPage />)

    const link = await screen.findByRole("link", { name: organizationFixture.name })
    expect(link).toHaveAttribute("href", `/organizations/${organizationFixture.id}`)
  })

  it("offers to clear the search when nothing matches", async () => {
    mockNavigation.search = "q=khong-co"
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              result: "OK",
              code: 200,
              data: { items: [], page: 1, size: 10, totalElements: 0, totalPages: 0 },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
      )
    )
    const user = userEvent.setup()
    renderWithClient(<OrganizationListPage />)

    expect(await screen.findByText("Không tìm thấy đơn vị phù hợp")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Xóa tìm kiếm" }))

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith("/organizations?page=1")
    })
  })

  it("trims search input before writing it to the URL", async () => {
    const user = userEvent.setup()
    renderWithClient(<OrganizationListPage />)

    await user.type(
      screen.getByPlaceholderText("Tìm theo tên đơn vị, mã số thuế, người liên hệ..."),
      " FPT "
    )

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith(
        "/organizations?q=FPT&page=1"
      )
    })
  })
})
