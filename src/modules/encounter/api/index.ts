import { unavailableApi } from "@/shared/api/api-unavailable"
import type { EncounterSummary } from "../types/encounter"

export function fetchPatientEncounters(patientId: string): Promise<EncounterSummary[]> {
  void patientId
  return unavailableApi("lịch sử lượt khám")
}
