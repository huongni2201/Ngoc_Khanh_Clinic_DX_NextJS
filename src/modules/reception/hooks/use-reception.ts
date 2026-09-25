import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchReceptionWorklist,
  fetchReceptionCounters,
  fetchExaminationRooms,
  fetchEncounterById,
  receivePatient,
  assignRoomAndDoctor,
  fetchInvoiceByEncounter,
  processPayment,
} from "../api"
import {
  ReceptionFilterParams,
  ReceivePatientDto,
  AssignRoomDto,
  ProcessPaymentDto,
} from "../types"

export const RECEPTION_WORKLIST_KEY = ["reception", "worklist"]
export const RECEPTION_COUNTERS_KEY = ["reception", "counters"]
export const EXAMINATION_ROOMS_KEY = ["reception", "rooms"]
export const ENCOUNTER_DETAIL_KEY = (id: string) => ["reception", "encounter", id]
export const INVOICE_DETAIL_KEY = (id: string) => ["reception", "invoice", id]

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

export function useExaminationRooms() {
  return useQuery({
    queryKey: EXAMINATION_ROOMS_KEY,
    queryFn: () => fetchExaminationRooms(),
  })
}

export function useEncounter(id?: string) {
  return useQuery({
    queryKey: ENCOUNTER_DETAIL_KEY(id || ""),
    queryFn: () => fetchEncounterById(id!),
    enabled: !!id,
  })
}

export function useReceivePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: ReceivePatientDto) => receivePatient(dto),
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

export function useInvoice(encounterId?: string) {
  return useQuery({
    queryKey: INVOICE_DETAIL_KEY(encounterId || ""),
    queryFn: () => fetchInvoiceByEncounter(encounterId!),
    enabled: !!encounterId,
  })
}

export function useProcessPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: ProcessPaymentDto) => processPayment(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: INVOICE_DETAIL_KEY(variables.encounterId),
      })
      queryClient.invalidateQueries({ queryKey: RECEPTION_WORKLIST_KEY })
      queryClient.invalidateQueries({ queryKey: RECEPTION_COUNTERS_KEY })
    },
  })
}
