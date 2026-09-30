import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HealthExaminationBatchDetailPage } from "../pages/health-examination-batch-detail-page"

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

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
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
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(participantResponse),
        json: async () => participantResponse,
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

    expect(screen.getByRole("heading", { name: "Đợt khám batch-1" })).toBeInTheDocument()
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
    rendered.rerender(page)

    expect(screen.getByText("Chưa có API cho nội dung này.")).toBeInTheDocument()
    expect(screen.queryByText("Khám nội tổng quát")).not.toBeInTheDocument()
    expect(mockNavigation.push).toHaveBeenCalledWith(
      expect.stringContaining("tab=details"),
      { scroll: false }
    )
  })
})
