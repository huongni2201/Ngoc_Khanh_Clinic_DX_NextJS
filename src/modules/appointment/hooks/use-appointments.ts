import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  confirmAppointmentArrived,
  fetchAppointmentCounters,
} from "../api"
import {
  AppointmentFilterParams,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from "../types"

const APPOINTMENTS_QUERY_KEY = ["appointments"]
const APPOINTMENT_COUNTERS_QUERY_KEY = ["appointment-counters"]

export function useAppointments(params?: AppointmentFilterParams) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, params],
    queryFn: () => fetchAppointments(params),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

export function useAppointmentCounters() {
  return useQuery({
    queryKey: APPOINTMENT_COUNTERS_QUERY_KEY,
    queryFn: () => fetchAppointmentCounters(),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
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
    onSuccess: () => {
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
