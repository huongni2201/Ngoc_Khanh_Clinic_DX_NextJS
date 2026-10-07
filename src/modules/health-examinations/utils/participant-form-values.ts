import type {
  ParticipantDetail,
  ParticipantFormValues,
  ParticipantInput,
} from "../types"
import type { ValidatedParticipantFormValues } from "../schemas/participant.schema"

/** Empty form for a new Participant, scheduled on the batch's first day when it has only one. */
export function buildEmptyParticipantFormValues(defaultDayId = ""): ParticipantFormValues {
  return {
    participantCode: "",
    fullName: "",
    dateOfBirth: "",
    sex: "",
    identificationNumber: "",
    phone: "",
    email: "",
    departmentName: "",
    positionName: "",
    batchDayId: defaultDayId,
  }
}

/** Form values filled from the full detail (never from the masked list row). */
export function buildParticipantFormValues(participant: ParticipantDetail): ParticipantFormValues {
  return {
    participantCode: participant.participantCode ?? "",
    fullName: participant.fullName,
    dateOfBirth: participant.dateOfBirth,
    sex: participant.sex,
    identificationNumber: participant.identificationNumber,
    phone: participant.phone ?? "",
    email: participant.email ?? "",
    departmentName: participant.departmentName,
    positionName: participant.positionName,
    batchDayId: participant.batchDayId,
  }
}

/** Blank optional text is left out; the API layer sends it as `null`. */
export function toParticipantInput(values: ValidatedParticipantFormValues): ParticipantInput {
  return {
    participantCode: values.participantCode || undefined,
    fullName: values.fullName,
    dateOfBirth: values.dateOfBirth,
    sex: values.sex,
    identificationNumber: values.identificationNumber,
    phone: values.phone || undefined,
    email: values.email || undefined,
    departmentName: values.departmentName,
    positionName: values.positionName,
    batchDayId: values.batchDayId,
  }
}
