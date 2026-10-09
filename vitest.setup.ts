import "@testing-library/jest-dom/vitest"
import * as React from "react"
import { vi } from "vitest"

vi.mock("@hugeicons/core-free-icons", () => {
  const targetObj: Record<string, unknown> = { __esModule: true }
  return new Proxy(targetObj, {
    get: (_target, prop) => {
      if (prop === "__esModule") return true
      if (prop === "default") return targetObj
      return [["path", { d: "", key: "icon-path" }]]
    },
    has: () => true,
  })
})

vi.mock("@hugeicons/react", () => ({
  HugeiconsIcon: (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "hugeicon", ...props }),
}))

vi.mock("@/modules/patient/api", async () =>
  import("@/modules/patient/__tests__/fixtures/api-fixtures")
)
vi.mock("@/widgets/reception/api", async () =>
  import("@/widgets/reception/__tests__/fixtures/api-fixtures")
)
vi.mock("@/modules/appointment/api", async () =>
  import("@/modules/appointment/__tests__/fixtures/api-fixtures")
)
vi.mock("@/widgets/doctor/api", async () =>
  import("@/widgets/doctor/__tests__/fixtures/api-fixtures")
)
vi.mock("@/modules/billing/api", async () =>
  import("@/modules/billing/__tests__/fixtures/api-fixtures")
)
vi.mock("@/modules/encounter/api", async () =>
  import("@/widgets/encounter-detail/__tests__/fixtures/api-fixtures")
)
vi.mock("@/modules/healthexamination/batches/api", async () =>
  import("@/modules/healthexamination/batches/__tests__/fixtures/api-fixtures")
)

vi.mock("@/modules/catalog/api/services", async () =>
  import("@/modules/catalog/__tests__/fixtures/api-fixtures")
)

vi.mock("@/widgets/encounter-detail/api", async () =>
  import("@/widgets/encounter-detail/__tests__/fixtures/api-fixtures")
)

vi.mock("@/modules/encounter/api/encounter-actions", async () => {
  const reception = await import("@/widgets/reception/__tests__/fixtures/api-fixtures")
  const doctor = await import("@/widgets/doctor/__tests__/fixtures/api-fixtures")
  return { checkInPatient: reception.checkInPatient, assignRoomAndDoctor: reception.assignRoomAndDoctor, startDoctorEncounter: doctor.startDoctorEncounter }
})
