import "@testing-library/jest-dom"
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

vi.mock("@/modules/patients/api", async () =>
  import("@/modules/patients/__tests__/fixtures/api-fixtures")
)
vi.mock("@/modules/reception/api", async () =>
  import("@/modules/reception/__tests__/fixtures/api-fixtures")
)
vi.mock("@/modules/appointments/api", async () =>
  import("@/modules/appointments/__tests__/fixtures/api-fixtures")
)
vi.mock("@/modules/doctor/api", async () =>
  import("@/modules/doctor/__tests__/fixtures/api-fixtures")
)
vi.mock("@/modules/billing/api", async () =>
  import("@/modules/billing/__tests__/fixtures/api-fixtures")
)
vi.mock("@/modules/encounters/api", async () =>
  import("@/modules/encounters/__tests__/fixtures/api-fixtures")
)
vi.mock("@/modules/health-examinations/api", async () =>
  import("@/modules/health-examinations/__tests__/fixtures/api-fixtures")
)
