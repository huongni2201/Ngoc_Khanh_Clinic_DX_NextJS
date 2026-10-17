import type { HealthExaminationParticipant, ParticipantSelectionEntry } from "../types"
import { getParticipantCancelBlockReason } from "./participant-labels"

export function toParticipantSelectionEntry(
  participant: HealthExaminationParticipant
): ParticipantSelectionEntry {
  return {
    id: participant.id,
    participantCode: participant.participantCode,
    fullName: participant.fullName,
    departmentName: participant.departmentName,
    rowVersion: participant.rowVersion,
    cancelBlockReason: getParticipantCancelBlockReason(participant),
  }
}
