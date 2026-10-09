import { unavailableApi } from "@/shared/api/api-unavailable"
import type { EncounterDetailData } from "../types"

export function fetchEncounterDetail(patientId: string, encounterId: string): Promise<EncounterDetailData> {
  void patientId
  void encounterId
  return unavailableApi("chi tiết lượt khám")
}
