import { describe, expect, it } from "vitest"
import {
  EncounterDetailPage,
  EncounterDiagnosticOrdersView,
} from "@/modules/encounters"

describe("encounter module boundary", () => {
  it("exports the encounter detail page from the first-class module", () => {
    expect(EncounterDetailPage).toBeTypeOf("function")
    expect(EncounterDiagnosticOrdersView).toBeTypeOf("function")
  })
})
