import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchReceptionWorklist,
  fetchReceptionCounters,
  fetchClinicRooms,
  fetchEncounterById,
  checkInPatient,
  assignRoomAndDoctor,
} from "../api"
import {
  ReceptionFilterParams,
  PatientCheckInRequest,
  AssignRoomDto,
} from "../types"

export const RECEPTION_WORKLIST_KEY = ["reception", "worklist"]
export const RECEPTION_COUNTERS_KEY = ["reception", "counters"]
export const EXAMINATION_ROOMS_KEY = ["reception", "rooms"]
export const ENCOUNTER_DETAIL_KEY = (id: string) => ["reception", "encounter", id]

export function useReceptionWorklist(params?: ReceptionFilterParams) {
  return useQuery({
    queryKey: [...RECEPTION_WORKLIST_KEY, params],
    queryFn: () => fetchReceptionWorklist(params),
  })
}

export function useReceptionCounters() {
  return useQuery({
    queryKey: RECEPTION_COUNTERS_KEY,
    queryFn: () => fetchReceptionCounters(),
    refetchInterval: 30000, // Poll every 30s for live clinic queue
  })
}

export function useClinicRooms() {
  return useQuery({
    queryKey: EXAMINATION_ROOMS_KEY,
    queryFn: () => fetchClinicRooms(),
  })
}

export function useEncounter(id?: string) {
  return useQuery({
    queryKey: ENCOUNTER_DETAIL_KEY(id || ""),
    queryFn: () => fetchEncounterById(id!),
    enabled: !!id,
  })
}

export function usePatientCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: PatientCheckInRequest) => checkInPatient(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECEPTION_WORKLIST_KEY })
      queryClient.invalidateQueries({ queryKey: RECEPTION_COUNTERS_KEY })
    },
  })
}

export function useAssignRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: AssignRoomDto) => assignRoomAndDoctor(dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(ENCOUNTER_DETAIL_KEY(updated.id), updated)
      queryClient.invalidateQueries({ queryKey: RECEPTION_WORKLIST_KEY })
      queryClient.invalidateQueries({ queryKey: RECEPTION_COUNTERS_KEY })
    },
  })
}
