import { describe, expect, it, vi } from "vitest"
import type * as AppointmentsApi from "@/modules/appointment/api"
import type * as BillingApi from "@/modules/billing/api"
import type * as DoctorApi from "@/widgets/doctor/api"
import type * as EncountersApi from "@/modules/encounter/api"
import type * as HealthExaminationsApi from "@/modules/healthexamination/batches/api"
import type * as PatientsApi from "@/modules/patient/api"
import type * as ReceptionApi from "@/widgets/reception/api"
import * as appointmentFixtures from "@/modules/appointment/__tests__/fixtures/api-fixtures"
import * as billingFixtures from "@/modules/billing/__tests__/fixtures/api-fixtures"
import * as doctorFixtures from "@/widgets/doctor/__tests__/fixtures/api-fixtures"
import * as encounterFixtures from "@/widgets/encounter-detail/__tests__/fixtures/api-fixtures"
import * as healthExaminationFixtures from "@/modules/healthexamination/batches/__tests__/fixtures/api-fixtures"
import * as patientFixtures from "@/modules/patient/__tests__/fixtures/api-fixtures"
import * as receptionFixtures from "@/widgets/reception/__tests__/fixtures/api-fixtures"

/**
 * Production modules own their API signatures; fixtures depend on them, never the
 * other way round. The `satisfies` checks fail typecheck when a fixture drifts from
 * the production signature, and the runtime check fails when a fixture stops
 * exporting a production function that tests rely on through the global mock.
 */
const contracts = [
  ["appointments", "@/modules/appointment/api", appointmentFixtures satisfies typeof AppointmentsApi],
  ["billing", "@/modules/billing/api", billingFixtures satisfies typeof BillingApi],
  ["doctor", "@/widgets/doctor/api", doctorFixtures satisfies typeof DoctorApi],
  ["encounters", "@/modules/encounter/api", encounterFixtures satisfies typeof EncountersApi],
  [
    "health-examinations",
    "@/modules/healthexamination/batches/api",
    healthExaminationFixtures satisfies typeof HealthExaminationsApi,
  ],
  ["patients", "@/modules/patient/api", patientFixtures satisfies typeof PatientsApi],
  ["reception", "@/widgets/reception/api", receptionFixtures satisfies typeof ReceptionApi],
] as const

describe("module API fixtures", () => {
  it.each(contracts)("%s fixtures export every production API function", async (_name, apiPath, fixtures) => {
    const production = await vi.importActual<Record<string, unknown>>(apiPath)

    expect(Object.keys(fixtures)).toEqual(expect.arrayContaining(Object.keys(production)))
  })
})
