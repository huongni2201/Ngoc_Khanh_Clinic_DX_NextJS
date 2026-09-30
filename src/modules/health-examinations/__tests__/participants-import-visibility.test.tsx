import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({ role: null as string | null }))

vi.mock("@/modules/auth/hooks/use-auth", () => ({
  useAuth: () => ({ currentUser: state.role ? { role: state.role } : null }),
}))

vi.mock("../hooks/use-health-examination-batches", () => ({
  useHealthExaminationBatchParticipants: () => ({
    data: { data: [], total: 0, totalPages: 0 },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

vi.mock("../hooks/use-participant-imports", () => ({
  useDownloadParticipantImportTemplate: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock("../components/participants-tab/participant-import-dialog", () => ({
  ParticipantImportDialog: () => null,
}))

import { ParticipantsTab } from "../components/participants-tab/participants-tab"

describe("participant roster import controls", () => {
  beforeEach(() => { state.role = null })

  it("hides roster import actions without the clinic manager role", () => {
    render(<ParticipantsTab organizationId="org-1" batchId="batch-1" />)

    expect(screen.queryByRole("button", { name: /import danh sách/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /tải file mẫu/i })).not.toBeInTheDocument()
  })

  it("shows the template and import actions to clinic managers", () => {
    state.role = "CLINIC_MANAGER"

    render(<ParticipantsTab organizationId="org-1" batchId="batch-1" />)

    expect(screen.getByRole("button", { name: /import danh sách/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /tải file mẫu/i })).toBeInTheDocument()
  })
})
