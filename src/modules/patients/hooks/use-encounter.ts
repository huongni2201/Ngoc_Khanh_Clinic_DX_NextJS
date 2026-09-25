import { useQuery } from "@tanstack/react-query"
import { fetchEncounterDetail, fetchPatientEncounters } from "../api"

export const ENCOUNTER_QUERY_KEY = ["encounter"]
export const PATIENT_ENCOUNTERS_KEY = ["patient-encounters"]

export function useEncounterDetail(patientId?: string, encounterId?: string) {
  return useQuery({
    queryKey: [...ENCOUNTER_QUERY_KEY, patientId, encounterId],
    queryFn: () => fetchEncounterDetail(patientId!, encounterId!),
    enabled: !!patientId && !!encounterId,
  })
}

export function usePatientEncounters(patientId?: string) {
  return useQuery({
    queryKey: [...PATIENT_ENCOUNTERS_KEY, patientId],
    queryFn: () => fetchPatientEncounters(patientId!),
    enabled: !!patientId,
  })
}
