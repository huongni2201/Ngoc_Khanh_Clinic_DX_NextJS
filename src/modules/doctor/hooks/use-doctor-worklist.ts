import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchDoctorWorklist,
  fetchDoctorCounters,
  fetchDoctorEncounterById,
  fetchDoctorNextAction,
  startDoctorEncounter,
} from "../api"
import { DoctorFilterParams } from "../types"

export const DOCTOR_WORKLIST_KEY = ["doctor", "worklist"]
export const DOCTOR_COUNTERS_KEY = ["doctor", "counters"]
export const DOCTOR_ENCOUNTER_KEY = (id: string) => ["doctor", "encounter", id]
export const DOCTOR_NEXT_ACTION_KEY = (doctor?: string) => ["doctor", "next-action", doctor]

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

export function useDoctorNextAction(doctor?: string) {
  return useQuery({
    queryKey: DOCTOR_NEXT_ACTION_KEY(doctor),
    queryFn: () => fetchDoctorNextAction(doctor),
  })
}

export function useStartDoctorEncounter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => startDoctorEncounter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTOR_WORKLIST_KEY })
      queryClient.invalidateQueries({ queryKey: DOCTOR_COUNTERS_KEY })
      queryClient.invalidateQueries({ queryKey: ["doctor", "next-action"] })
    },
  })
}
