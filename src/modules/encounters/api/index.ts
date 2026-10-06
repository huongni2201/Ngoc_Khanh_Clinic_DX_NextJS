import { unavailableApi } from "@/shared/api/api-unavailable"
import type {
  EncounterDetailData,
  EncounterSummary,
} from "../types/encounter"

export function fetchEncounterDetail(patientId: string, encounterId: string): Promise<EncounterDetailData> {
  void patientId
  void encounterId
  return unavailableApi("chi tiết lượt khám")
}

export function fetchPatientEncounters(patientId: string): Promise<EncounterSummary[]> {
  void patientId
  return unavailableApi("lịch sử lượt khám")
}
