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
