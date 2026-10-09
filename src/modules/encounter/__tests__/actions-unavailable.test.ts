import { afterEach, describe, expect, it, vi } from "vitest"
import { checkInPatient, assignRoomAndDoctor, startDoctorEncounter } from "@/modules/encounter"
import { apiClient } from "@/shared/api/api-client"
import { ApiUnavailableError } from "@/shared/api/api-unavailable"

vi.unmock("@/modules/encounter/api/encounter-actions")
afterEach(() => vi.restoreAllMocks())

describe("encounter actions without backend contracts", () => {
  it.each([
    () => checkInPatient({ patientId: "p-1", examinationType: "Khám tổng quát" }),
    () => assignRoomAndDoctor({ encounterId: "e-1", roomId: "r-1", physicianId: "d-1" }),
    () => startDoctorEncounter("e-1"),
  ])("keeps the action unavailable without sending HTTP requests", async (action) => {
    const post = vi.spyOn(apiClient, "post")
    const put = vi.spyOn(apiClient, "put")
    await expect(action()).rejects.toBeInstanceOf(ApiUnavailableError)
    expect(post).not.toHaveBeenCalled()
    expect(put).not.toHaveBeenCalled()
  })
})
