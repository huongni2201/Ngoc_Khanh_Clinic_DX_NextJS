import { describe, expect, it, vi } from "vitest"
import type * as AppointmentsApi from "@/modules/appointments/api"
import type * as BillingApi from "@/modules/billing/api"
import type * as DoctorApi from "@/modules/doctor/api"
import type * as EncountersApi from "@/modules/encounters/api"
import type * as HealthExaminationsApi from "@/modules/health-examinations/api"
import type * as PatientsApi from "@/modules/patients/api"
import type * as ReceptionApi from "@/modules/reception/api"
import * as appointmentFixtures from "@/modules/appointments/__tests__/fixtures/api-fixtures"
import * as billingFixtures from "@/modules/billing/__tests__/fixtures/api-fixtures"
import * as doctorFixtures from "@/modules/doctor/__tests__/fixtures/api-fixtures"
import * as encounterFixtures from "@/modules/encounters/__tests__/fixtures/api-fixtures"
import * as healthExaminationFixtures from "@/modules/health-examinations/__tests__/fixtures/api-fixtures"
import * as patientFixtures from "@/modules/patients/__tests__/fixtures/api-fixtures"
import * as receptionFixtures from "@/modules/reception/__tests__/fixtures/api-fixtures"

/**
 * Production modules own their API signatures; fixtures depend on them, never the
 * other way round. The `satisfies` checks fail typecheck when a fixture drifts from
 * the production signature, and the runtime check fails when a fixture stops
 * exporting a production function that tests rely on through the global mock.
 */
const contracts = [
  ["appointments", "@/modules/appointments/api", appointmentFixtures satisfies typeof AppointmentsApi],
  ["billing", "@/modules/billing/api", billingFixtures satisfies typeof BillingApi],
  ["doctor", "@/modules/doctor/api", doctorFixtures satisfies typeof DoctorApi],
  ["encounters", "@/modules/encounters/api", encounterFixtures satisfies typeof EncountersApi],
  [
    "health-examinations",
    "@/modules/health-examinations/api",
    healthExaminationFixtures satisfies typeof HealthExaminationsApi,
  ],
  ["patients", "@/modules/patients/api", patientFixtures satisfies typeof PatientsApi],
  ["reception", "@/modules/reception/api", receptionFixtures satisfies typeof ReceptionApi],
] as const

describe("module API fixtures", () => {
  it.each(contracts)("%s fixtures export every production API function", async (_name, apiPath, fixtures) => {
    const production = await vi.importActual<Record<string, unknown>>(apiPath)

    expect(Object.keys(fixtures)).toEqual(expect.arrayContaining(Object.keys(production)))
  })
})
