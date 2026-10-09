import type {
  ParticipantDetail,
  ParticipantFormValues,
  ParticipantInput,
} from "../types"
import type { ValidatedParticipantFormValues } from "../schemas/participant.schema"

/** Empty form for a new Participant, scheduled on the batch's first day when it has only one. */
export function buildEmptyParticipantFormValues(defaultDayId = ""): ParticipantFormValues {
  return {
    fullName: "",
    dateOfBirth: "",
    sex: "",
    identificationNumber: "",
    identificationIssueDate: "",
    identificationIssuePlace: "",
    ethnicity: "",
    phone: "",
    email: "",
    address: "",
    workplace: "",
    departmentName: "",
    positionName: "",
    note: "",
    batchDayId: defaultDayId,
  }
}

/** Form values filled from the full detail (never from the masked list row). */
export function buildParticipantFormValues(participant: ParticipantDetail): ParticipantFormValues {
  return {
    fullName: participant.fullName,
    dateOfBirth: participant.dateOfBirth,
    sex: participant.sex,
    identificationNumber: participant.identificationNumber,
    identificationIssueDate: participant.identificationIssueDate ?? "",
    identificationIssuePlace: participant.identificationIssuePlace ?? "",
    ethnicity: participant.ethnicity ?? "",
    phone: participant.phone ?? "",
    email: participant.email ?? "",
    address: participant.address ?? "",
    workplace: participant.workplace ?? "",
    departmentName: participant.departmentName,
    positionName: participant.positionName,
    note: participant.note ?? "",
    batchDayId: participant.batchDayId,
  }
}

/** Blank optional text is left out; the API layer sends it as `null`. */
export function toParticipantInput(values: ValidatedParticipantFormValues): ParticipantInput {
  return {
    fullName: values.fullName,
    dateOfBirth: values.dateOfBirth,
    sex: values.sex,
    identificationNumber: values.identificationNumber,
    identificationIssueDate: values.identificationIssueDate || undefined,
    identificationIssuePlace: values.identificationIssuePlace || undefined,
    ethnicity: values.ethnicity || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
    address: values.address || undefined,
    workplace: values.workplace || undefined,
    departmentName: values.departmentName,
    positionName: values.positionName,
    note: values.note || undefined,
    batchDayId: values.batchDayId,
  }
}
