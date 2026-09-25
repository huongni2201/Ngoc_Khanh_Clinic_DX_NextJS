import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchAppointments,
  fetchAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  confirmAppointmentArrived,
  confirmAppointmentCheckIn,
  fetchAppointmentCounters,
} from "../api"
import {
  AppointmentFilterParams,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from "../types"

export const APPOINTMENTS_QUERY_KEY = ["appointments"]
export const APPOINTMENT_COUNTERS_QUERY_KEY = ["appointment-counters"]
export const appointmentDetailQueryKey = (id: string) => ["appointment", id]

export function useAppointments(params?: AppointmentFilterParams) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, params],
    queryFn: () => fetchAppointments(params),
  })
}

export function useAppointmentCounters() {
  return useQuery({
    queryKey: APPOINTMENT_COUNTERS_QUERY_KEY,
    queryFn: () => fetchAppointmentCounters(),
  })
}

export function useAppointment(id?: string) {
  return useQuery({
    queryKey: appointmentDetailQueryKey(id || ""),
    queryFn: () => fetchAppointmentById(id!),
    enabled: !!id,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateAppointmentDto) => createAppointment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_COUNTERS_QUERY_KEY })
    },
  })
}

export function useUpdateAppointment(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: UpdateAppointmentDto) => updateAppointment(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(appointmentDetailQueryKey(id), updated)
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_COUNTERS_QUERY_KEY })
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_COUNTERS_QUERY_KEY })
    },
  })
}

export function useConfirmArrived() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => confirmAppointmentArrived(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_COUNTERS_QUERY_KEY })
    },
  })
}

export function useCheckInAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      encounterCode,
    }: {
      id: string
      encounterCode?: string
    }) => confirmAppointmentCheckIn(id, encounterCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_COUNTERS_QUERY_KEY })
    },
  })
}
