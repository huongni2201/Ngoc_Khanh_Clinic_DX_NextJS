import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HealthExaminationBatchDetailPage } from "../pages/health-examination-batch-detail-page"

vi.unmock("@/modules/health-examinations/api")

const mockNavigation = vi.hoisted(() => ({
  push: vi.fn(),
  search: "",
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockNavigation.push }),
  usePathname: () => "/organizations/org-1/batches/batch-1",
  useSearchParams: () => new URLSearchParams(mockNavigation.search),
}))

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(ui, {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

const participantResponse = {
  result: "OK",
  code: 200,
  message: "Health examination batch participants",
  data: {
    items: [
      {
        batchParticipantId: "batch-participant-1",
        participantId: "participant-1",
        participantCode: "NV001",
        departmentName: "Khối Công nghệ",
        jobTitle: "Kỹ sư",
        occupation: "Phát triển phần mềm",
        fullName: "Nguyễn Văn A",
        dateOfBirth: "1990-03-14",
        sex: "MALE",
        identificationNumber: "012345678901",
        identificationNumberIssueDate: null,
        identificationNumberIssuePlace: null,
        ethnicity: null,
        subjectType: "EMPLOYEE",
        payerSource: "ORGANIZATION",
        bloodGroup: null,
        phone: "0901234567",
        province: "Hà Nội",
        ward: "Cầu Giấy",
        addressDetail: "10 Phạm Văn Bạch",
        administrativeOccupation: null,
        workplaceOrSchool: null,
        healthExaminationReason: "Khám định kỳ",
        status: "ACTIVE",
        createdAt: "2026-09-28T10:00:00Z",
      },
    ],
    page: 1,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  },
}

describe("HealthExaminationBatchDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigation.search = ""
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const isRoster = new URL(String(input)).pathname.endsWith("/participant")
        return Response.json(isRoster ? participantResponse : {
          result: "OK", code: 200, data: {
            id: "batch-1", organizationId: "org-1", batchCode: "DK001",
            batchName: "Khám định kỳ từ backend", startDate: "2026-09-28", endDate: null,
            reason: null, payerType: null, examinationSiteType: "COMPANY",
            examinationSiteName: "Trụ sở công ty", examinationSiteAddress: null,
            masterTemplateVersionId: "template-1", status: "IN_PROGRESS",
            finalizedAt: null, closedAt: null, createdBy: "user-1",
            createdAt: "2026-09-28T10:00:00Z", updatedAt: "2026-09-28T10:00:00Z",
            services: [],
          },
        })
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("renders participants from the real roster API without batch mock data", async () => {
    renderWithClient(
      <HealthExaminationBatchDetailPage
        organizationId="org-1"
        batchId="batch-1"
      />
    )

    await waitFor(() => {
      expect(screen.getByText("NV001")).toBeInTheDocument()
    })

    expect(await screen.findByRole("heading", { name: "Khám định kỳ từ backend" })).toBeInTheDocument()
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument()
    expect(screen.queryByText("Khám sức khỏe định kỳ 2026")).not.toBeInTheDocument()

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/v1/organizations/org-1/health-examination-batches/batch-1/participant"
      ),
      expect.objectContaining({ cache: "no-store" })
    )
  })

  it("sends the search keyword to the backend", async () => {
    const user = userEvent.setup()
    renderWithClient(
      <HealthExaminationBatchDetailPage organizationId="org-1" batchId="batch-1" />
    )

    const input = await screen.findByPlaceholderText(
      "Tìm theo mã người khám, họ tên, CCCD, số điện thoại..."
    )
    await user.type(input, "Nguyễn")

    await waitFor(() => {
      const calls = vi.mocked(fetch).mock.calls
      expect(calls.at(-1)?.[0]).toContain("searchKey=Nguy%E1%BB%85n")
    })
  })

  it("leaves tabs without an API empty", async () => {
    const user = userEvent.setup()
    const page = (
      <HealthExaminationBatchDetailPage organizationId="org-1" batchId="batch-1" />
    )
    const rendered = renderWithClient(page)

    await user.click(screen.getByRole("button", { name: "Chi tiết khám" }))
    await waitFor(() => expect(mockNavigation.push).toHaveBeenCalled())
    mockNavigation.search = new URL(
      mockNavigation.push.mock.calls.at(-1)?.[0] as string,
      "http://localhost"
    ).search
    rendered.rerender(React.cloneElement(page))

    expect(screen.getByText("Chưa có API cho nội dung này.")).toBeInTheDocument()
    expect(screen.queryByText("Khám nội tổng quát")).not.toBeInTheDocument()
    expect(mockNavigation.push).toHaveBeenCalledWith(
      expect.stringContaining("tab=details"),
      { scroll: false }
    )
  })
})
