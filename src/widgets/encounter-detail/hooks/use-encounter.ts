import { useQuery } from "@tanstack/react-query"
import { fetchEncounterDetail } from "../api"

export const ENCOUNTER_QUERY_KEY = ["encounter"]

export function useEncounterDetail(patientId?: string, encounterId?: string) {
  return useQuery({
    queryKey: [...ENCOUNTER_QUERY_KEY, patientId, encounterId],
    queryFn: () => fetchEncounterDetail(patientId!, encounterId!),
    enabled: !!patientId && !!encounterId,
  })
}
