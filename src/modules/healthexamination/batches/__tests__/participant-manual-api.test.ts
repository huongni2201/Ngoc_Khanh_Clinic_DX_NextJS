import { afterEach, describe, expect, it, vi } from "vitest"
import { ZodError } from "zod"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import {
  buildParticipantCancelUrl,
  buildParticipantItemUrl,
  buildParticipantListUrl,
  buildParticipantReactivateUrl,
  cancelParticipant,
  createParticipant,
  fetchParticipantDetail,
  reactivateParticipant,
  updateParticipant,
} from "../api/participants"

const BASE = "/api/v1/organizations/org-1/health-examination-batches/batch-1/participants"

const backendDetail = {
  id: "p-1",
  batchId: "batch-1",
  batchDayId: "day-1",
  examinationDate: "2026-10-20",
  participantCode: "NV001",
  fullName: "Nguyễn Văn A",
  dateOfBirth: "1990-03-14",
  sex: "MALE",
  identificationNumberMasked: "********8901",
  identificationNumber: "012345678901",
  phone: "0900000000",
  email: null,
  departmentName: "Khối Công nghệ",
  positionName: "Kỹ sư",
  rosterStatus: "ACTIVE",
  attendanceStatus: "UNCONFIRMED",
  reconciliationStatus: "PENDING",
  actualExaminationDate: null,
  preparedAt: null,
  rowVersion: 3,
  patientLinked: false,
  source: "MANUAL",
  createdAt: "2026-10-07T01:00:00Z",
  updatedAt: "2026-10-07T01:00:00Z",
}

const input = {
  fullName: "  Nguyễn Văn A ",
  dateOfBirth: "1990-03-14",
  sex: "MALE" as const,
  identificationNumber: " 012345678901 ",
  phone: "   ",
  email: undefined,
  departmentName: " Khối Công nghệ ",
  positionName: "Kỹ sư",
  batchDayId: "day-1",
}

const envelope = (data: unknown) => ({ result: "OK" as const, code: 200, message: "ok", data })

afterEach(() => vi.restoreAllMocks())

describe("participant item URLs", () => {
  it("builds the item URL and encodes the id", () => {
    expect(buildParticipantItemUrl("org-1", "batch-1", "p-1")).toBe(`${BASE}/p-1`)
    expect(buildParticipantItemUrl("org-1", "batch-1", "a/b")).toBe(`${BASE}/a%2Fb`)
  })

  it("puts the row version of a cancellation in the query string", () => {
    expect(buildParticipantCancelUrl("org-1", "batch-1", "p-1", 7)).toBe(`${BASE}/p-1?rowVersion=7`)
  })
})

describe("participant reactivate URLs", () => {
  it("builds the reactivate URL under the item and encodes the id", () => {
    expect(buildParticipantReactivateUrl("org-1", "batch-1", "p-1")).toBe(`${BASE}/p-1/reactivate`)
    expect(buildParticipantReactivateUrl("org-1", "batch-1", "a/b")).toBe(`${BASE}/a%2Fb/reactivate`)
  })

  it("adds the exact CCCD filter to the list URL only when given", () => {
    const withFilter = buildParticipantListUrl("org-1", "batch-1", {
      identificationNumber: " 012345678901 ",
      rosterStatus: "CANCELLED",
      page: 1,
      pageSize: 1,
    })
    const query = new URL(withFilter, "http://x").searchParams
    expect(query.get("identificationNumber")).toBe("012345678901")
    expect(query.get("rosterStatus")).toBe("CANCELLED")
    expect(query.get("size")).toBe("1")

    expect(buildParticipantListUrl("org-1", "batch-1", {})).not.toContain("identificationNumber")
    expect(buildParticipantListUrl("org-1", "batch-1", { identificationNumber: "  " })).not.toContain(
      "identificationNumber"
    )
  })
})

describe("participant manual API", () => {
  it("reads the detail with the full CCCD and maps null optional fields to undefined", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue(envelope(backendDetail))

    const detail = await fetchParticipantDetail("org-1", "batch-1", "p-1")

    expect(get).toHaveBeenCalledWith(`${BASE}/p-1`, { signal: undefined })
    expect(detail.identificationNumber).toBe("012345678901")
    expect(detail.phone).toBe("0900000000")
    expect(detail.email).toBeUndefined()
    expect(detail.patientLinked).toBe(false)
    expect(detail.source).toBe("MANUAL")
    expect(detail.rowVersion).toBe(3)
  })

  it("rejects a detail response that is empty or not shaped like the contract", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValueOnce(envelope(null))
    await expect(fetchParticipantDetail("org-1", "batch-1", "p-1")).rejects.toThrow()

    vi.spyOn(apiClient, "get").mockResolvedValueOnce(envelope({ ...backendDetail, source: "OTHER" }))
    await expect(fetchParticipantDetail("org-1", "batch-1", "p-1")).rejects.toBeInstanceOf(ZodError)
  })

  it("creates with a trimmed body, null for blank optional text and no Idempotency-Key", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(envelope(backendDetail))

    const created = await createParticipant({ ...input, organizationId: "org-1", batchId: "batch-1" })

    expect(post).toHaveBeenCalledTimes(1)
    expect(post.mock.calls[0][0]).toBe(BASE)
    expect(post.mock.calls[0][1]).toEqual({
      fullName: "Nguyễn Văn A",
      dateOfBirth: "1990-03-14",
      sex: "MALE",
      identificationNumber: "012345678901",
      identificationIssueDate: null,
      identificationIssuePlace: null,
      ethnicity: null,
      phone: null,
      email: null,
      address: null,
      workplace: null,
      departmentName: "Khối Công nghệ",
      positionName: "Kỹ sư",
      note: null,
      batchDayId: "day-1",
    })
    expect(post.mock.calls[0][2]).toBeUndefined()
    expect(created.id).toBe("p-1")
  })

  it("updates with PUT and the row version the edit was based on", async () => {
    const put = vi.spyOn(apiClient, "put").mockResolvedValue(envelope(backendDetail))

    await updateParticipant({
      ...input,
      organizationId: "org-1",
      batchId: "batch-1",
      participantId: "p-1",
      rowVersion: 3,
    })

    expect(put.mock.calls[0][0]).toBe(`${BASE}/p-1`)
    expect(put.mock.calls[0][1]).toMatchObject({ rowVersion: 3, identificationNumber: "012345678901" })
  })

  it("cancels with DELETE and the row version in the query, never a body", async () => {
    const del = vi.spyOn(apiClient, "delete").mockResolvedValue(envelope(undefined) as never)

    await cancelParticipant({
      organizationId: "org-1",
      batchId: "batch-1",
      participantId: "p-1",
      rowVersion: 5,
    })

    expect(del).toHaveBeenCalledWith(`${BASE}/p-1?rowVersion=5`)
  })

  it("reactivates with POST, the row version and the chosen day, and parses the detail", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue(envelope({ ...backendDetail, rowVersion: 5 }))

    const detail = await reactivateParticipant({
      organizationId: "org-1",
      batchId: "batch-1",
      participantId: "p-1",
      rowVersion: 4,
      batchDayId: "day-2",
    })

    expect(post).toHaveBeenCalledTimes(1)
    expect(post.mock.calls[0][0]).toBe(`${BASE}/p-1/reactivate`)
    expect(post.mock.calls[0][1]).toEqual({ rowVersion: 4, batchDayId: "day-2" })
    expect(post.mock.calls[0][2]).toBeUndefined()
    expect(detail.id).toBe("p-1")
    expect(detail.rowVersion).toBe(5)
  })

  it("omits the day from the reactivate body when none is chosen", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(envelope(backendDetail))

    await reactivateParticipant({
      organizationId: "org-1",
      batchId: "batch-1",
      participantId: "p-1",
      rowVersion: 0,
    })

    expect(post.mock.calls[0][1]).toEqual({ rowVersion: 0 })
  })

  it("rejects an empty reactivate response", async () => {
    vi.spyOn(apiClient, "post").mockResolvedValue(envelope(null))
    await expect(
      reactivateParticipant({
        organizationId: "org-1",
        batchId: "batch-1",
        participantId: "p-1",
        rowVersion: 1,
      })
    ).rejects.toThrow()
  })

  it("lets a backend refusal reach the caller untouched", async () => {
    const error = new ApiClientError("x", 409, 409, "Participant identity already exists in this batch")
    vi.spyOn(apiClient, "post").mockRejectedValue(error)

    await expect(
      createParticipant({ ...input, organizationId: "org-1", batchId: "batch-1" })
    ).rejects.toBe(error)
  })
})
