import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as agreementApi from "@/modules/healthexamination/agreements/api"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import { Toaster } from "@/shared/ui/toaster"
import { findDialog } from "./support/app-dialog"
import { HealthExaminationAgreementDetailPage } from "../pages/health-examination-agreement-detail-page"
import { healthExaminationKeys } from "../query-keys"
import type { HealthExaminationAgreement } from "../types"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/organizations/org-1/agreements/agreement-1",
  useSearchParams: () => new URLSearchParams(""),
}))

const draft: HealthExaminationAgreement = {
  id: "agreement-1",
  organizationId: "org-1",
  code: "KSK-2026-001",
  name: "Khám định kỳ 2026",
  status: "DRAFT",
  validFrom: "2026-10-20",
  validTo: "2026-10-31",
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-02T00:00:00Z",
  rowVersion: 4,
  createdBy: "staff-1",
  services: [
    {
      id: "line-1",
      serviceId: "service-1",
      code: "S1",
      name: "Khám nội",
      referencePrice: 200000,
      negotiatedPrice: 100000,
      displayOrder: 1,
      active: true,
    },
  ],
}

const active: HealthExaminationAgreement = { ...draft, status: "ACTIVE", rowVersion: 5 }

const session = (permissions: string[]) => ({
  userId: "u-1",
  staffId: "s-1",
  patientId: null,
  username: "staff",
  principalType: "STAFF" as const,
  roleAssignments: [{ roleId: "r-1", roleCode: "CLINIC_MANAGER", permissions }],
  idleExpiresAt: "2026-10-13T12:00:00Z",
  absoluteExpiresAt: "2026-10-13T20:00:00Z",
})

function renderPage(permissions: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  queryClient.setQueryData(["auth", "session"], session(permissions))
  const view = render(
    <QueryClientProvider client={queryClient}>
      <HealthExaminationAgreementDetailPage organizationId="org-1" agreementId="agreement-1" />
      <Toaster />
    </QueryClientProvider>
  )
  return { ...view, queryClient }
}

const detailBody = (overrides: Record<string, unknown> = {}) => ({
  id: "agreement-1",
  organizationId: "org-1",
  agreementCode: "KSK-2026-001",
  agreementName: "Khám định kỳ 2026",
  validFrom: "2026-10-20",
  validTo: "2026-10-31",
  status: "ACTIVE",
  createdBy: "staff-1",
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-10-13T00:00:00Z",
  rowVersion: 5,
  services: [],
  ...overrides,
})

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.restoreAllMocks())

describe("activate a health examination agreement", () => {
  it("calls the activate endpoint with the agreement version and parses the ACTIVE agreement", async () => {
    const actual = await vi.importActual<typeof agreementApi>("@/modules/healthexamination/agreements/api")
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({
      result: "OK",
      code: 200,
      data: detailBody(),
    })

    const activated = await actual.activateHealthExaminationAgreement({
      organizationId: "org-1",
      agreementId: "agreement-1",
      rowVersion: 4,
    })

    expect(post).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/agreements/agreement-1/activate",
      { rowVersion: 4 }
    )
    expect(activated.status).toBe("ACTIVE")
    expect(activated.rowVersion).toBe(5)
    expect(activated.validFrom).toBe("2026-10-20")
  })

  it("is offered only to a session with the activate permission", async () => {
    vi.spyOn(agreementApi, "fetchHealthExaminationAgreementById").mockResolvedValue(draft)
    renderPage(["HEALTH_EXAMINATION_AGREEMENT_UPDATE"])

    await screen.findByRole("heading", { name: "Khám định kỳ 2026" })
    expect(screen.queryByRole("button", { name: "Kích hoạt thỏa thuận" })).not.toBeInTheDocument()
  })

  it("confirms, sends the read version and shows the agreement as active", async () => {
    vi.spyOn(agreementApi, "fetchHealthExaminationAgreementById").mockResolvedValue(draft)
    const activate = vi
      .spyOn(agreementApi, "activateHealthExaminationAgreement")
      .mockResolvedValue(active)
    const { queryClient } = renderPage(["HEALTH_EXAMINATION_AGREEMENT_ACTIVATE"])
    const user = userEvent.setup()

    await user.click(await screen.findByRole("button", { name: "Kích hoạt thỏa thuận" }))
    const dialog = await findDialog()
    expect(within(dialog).getByText(/Không sửa lại tên/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Kích hoạt thỏa thuận" }))

    await waitFor(() =>
      expect(activate).toHaveBeenCalledWith({
        organizationId: "org-1",
        agreementId: "agreement-1",
        rowVersion: 4,
      })
    )
    expect((await screen.findAllByText("Đang áp dụng")).length).toBeGreaterThan(0)
    expect(
      queryClient.getQueryData<HealthExaminationAgreement>(healthExaminationKeys.agreement("org-1", "agreement-1"))
        ?.status
    ).toBe("ACTIVE")
    expect(screen.queryByRole("button", { name: "Chỉnh sửa" })).not.toBeInTheDocument()
  })

  it("explains a conflict and only reloads when asked", async () => {
    const get = vi.spyOn(agreementApi, "fetchHealthExaminationAgreementById").mockResolvedValue(draft)
    const activate = vi
      .spyOn(agreementApi, "activateHealthExaminationAgreement")
      .mockRejectedValue(new ApiClientError("x", 409))
    renderPage(["HEALTH_EXAMINATION_AGREEMENT_ACTIVATE"])
    const user = userEvent.setup()

    await user.click(await screen.findByRole("button", { name: "Kích hoạt thỏa thuận" }))
    const dialog = await findDialog()
    await user.click(within(dialog).getByRole("button", { name: "Kích hoạt thỏa thuận" }))

    expect(await within(dialog).findByText(/không còn ở trạng thái Nháp/)).toBeInTheDocument()
    const reads = get.mock.calls.length
    await user.click(within(dialog).getByRole("button", { name: "Tải lại dữ liệu mới nhất" }))
    await waitFor(() => expect(get.mock.calls.length).toBe(reads + 1))
    expect(activate).toHaveBeenCalledTimes(1)
  })
})

describe("end a health examination agreement", () => {
  it("calls the end endpoint with the agreement version", async () => {
    const actual = await vi.importActual<typeof agreementApi>("@/modules/healthexamination/agreements/api")
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({
      result: "OK",
      code: 200,
      data: detailBody({ status: "ENDED", rowVersion: 6 }),
    })

    const ended = await actual.endHealthExaminationAgreement({
      organizationId: "org-1",
      agreementId: "agreement-1",
      rowVersion: 5,
    })

    expect(post).toHaveBeenCalledWith("/api/v1/organizations/org-1/agreements/agreement-1/end", {
      rowVersion: 5,
    })
    expect(ended.status).toBe("ENDED")
  })

  it("is offered on an active agreement to a session with the end permission", async () => {
    vi.spyOn(agreementApi, "fetchHealthExaminationAgreementById").mockResolvedValue(active)
    const end = vi
      .spyOn(agreementApi, "endHealthExaminationAgreement")
      .mockResolvedValue({ ...active, status: "ENDED", rowVersion: 6 })
    renderPage(["HEALTH_EXAMINATION_AGREEMENT_END"])
    const user = userEvent.setup()

    await user.click(await screen.findByRole("button", { name: "Kết thúc thỏa thuận" }))
    const dialog = await findDialog()
    await user.click(within(dialog).getByRole("button", { name: "Kết thúc thỏa thuận" }))

    await waitFor(() =>
      expect(end).toHaveBeenCalledWith({
        organizationId: "org-1",
        agreementId: "agreement-1",
        rowVersion: 5,
      })
    )
    expect((await screen.findAllByText("Đã kết thúc")).length).toBeGreaterThan(0)
  })

  it("is not offered on a draft", async () => {
    vi.spyOn(agreementApi, "fetchHealthExaminationAgreementById").mockResolvedValue(draft)
    renderPage(["HEALTH_EXAMINATION_AGREEMENT_END"])

    await screen.findByRole("heading", { name: "Khám định kỳ 2026" })
    expect(screen.queryByRole("button", { name: "Kết thúc thỏa thuận" })).not.toBeInTheDocument()
  })
})

describe("services of an agreement", () => {
  it.each(["ACTIVE", "ENDED"] as const)(
    "shows the services read-only and explains the lock once the agreement is %s",
    async (status) => {
      vi.spyOn(agreementApi, "fetchHealthExaminationAgreementById").mockResolvedValue({
        ...active,
        status,
      })
      renderPage(["HEALTH_EXAMINATION_AGREEMENT_UPDATE", "HEALTH_EXAMINATION_AGREEMENT_DELETE"])

      await screen.findByRole("heading", { name: "Khám định kỳ 2026" })
      expect(screen.getByText("Khám nội")).toBeInTheDocument()
      expect(screen.getByText(/kể cả danh sách dịch vụ/)).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: "Thêm dịch vụ" })).not.toBeInTheDocument()
      expect(screen.queryByRole("button", { name: /Ngừng dịch vụ/ })).not.toBeInTheDocument()
      expect(screen.queryByRole("button", { name: "Chỉnh sửa" })).not.toBeInTheDocument()
    }
  )
})
