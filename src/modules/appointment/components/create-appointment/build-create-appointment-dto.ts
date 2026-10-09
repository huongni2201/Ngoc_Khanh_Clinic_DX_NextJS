import type { CreateAppointmentFormValues } from "../../schemas/appointment.schema"
import type { CareProgram, CreateAppointmentDto } from "../../types"

interface BuildCreateAppointmentDtoInput {
  form: CreateAppointmentFormValues
  patientId: string
  careProgram: CareProgram
  organization?: { id: string; name: string }
  batch?: { id: string; name: string }
  participantCode: string
}

/** Organization fields are sent only for an organization health examination. */
export function buildCreateAppointmentDto({
  form,
  patientId,
  careProgram,
  organization,
  batch,
  participantCode,
}: BuildCreateAppointmentDtoInput): CreateAppointmentDto {
  const isOrganization = careProgram === "ORGANIZATION_HEALTH_EXAMINATION"

  return {
    patientId,
    examinationType: form.examinationType,
    physicianId: form.physicianId,
    roomId: form.roomId,
    date: form.date,
    time: form.time,
    notes: form.notes || undefined,
    bookingChannel: "RECEPTION",
    careProgram,
    organizationId: isOrganization ? organization?.id : undefined,
    organizationName: isOrganization ? organization?.name : undefined,
    healthExaminationBatchId: isOrganization ? batch?.id : undefined,
    healthExaminationBatchName: isOrganization ? batch?.name : undefined,
    participantCode: isOrganization ? participantCode : undefined,
  }
}
