import { describe, expect, it } from "vitest"
import { buildCreateAppointmentDto } from "../components/create-appointment/build-create-appointment-dto"

const form = {
  patientId: "patient-1",
  examinationType: "Khám tổng quát",
  physicianId: "doctor-1",
  roomId: "room-1",
  date: "2026-10-12",
  time: "09:00",
  notes: "",
  careProgram: "INDIVIDUAL" as const,
  organizationId: "",
  healthExaminationBatchId: "",
  participantCode: "",
}
const organization = { id: "org-1", name: "Công ty FPT" }
const batch = { id: "batch-1", name: "Đợt 1" }

describe("buildCreateAppointmentDto", () => {
  it("omits organization fields and empty notes for an individual appointment", () => {
    const dto = buildCreateAppointmentDto({
      form,
      patientId: "patient-1",
      careProgram: "INDIVIDUAL",
      organization,
      batch,
      participantCode: "NV001",
    })

    expect(dto).toMatchObject({ patientId: "patient-1", bookingChannel: "RECEPTION", careProgram: "INDIVIDUAL" })
    expect(dto.notes).toBeUndefined()
    expect(dto.organizationId).toBeUndefined()
    expect(dto.healthExaminationBatchId).toBeUndefined()
    expect(dto.participantCode).toBeUndefined()
  })

  it("sends the organization, batch and participant for an organization health examination", () => {
    const dto = buildCreateAppointmentDto({
      form: { ...form, notes: "Nhịn ăn sáng" },
      patientId: "patient-1",
      careProgram: "ORGANIZATION_HEALTH_EXAMINATION",
      organization,
      batch,
      participantCode: "NV001",
    })

    expect(dto).toMatchObject({
      notes: "Nhịn ăn sáng",
      organizationId: "org-1",
      organizationName: "Công ty FPT",
      healthExaminationBatchId: "batch-1",
      healthExaminationBatchName: "Đợt 1",
      participantCode: "NV001",
    })
  })
})
