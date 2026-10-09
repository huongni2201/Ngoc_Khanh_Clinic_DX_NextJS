import type { Encounter } from "../types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchReceptionWorklist, fetchReceptionCounters, fetchClinicRooms } from "../api"
import { checkInPatient, assignRoomAndDoctor } from "@/modules/encounter"
import { ReceptionFilterParams } from "../types"
import { PatientCheckInRequest, AssignRoomDto } from "@/modules/encounter"

const RECEPTION_WORKLIST_KEY = ["reception", "worklist"]
const RECEPTION_COUNTERS_KEY = ["reception", "counters"]
const EXAMINATION_ROOMS_KEY = ["reception", "rooms"]

export function useReceptionWorklist(params?: ReceptionFilterParams) {
  return useQuery({
    queryKey: [...RECEPTION_WORKLIST_KEY, params],
    queryFn: () => fetchReceptionWorklist(params),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

export function useReceptionCounters() {
  return useQuery({
    queryKey: RECEPTION_COUNTERS_KEY,
    queryFn: () => fetchReceptionCounters(),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

export function useClinicRooms() {
  return useQuery({
    queryKey: EXAMINATION_ROOMS_KEY,
    queryFn: () => fetchClinicRooms(),
  })
}

export function usePatientCheckIn() {
  const queryClient = useQueryClient()

  return useMutation<Encounter, Error, PatientCheckInRequest>({
    mutationFn: (dto: PatientCheckInRequest) => checkInPatient(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECEPTION_WORKLIST_KEY })
      queryClient.invalidateQueries({ queryKey: RECEPTION_COUNTERS_KEY })
    },
  })
}

export function useAssignRoom() {
  const queryClient = useQueryClient()

  return useMutation<Encounter, Error, AssignRoomDto>({
    mutationFn: (dto: AssignRoomDto) => assignRoomAndDoctor(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECEPTION_WORKLIST_KEY })
      queryClient.invalidateQueries({ queryKey: RECEPTION_COUNTERS_KEY })
    },
  })
}
