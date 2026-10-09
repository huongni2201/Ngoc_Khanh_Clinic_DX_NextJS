import { describe, expect, it } from "vitest"
import {
  deriveReceptionWorklistStage,
  type ReceptionWorklistStageInput,
} from "../lib/reception-worklist-stage"

describe("deriveReceptionWorklistStage", () => {
  it.each([
    [
      "waiting for check-in",
      { checkInStatus: "NOT_CHECKED_IN" },
      "WAITING_CHECK_IN",
    ],
    [
      "in examination",
      { checkInStatus: "CHECKED_IN", encounterStatus: "IN_PROGRESS" },
      "IN_EXAMINATION",
    ],
    [
      "waiting for payment",
      { checkInStatus: "CHECKED_IN", encounterStatus: "COMPLETED", paymentStatus: "PENDING" },
      "WAITING_PAYMENT",
    ],
    [
      "waiting for diagnostic result",
      { checkInStatus: "CHECKED_IN", encounterStatus: "COMPLETED", paymentStatus: "PAID", diagnosticWorkflowStatus: "IN_PROGRESS" },
      "WAITING_DIAGNOSTIC_RESULTS",
    ],
    [
      "ready for conclusion",
      { checkInStatus: "CHECKED_IN", encounterStatus: "COMPLETED", paymentStatus: "PAID", diagnosticWorkflowStatus: "RESULTS_AVAILABLE" },
      "READY_FOR_CONCLUSION",
    ],
    [
      "completed",
      { checkInStatus: "CHECKED_IN", encounterStatus: "COMPLETED", paymentStatus: "PAID" },
      "COMPLETED",
    ],
  ] satisfies Array<[string, ReceptionWorklistStageInput, string]>) (
    "%s",
    (_label, input, expected) => {
      expect(deriveReceptionWorklistStage(input)).toBe(expected)
    },
  )

  it("keeps cancellation as the terminal stage", () => {
    expect(
      deriveReceptionWorklistStage({
        checkInStatus: "CHECKED_IN",
        encounterStatus: "CANCELLED",
        paymentStatus: "PENDING",
      }),
    ).toBe("CANCELLED")
  })
})
