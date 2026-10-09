import type { DoctorEncounter } from "../types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchDoctorWorklist, fetchDoctorCounters, fetchDoctorNextAction } from "../api"
import { startDoctorEncounter } from "@/modules/encounter"
import { DoctorFilterParams } from "../types"

const DOCTOR_WORKLIST_KEY = ["doctor", "worklist"]
const DOCTOR_COUNTERS_KEY = ["doctor", "counters"]
const DOCTOR_NEXT_ACTION_KEY = (doctor?: string) => ["doctor", "next-action", doctor]

export function useDoctorWorklist(params?: DoctorFilterParams) {
  return useQuery({
    queryKey: [...DOCTOR_WORKLIST_KEY, params],
    queryFn: () => fetchDoctorWorklist(params),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}
export function useDoctorCounters() {
  return useQuery({
    queryKey: DOCTOR_COUNTERS_KEY,
    queryFn: () => fetchDoctorCounters(),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

export function useDoctorNextAction(doctor?: string) {
  return useQuery({
    queryKey: DOCTOR_NEXT_ACTION_KEY(doctor),
    queryFn: () => fetchDoctorNextAction(doctor),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

export function useStartDoctorEncounter() {
  const queryClient = useQueryClient()
  return useMutation<DoctorEncounter | null, Error, string>({
    mutationFn: (id: string) => startDoctorEncounter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTOR_WORKLIST_KEY })
      queryClient.invalidateQueries({ queryKey: DOCTOR_COUNTERS_KEY })
      queryClient.invalidateQueries({ queryKey: ["doctor", "next-action"] })
    },
  })
}
