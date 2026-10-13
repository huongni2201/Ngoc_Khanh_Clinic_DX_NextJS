import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as batchApi from "@/modules/healthexamination/batches/api"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import { Toaster } from "@/shared/ui/toaster"
import { findDialog } from "./support/app-dialog"
import { HealthExaminationBatchDetailPage } from "../pages/health-examination-batch-detail-page"
import { healthExaminationKeys } from "../query-keys"
import type { HealthExaminationBatch } from "../types"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/organizations/org-1/health-examination-batches/batch-1",
  useSearchParams: () => new URLSearchParams(""),
}))

const draft: HealthExaminationBatch = {
  id: "batch-1",
  organizationId: "org-1",
  code: "KSK-2026-001",
  name: "Khám định kỳ 2026",
  status: "DRAFT",
  startDate: "2026-10-20",
  endDate: "2026-10-21",
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-02T00:00:00Z",
  rowVersion: 4,
  examinationDates: ["2026-10-20", "2026-10-21"],
  examinationSiteType: "CLINIC",
  examinationSiteAddress: null,
  createdBy: "staff-1",
  services: [],
}

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
      <HealthExaminationBatchDetailPage organizationId="org-1" batchId="batch-1" />
      <Toaster />
    </QueryClientProvider>
  )
  return { ...view, queryClient }
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.restoreAllMocks())

describe("start a health examination batch", () => {
  it("calls the start endpoint with the batch version and parses the READY batch", async () => {
    const actual = await vi.importActual<typeof batchApi>("@/modules/healthexamination/batches/api")
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({
      result: "OK",
      code: 200,
      data: {
        id: "batch-1",
        organizationId: "org-1",
        batchCode: "KSK-2026-001",
        batchName: "Khám định kỳ 2026",
        startDate: "2026-10-20",
        endDate: "2026-10-21",
        status: "READY",
        createdAt: "2026-09-01T00:00:00Z",
        updatedAt: "2026-10-13T00:00:00Z",
        rowVersion: 5,
        days: [{ id: "day-1", examinationDate: "2026-10-20" }],
        examinationSiteType: "CLINIC",
        examinationSiteAddress: "",
        createdBy: "staff-1",
        services: [],
      },
    })

    const started = await actual.startHealthExaminationBatch({
      organizationId: "org-1",
      batchId: "batch-1",
      rowVersion: 4,
    })

    expect(post).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/health-examination-batches/batch-1/start",
      { rowVersion: 4 }
    )
    expect(started.status).toBe("READY")
    expect(started.rowVersion).toBe(5)
  })

  it("is offered only to a session with the start permission", async () => {
    vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockResolvedValue(draft)
    renderPage(["HEALTH_EXAMINATION_BATCH_UPDATE"])

    await screen.findByRole("heading", { name: "Khám định kỳ 2026" })
    expect(screen.queryByRole("button", { name: "Bắt đầu đợt khám" })).not.toBeInTheDocument()
  })

  it("confirms, sends the read version and shows the batch as ready", async () => {
    vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockResolvedValue(draft)
    const start = vi
      .spyOn(batchApi, "startHealthExaminationBatch")
      .mockResolvedValue({ ...draft, status: "READY", rowVersion: 5 })
    const { queryClient } = renderPage(["HEALTH_EXAMINATION_BATCH_START"])
    const user = userEvent.setup()

    await user.click(await screen.findByRole("button", { name: "Bắt đầu đợt khám" }))
    const dialog = await findDialog()
    expect(within(dialog).getByText(/không sửa được ngày khám/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Bắt đầu đợt khám" }))

    await waitFor(() =>
      expect(start).toHaveBeenCalledWith({
        organizationId: "org-1",
        batchId: "batch-1",
        rowVersion: 4,
      })
    )
    expect(await screen.findByText("Sẵn sàng")).toBeInTheDocument()
    expect(
      queryClient.getQueryData<HealthExaminationBatch>(healthExaminationKeys.batch("org-1", "batch-1"))
        ?.status
    ).toBe("READY")
    expect(screen.queryByRole("button", { name: "Chỉnh sửa" })).not.toBeInTheDocument()
  })

  it("explains a conflict and only reloads when asked", async () => {
    const get = vi.spyOn(batchApi, "fetchHealthExaminationBatchById").mockResolvedValue(draft)
    const start = vi
      .spyOn(batchApi, "startHealthExaminationBatch")
      .mockRejectedValue(new ApiClientError("x", 409))
    renderPage(["HEALTH_EXAMINATION_BATCH_START"])
    const user = userEvent.setup()

    await user.click(await screen.findByRole("button", { name: "Bắt đầu đợt khám" }))
    const dialog = await findDialog()
    await user.click(within(dialog).getByRole("button", { name: "Bắt đầu đợt khám" }))

    expect(await within(dialog).findByText(/không còn ở trạng thái Nháp/)).toBeInTheDocument()
    const reads = get.mock.calls.length
    await user.click(within(dialog).getByRole("button", { name: "Tải lại dữ liệu mới nhất" }))
    await waitFor(() => expect(get.mock.calls.length).toBe(reads + 1))
    expect(start).toHaveBeenCalledTimes(1)
  })
})
