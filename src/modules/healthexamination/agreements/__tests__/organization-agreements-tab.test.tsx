import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as agreementApi from "@/modules/healthexamination/agreements/api"
import { ApiClientError } from "@/shared/api/api-client"
import { ALL_PERMISSIONS, staffSessionWith } from "@/test-utils/render-with-client"
import { OrganizationHealthExaminationAgreementsTab } from "../components/organization-agreements-tab"
import type { HealthExaminationAgreementListResponse } from "../types"

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), search: "" }))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  usePathname: () => "/organizations/ent-2",
  useSearchParams: () => new URLSearchParams(nav.search),
}))

function renderTab(permissions: readonly string[] = ALL_PERMISSIONS) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  queryClient.setQueryData(["auth", "session"], staffSessionWith(permissions))
  return render(
    <QueryClientProvider client={queryClient}>
      <OrganizationHealthExaminationAgreementsTab
        organizationId="ent-2"
        organizationName="Công ty Cổ phần FPT"
      />
    </QueryClientProvider>
  )
}

function listResponse(count: number, overrides: Partial<HealthExaminationAgreementListResponse> = {}) {
  return {
    data: Array.from({ length: count }, (_, index) => ({
      id: `agreement-${index + 1}`,
      organizationId: "ent-2",
      code: `DK00${index + 1}`,
      name: `Thỏa thuận ${index + 1}`,
      status: "DRAFT" as const,
      validFrom: "2026-10-01",
      validTo: "2026-10-02",
      createdAt: "2026-09-01T00:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z",
      rowVersion: 0,
    })),
    total: count,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    ...overrides,
  } satisfies HealthExaminationAgreementListResponse
}

describe("OrganizationHealthExaminationAgreementsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    nav.search = ""
  })

  it("lists the organization's agreements newest first with code, dates and status", async () => {
    const spy = vi
      .spyOn(agreementApi, "fetchHealthExaminationAgreementsByOrganization")
      .mockResolvedValue(listResponse(2))
    renderTab()

    expect(await screen.findByText("Thỏa thuận 1")).toBeInTheDocument()
    expect(screen.getByText("Mã: DK002")).toBeInTheDocument()
    expect(screen.getAllByText("01/10/2026 – 02/10/2026")).toHaveLength(2)
    expect(screen.getAllByText("Nháp")).toHaveLength(2)
    expect(spy.mock.calls[0][0]).toBe("ent-2")
    expect(spy.mock.calls[0][1]).toMatchObject({
      search: "", page: 1, pageSize: 10, sortKey: "createdAt", sortBy: "DESC",
    })
  })

  it("opens the agreement detail route when a row is clicked", async () => {
    vi.spyOn(agreementApi, "fetchHealthExaminationAgreementsByOrganization").mockResolvedValue(listResponse(1))
    renderTab()
    await userEvent.setup().click(await screen.findByText("Mã: DK001"))
    expect(nav.push).toHaveBeenCalledWith("/organizations/ent-2/agreements/agreement-1")
  })

  it("reads search and page from the URL and requests exactly that", async () => {
    nav.search = "tab=agreements&aq=Quý%203&apage=2"
    const spy = vi
      .spyOn(agreementApi, "fetchHealthExaminationAgreementsByOrganization")
      .mockResolvedValue(listResponse(1, { page: 2, total: 11, totalPages: 2 }))
    renderTab()
    await screen.findByText("Thỏa thuận 1")
    expect(spy.mock.calls[0][1]).toMatchObject({ search: "Quý 3", page: 2 })
    expect(screen.getByLabelText("Tìm thỏa thuận")).toHaveValue("Quý 3")
  })

  it("debounces typing into the URL search param and resets the page", async () => {
    nav.search = "tab=agreements&apage=3"
    vi.spyOn(agreementApi, "fetchHealthExaminationAgreementsByOrganization").mockResolvedValue(listResponse(1))
    renderTab()
    await screen.findByText("Thỏa thuận 1")
    await userEvent.setup().type(screen.getByLabelText("Tìm thỏa thuận"), "abc")
    await waitFor(() =>
      expect(nav.replace).toHaveBeenLastCalledWith("/organizations/ent-2?tab=agreements&aq=abc", { scroll: false })
    )
    expect(nav.replace).toHaveBeenCalledTimes(1)
  })

  it("changes the page through the URL", async () => {
    nav.search = "tab=agreements"
    vi.spyOn(agreementApi, "fetchHealthExaminationAgreementsByOrganization").mockResolvedValue(
      listResponse(10, { total: 25, totalPages: 3 })
    )
    renderTab()
    await screen.findByText("Thỏa thuận 1")
    await userEvent.setup().click(screen.getByLabelText("Trang 2"))
    expect(nav.replace).toHaveBeenCalledWith("/organizations/ent-2?tab=agreements&apage=2", { scroll: false })
  })

  it("shows an empty state with a create action, and a no-match state when searching", async () => {
    const spy = vi
      .spyOn(agreementApi, "fetchHealthExaminationAgreementsByOrganization")
      .mockResolvedValue(listResponse(0, { totalPages: 0 }))
    const first = renderTab()
    expect(await screen.findByText("Chưa có thỏa thuận nào cho đơn vị này")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /Tạo thỏa thuận/ }).length).toBeGreaterThan(0)
    first.unmount()

    nav.search = "aq=zzz"
    spy.mockResolvedValue(listResponse(0, { totalPages: 0 }))
    renderTab()
    expect(await screen.findByText("Không tìm thấy thỏa thuận phù hợp")).toBeInTheDocument()
  })

  it("hides the create action from an account without the create permission", async () => {
    vi.spyOn(agreementApi, "fetchHealthExaminationAgreementsByOrganization")
      .mockResolvedValue(listResponse(0, { totalPages: 0 }))
    renderTab(["HEALTH_EXAMINATION_AGREEMENT_VIEW"])

    expect(await screen.findByText("Chưa có thỏa thuận nào cho đơn vị này")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Tạo thỏa thuận/ })).not.toBeInTheDocument()
  })

  it("shows a Vietnamese error with a retry action and no stale rows", async () => {
    const spy = vi
      .spyOn(agreementApi, "fetchHealthExaminationAgreementsByOrganization")
      .mockRejectedValueOnce(new ApiClientError("Máy chủ gặp lỗi. Vui lòng thử lại sau.", 500))
      .mockResolvedValueOnce(listResponse(1))
    renderTab()
    expect(await screen.findByRole("alert")).toHaveTextContent("Máy chủ gặp lỗi. Vui lòng thử lại sau.")
    await userEvent.setup().click(screen.getByRole("button", { name: "Thử lại" }))
    expect(await screen.findByText("Thỏa thuận 1")).toBeInTheDocument()
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it("opens the create dialog from the toolbar", async () => {
    vi.spyOn(agreementApi, "fetchHealthExaminationAgreementsByOrganization").mockResolvedValue(listResponse(1))
    renderTab()
    await userEvent.setup().click(await screen.findByRole("button", { name: "Tạo thỏa thuận" }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Tạo thỏa thuận cho Công ty Cổ phần FPT")).toBeInTheDocument()
  })
})
