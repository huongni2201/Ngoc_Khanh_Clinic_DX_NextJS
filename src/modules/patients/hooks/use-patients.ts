import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  searchPatients,
  fetchPatientById,
  createPatient,
  updatePatient,
  fetchPatientCounters,
} from "../api"
import { CreatePatientDto, UpdatePatientDto, PatientFilterParams } from "../types"

export const PATIENTS_QUERY_KEY = ["patients"]
export const patientDetailQueryKey = (id: string) => ["patient", id]

export function usePatientCounters() {
  return useQuery({
    queryKey: [...PATIENTS_QUERY_KEY, "counters"],
    queryFn: fetchPatientCounters,
  })
}

export function useSearchPatients(query?: string, params?: PatientFilterParams) {
  return useQuery({
    queryKey: [...PATIENTS_QUERY_KEY, "search", query, params],
    queryFn: () => searchPatients(query, params),
  })
}

export function usePatient(id?: string) {
  return useQuery({
    queryKey: patientDetailQueryKey(id || ""),
    queryFn: () => fetchPatientById(id!),
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreatePatientDto) => createPatient(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY })
    },
  })
}

export function useUpdatePatient(patientId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: UpdatePatientDto) => {
      if (!patientId) {
        throw new Error("Không có mã định danh bệnh nhân để cập nhật")
      }
      return updatePatient(patientId, dto)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(patientDetailQueryKey(updated.id), updated)
      queryClient.setQueryData(patientDetailQueryKey(updated.patientCode), updated)
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY })
    },
  })
}
