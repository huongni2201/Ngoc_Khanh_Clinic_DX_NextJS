import { describe, expect, it, beforeEach } from "vitest"
import { fetchAppointments } from "@/modules/appointments/api"
import { resetAppointmentsStore } from "@/modules/appointments/__tests__/fixtures/api-fixtures"

describe("appointment terminology", () => {
  beforeEach(() => {
    resetAppointmentsStore()
  })

  it("exposes booking channel and care program as domain fields", async () => {
    const appointments = await fetchAppointments()
    expect(appointments[0]).toHaveProperty("bookingChannel")
    expect(appointments[0]).toHaveProperty("careProgram")
    expect(appointments[0]).not.toHaveProperty("source")
    expect(appointments[0]).not.toHaveProperty("type")
  })
})
