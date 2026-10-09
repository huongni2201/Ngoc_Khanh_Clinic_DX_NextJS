export type EncounterStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED"

export interface EncounterSummary {
  id: string
  encounterCode: string
  patientId: string
  encounterDate: string
  serviceName: string
  physicianName: string
  room: string
  status: EncounterStatus
  statusLabel: string
  primaryDiagnosis: string
}
