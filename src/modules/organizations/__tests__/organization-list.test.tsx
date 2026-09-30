import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { OrganizationListPage } from "../pages/organization-list-page"
import { mockOrganizationFetch, organizationFixture } from "./organization-api-fixtures"

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

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

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
