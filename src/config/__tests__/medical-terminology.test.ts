import { describe, expect, it } from "vitest"
import { medicalTerms } from "../medical-terminology"

describe("medical terminology contract", () => {
  it("exposes the canonical clinic domain vocabulary", () => {
    expect(medicalTerms).toMatchObject({
      patient: "Patient",
      appointment: "Appointment",
      encounter: "Encounter",
      reception: "Reception",
      patientCheckIn: "Patient Check-in",
      physician: "Physician",
      practitioner: "Practitioner",
      organization: "Organization",
      clinicalService: "Clinical Service",
      serviceRequest: "Service Request",
      laboratory: "Laboratory",
      diagnosticImaging: "Diagnostic Imaging",
      functionalDiagnostics: "Functional Diagnostics",
      diagnosticReport: "Diagnostic Report",
      prescription: "Prescription",
      healthExamination: "Health Examination",
      periodicHealthExamination: "Periodic Health Examination",
      payment: "Payment",
      paymentReceipt: "Payment Receipt",
    })
  })

  it("does not expose Enterprise as a canonical domain term", () => {
    expect("enterprise" in medicalTerms).toBe(false)
  })
})

