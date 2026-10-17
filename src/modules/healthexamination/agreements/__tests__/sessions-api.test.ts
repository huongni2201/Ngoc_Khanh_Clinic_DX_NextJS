import { afterEach, describe, expect, it, vi } from "vitest"
import { ZodError } from "zod"
import { apiClient } from "@/shared/api/api-client"
import {
  assignParticipantsToSession,
  buildAssignmentActionUrl,
  buildAssignmentListUrl,
  buildSessionListUrl,
  cancelExaminationSession,
  cancelSessionAssignment,
  createExaminationSession,
  fetchExaminationSessions,
  fetchSessionAssignments,
  moveSessionAssignment,
  moveSessionAssignments,
  recordSessionAttendance,
  updateExaminationSession,
} from "../api/sessions"

const SESSIONS = "/api/v1/organizations/org-1/sessions"
const ASSIGNMENTS = `${SESSIONS}/session-1/assignments`

const envelope = (data: unknown, code = 200) => ({ result: "OK" as const, code, message: "ok", data })

function backendSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "session-1",
    organizationId: "org-1",
    agreementId: null,
    sessionDate: "2026-10-20",
    activity: "ALL",
    siteType: "CLINIC",
    siteAddress: "",
    status: "OPEN",
    assignedCount: 5,
    attendedCount: 2,
    noShowCount: 1,
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
    rowVersion: 3,
    ...overrides,
  }
}

function backendAssignment(overrides: Record<string, unknown> = {}) {
  return {
    id: "assignment-2",
    participantId: "p-1",
    sessionId: "session-2",
    status: "ASSIGNED",
    replacedByAssignmentId: null,
    attendedAt: null,
    note: null,
    rowVersion: 0,
    ...overrides,
  }
}

afterEach(() => vi.restoreAllMocks())

describe("session URLs", () => {
  it("lists by date ascending with a first page of ten, and omits empty filters", () => {
    expect(buildSessionListUrl("org-1")).toBe(`${SESSIONS}?page=1&size=10&sortKey=sessionDate&sortBy=ASC`)
    expect(buildSessionListUrl("org-1", { search: "   ", agreementId: "" })).toBe(
      `${SESSIONS}?page=1&size=10&sortKey=sessionDate&sortBy=ASC`
    )
  })

  it("sends every filter the backend knows, with the search trimmed", () => {
    expect(
      buildSessionListUrl("org-1", {
        page: 2,
        pageSize: 20,
        search: " Hà Nội ",
        agreementId: "agreement-1",
        from: "2026-10-20",
        to: "2026-10-22",
        activity: "SAMPLING",
        status: "OPEN",
        sortKey: "sessionDate",
        sortBy: "DESC",
      })
    ).toBe(
      `${SESSIONS}?page=2&size=20&sortKey=sessionDate&sortBy=DESC&searchKey=H%C3%A0+N%E1%BB%99i&agreementId=agreement-1&from=2026-10-20&to=2026-10-22&activity=SAMPLING&status=OPEN`
    )
  })

  it("lists the Participants of a session by name and builds the action URLs", () => {
    expect(buildAssignmentListUrl("org-1", "session-1", { status: "NO_SHOW", search: "An" })).toBe(
      `${ASSIGNMENTS}?page=1&size=20&sortKey=fullName&sortBy=ASC&searchKey=An&status=NO_SHOW`
    )
    expect(buildAssignmentActionUrl("org-1", "session-1", "a/b", "attendance")).toBe(
      `${ASSIGNMENTS}/a%2Fb/attendance`
    )
    expect(buildAssignmentListUrl("a/b", "c d")).toContain("organizations/a%2Fb/sessions/c%20d/")
  })
})

describe("sessions", () => {
  it("parses a page of sessions and maps null to undefined, keeping the counts for reference", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(
      envelope({
        items: [backendSession(), backendSession({ id: "session-2", agreementId: "agreement-1", siteType: "ORGANIZATION_SITE", siteAddress: "1 Đường A" })],
        page: 1,
        size: 10,
        totalElements: 2,
        totalPages: 1,
      })
    )

    const result = await fetchExaminationSessions("org-1", { agreementId: "agreement-1" })

    expect(get).toHaveBeenCalledWith(expect.stringContaining(`${SESSIONS}?`), { signal: undefined })
    expect(result).toMatchObject({ total: 2, page: 1, pageSize: 10, totalPages: 1 })
    expect(result.data[0]).toMatchObject({
      agreementId: undefined,
      siteAddress: undefined,
      assignedCount: 5,
      attendedCount: 2,
      noShowCount: 1,
    })
    expect(result.data[1]).toMatchObject({ agreementId: "agreement-1", siteAddress: "1 Đường A" })
    // There is no capacity and no shift on a session.
    expect(result.data[0]).not.toHaveProperty("capacity")
  })

  it("rejects an unknown activity or status instead of rendering it", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(
      envelope({
        items: [backendSession({ activity: "NIGHT" })],
        page: 1,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      })
    )

    await expect(fetchExaminationSessions("org-1")).rejects.toBeInstanceOf(ZodError)
  })

  it("creates a clinic session without an address and reserves it to an agreement when asked", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(envelope(backendSession(), 201))

    await createExaminationSession({
      organizationId: "org-1",
      sessionDate: "2026-10-20",
      activity: "ALL",
      siteType: "CLINIC",
      siteAddress: "ignored",
      agreementId: "agreement-1",
    })

    expect(post).toHaveBeenCalledWith(SESSIONS, {
      sessionDate: "2026-10-20",
      activity: "ALL",
      siteType: "CLINIC",
      siteAddress: "",
      agreementId: "agreement-1",
    })
  })

  it("creates a shared session at the organization with a trimmed address", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(envelope(backendSession(), 201))

    await createExaminationSession({
      organizationId: "org-1",
      sessionDate: "2026-10-20",
      activity: "SAMPLING",
      siteType: "ORGANIZATION_SITE",
      siteAddress: "  1 Đường A ",
    })

    expect(post.mock.calls[0][1]).toEqual({
      sessionDate: "2026-10-20",
      activity: "SAMPLING",
      siteType: "ORGANIZATION_SITE",
      siteAddress: "1 Đường A",
    })
  })

  it("updates with PUT and the version the edit was based on, but never the agreement", async () => {
    const put = vi.spyOn(apiClient, "put").mockResolvedValue(envelope(backendSession({ rowVersion: 4 })))

    const saved = await updateExaminationSession({
      organizationId: "org-1",
      sessionId: "session-1",
      sessionDate: "2026-10-21",
      activity: "EXAMINATION",
      siteType: "CLINIC",
      siteAddress: "",
      rowVersion: 3,
    })

    expect(put).toHaveBeenCalledWith(`${SESSIONS}/session-1`, {
      sessionDate: "2026-10-21",
      activity: "EXAMINATION",
      siteType: "CLINIC",
      siteAddress: "",
      rowVersion: 3,
    })
    expect(saved.rowVersion).toBe(4)
  })

  it("cancels with POST and the version", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue(envelope(backendSession({ status: "CANCELLED", rowVersion: 4 })))

    const cancelled = await cancelExaminationSession({
      organizationId: "org-1",
      sessionId: "session-1",
      rowVersion: 3,
    })

    expect(post).toHaveBeenCalledWith(`${SESSIONS}/session-1/cancel`, { rowVersion: 3 })
    expect(cancelled.status).toBe("CANCELLED")
  })
})

describe("assignments", () => {
  it("parses the Participants of a session with the version of each assignment", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(
      envelope({
        items: [
          {
            assignmentId: "a-1",
            status: "ASSIGNED",
            attendedAt: null,
            note: null,
            assignmentRowVersion: 2,
            participantId: "p-1",
            agreementId: "agreement-1",
            participantCode: "NV001",
            fullName: "Nguyễn Văn A",
            dateOfBirth: "1990-03-14",
            sex: "MALE",
            identificationNumberMasked: "********8901",
            departmentName: "Kế toán",
            positionName: "Nhân viên",
            rosterStatus: "ACTIVE",
          },
        ],
        page: 1,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      })
    )

    const result = await fetchSessionAssignments("org-1", "session-1")

    expect(result.data[0]).toMatchObject({
      assignmentId: "a-1",
      assignmentRowVersion: 2,
      attendedAt: undefined,
      identificationNumberMasked: "********8901",
    })
    expect(result.data[0]).not.toHaveProperty("identificationNumber")
  })

  it("assigns 1 to 1000 Participants and reports who was already there", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(
      envelope(
        {
          sessionId: "session-1",
          assigned: [
            { participantId: "p-1", assignmentId: "a-1" },
            { participantId: "p-2", assignmentId: "a-2" },
          ],
          skippedParticipantIds: ["p-3"],
        },
        201
      )
    )

    const result = await assignParticipantsToSession({
      organizationId: "org-1",
      sessionId: "session-1",
      participantIds: ["p-1", "p-2", "p-3"],
    })

    expect(post).toHaveBeenCalledWith(ASSIGNMENTS, { participantIds: ["p-1", "p-2", "p-3"] })
    expect(result).toEqual({ sessionId: "session-1", assignedCount: 2, skippedParticipantIds: ["p-3"] })
  })

  it("moves one Participant: the answer is the new assignment, the old one stays as history", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(envelope(backendAssignment()))

    const moved = await moveSessionAssignment({
      organizationId: "org-1",
      sessionId: "session-1",
      assignmentId: "assignment-1",
      targetSessionId: "session-2",
      rowVersion: 4,
    })

    expect(post).toHaveBeenCalledWith(`${ASSIGNMENTS}/assignment-1/move`, {
      targetSessionId: "session-2",
      rowVersion: 4,
    })
    expect(moved).toMatchObject({ id: "assignment-2", sessionId: "session-2", status: "ASSIGNED" })
  })

  it("moves the whole session without a version and keeps the skipped Participants", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(
      envelope({
        sourceSessionId: "session-1",
        targetSessionId: "session-2",
        movedCount: 8,
        skippedParticipantIds: ["p-9"],
      })
    )

    const result = await moveSessionAssignments({
      organizationId: "org-1",
      sessionId: "session-1",
      targetSessionId: "session-2",
    })

    expect(post).toHaveBeenCalledWith(`${ASSIGNMENTS}/move`, { targetSessionId: "session-2" })
    expect(result).toEqual({
      sourceSessionId: "session-1",
      targetSessionId: "session-2",
      movedCount: 8,
      skippedParticipantIds: ["p-9"],
    })
  })

  it("cancels with the version and sends the note only when there is one", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue(envelope(backendAssignment({ id: "assignment-1", status: "CANCELLED" })))

    await cancelSessionAssignment({
      organizationId: "org-1",
      sessionId: "session-1",
      assignmentId: "assignment-1",
      rowVersion: 1,
      note: "  Nghỉ phép ",
    })
    await cancelSessionAssignment({
      organizationId: "org-1",
      sessionId: "session-1",
      assignmentId: "assignment-1",
      rowVersion: 1,
      note: "   ",
    })

    expect(post.mock.calls[0]).toEqual([
      `${ASSIGNMENTS}/assignment-1/cancel`,
      { rowVersion: 1, note: "Nghỉ phép" },
    ])
    expect(post.mock.calls[1][1]).toEqual({ rowVersion: 1 })
  })

  it.each(["ATTENDED", "NO_SHOW", "ASSIGNED"] as const)(
    "records %s on one assignment with its version",
    async (status) => {
      const post = vi
        .spyOn(apiClient, "post")
        .mockResolvedValue(envelope(backendAssignment({ id: "assignment-1", status, rowVersion: 2 })))

      const recorded = await recordSessionAttendance({
        organizationId: "org-1",
        sessionId: "session-1",
        assignmentId: "assignment-1",
        status,
        rowVersion: 1,
      })

      expect(post).toHaveBeenCalledWith(`${ASSIGNMENTS}/assignment-1/attendance`, {
        status,
        rowVersion: 1,
      })
      expect(recorded.status).toBe(status)
    }
  )

  it("fails when the answer has no data", async () => {
    vi.spyOn(apiClient, "post").mockResolvedValue({ result: "OK", code: 200, message: "", data: null })

    await expect(
      moveSessionAssignments({ organizationId: "org-1", sessionId: "session-1", targetSessionId: "s" })
    ).rejects.toThrow()
  })
})
