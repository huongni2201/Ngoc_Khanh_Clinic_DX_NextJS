import { afterEach, describe, expect, it } from "vitest"
import {
  checkInPatient,
  fetchClinicRooms,
  resetReceptionStore,
} from "@/modules/reception/api"

describe("patient check-in API", () => {
  afterEach(() => {
    resetReceptionStore()
  })

  it("creates an encounter through the canonical patient check-in operation", async () => {
    const rooms = await fetchClinicRooms()
    const encounter = await checkInPatient({
      patientId: "pat-001",
      examinationType: "Khám tổng quát",
      printAfterReception: false,
    })

    expect(rooms[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
    })
    expect(encounter.patientId).toBe("pat-001")
    expect(encounter.checkInStatus).toBe("CHECKED_IN")
    expect(encounter.encounterStatus).toBe("PLANNED")
    expect(encounter.printFormOnCheckIn).toBe(false)
  })
})
