import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  result: {
    data: { data: [], total: 0, totalPages: 0 } as unknown,
    isLoading: false,
    isError: false,
    error: null as unknown,
    refetch: () => undefined,
  },
}))

vi.mock("../hooks/use-health-examination-batches", () => ({
  useHealthExaminationBatchParticipants: () => state.result,
  useDownloadParticipantImportTemplate: () => ({ mutate: () => undefined, isPending: false, isError: false }),
  useImportHealthExaminationBatchParticipants: () => ({ mutateAsync: () => Promise.reject(new Error("unused")), reset: () => undefined, isPending: false }),
}))

import { ParticipantsTab } from "../components/participants-tab/participants-tab"

describe("participants tab without the import permission", () => {
  it("shows the empty state with no import or template action", () => {
    render(<ParticipantsTab organizationId="org-1" batchId="batch-1" batch={{ code: "DK001", status: "DRAFT", rowVersion: 0 }} />)

    expect(screen.getByText("Chưa có người khám trong đợt khám")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /import/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /tải file mẫu/i })).not.toBeInTheDocument()
  })

  it("uses Người khám terminology when the list fails to load", () => {
    state.result = {
      ...state.result,
      data: undefined,
      isError: true,
      error: new Error("Đã xảy ra lỗi kết nối API."),
    }
    render(<ParticipantsTab organizationId="org-1" batchId="batch-1" batch={{ code: "DK001", status: "DRAFT", rowVersion: 0 }} />)

    expect(screen.getByText("Không thể tải danh sách người khám.")).toBeInTheDocument()
    expect(screen.queryByText(/nhân viên/i)).not.toBeInTheDocument()
  })
})
