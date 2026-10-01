import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { UserSession } from "@/modules/auth"
import { patientSession, staffSession } from "@/modules/auth/__tests__/fixtures"

const state = vi.hoisted(() => ({ session: null as UserSession | null }))

vi.mock("@/modules/auth", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/modules/auth")>(),
  useAuth: () => ({ currentUser: state.session }),
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
  beforeEach(() => { state.session = null })

  it("hides roster import actions without the clinic manager role", () => {
    render(<ParticipantsTab organizationId="org-1" batchId="batch-1" />)

    expect(screen.queryByRole("button", { name: /import danh sách/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /tải file mẫu/i })).not.toBeInTheDocument()
  })

  it("shows the template and import actions to clinic managers", () => {
    state.session = {
      ...staffSession,
      roleAssignments: [{ ...staffSession.roleAssignments[0], roleCode: "CLINIC_MANAGER" }],
    }

    render(<ParticipantsTab organizationId="org-1" batchId="batch-1" />)

    expect(screen.getByRole("button", { name: /import danh sách/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /tải file mẫu/i })).toBeInTheDocument()
  })

  it.each([
    ["a staff member with another role", staffSession],
    ["an expired clinic manager assignment", {
      ...staffSession,
      roleAssignments: [{
        ...staffSession.roleAssignments[0], roleCode: "CLINIC_MANAGER",
        validTo: "2026-01-02T00:00:00Z",
      }],
    }],
    ["a patient with a matching role code", {
      ...patientSession,
      roleAssignments: [{ ...staffSession.roleAssignments[0], roleCode: "CLINIC_MANAGER" }],
    }],
  ])("hides import actions for %s", (_, session) => {
    state.session = session as UserSession
    render(<ParticipantsTab organizationId="org-1" batchId="batch-1" />)
    expect(screen.queryByRole("button", { name: /import danh sách/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /tải file mẫu/i })).not.toBeInTheDocument()
  })
})
