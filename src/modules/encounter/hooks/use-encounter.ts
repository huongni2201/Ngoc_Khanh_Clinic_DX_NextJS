import { useQuery } from "@tanstack/react-query"
import { fetchPatientEncounters } from "../api"

export const PATIENT_ENCOUNTERS_KEY = ["patient-encounters"]

export function usePatientEncounters(patientId?: string) {
  return useQuery({
    queryKey: [...PATIENT_ENCOUNTERS_KEY, patientId],
    queryFn: () => fetchPatientEncounters(patientId!),
    enabled: !!patientId,
  })
}
