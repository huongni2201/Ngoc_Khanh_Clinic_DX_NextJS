import { useQuery } from "@tanstack/react-query"
import {
  fetchDoctorWorklist,
  fetchDoctorCounters,
  fetchDoctorEncounterById,
} from "../api"
import { DoctorFilterParams } from "../types"

export const DOCTOR_WORKLIST_KEY = ["doctor", "worklist"]
export const DOCTOR_COUNTERS_KEY = ["doctor", "counters"]
export const DOCTOR_ENCOUNTER_KEY = (id: string) => ["doctor", "encounter", id]

export function useDoctorWorklist(params?: DoctorFilterParams) {
  return useQuery({
    queryKey: [...DOCTOR_WORKLIST_KEY, params],
    queryFn: () => fetchDoctorWorklist(params),
  })
}

export function useDoctorCounters() {
  return useQuery({
    queryKey: DOCTOR_COUNTERS_KEY,
    queryFn: () => fetchDoctorCounters(),
    refetchInterval: 30000,
  })
}

export function useDoctorEncounter(id?: string) {
  return useQuery({
    queryKey: DOCTOR_ENCOUNTER_KEY(id || ""),
    queryFn: () => fetchDoctorEncounterById(id!),
    enabled: !!id,
  })
}
