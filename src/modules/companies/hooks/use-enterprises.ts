import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchEnterprises,
  createEnterprise,
  fetchEnterpriseById,
  updateEnterprise,
} from "../api"
import {
  EnterpriseFilterParams,
  CreateEnterpriseDto,
  UpdateEnterpriseDto,
} from "../types"

export const ENTERPRISES_QUERY_KEY = ["enterprises"]
export const enterpriseDetailQueryKey = (id: string) => ["enterprise", id]

export function useEnterprises(params?: EnterpriseFilterParams) {
  return useQuery({
    queryKey: [...ENTERPRISES_QUERY_KEY, params],
    queryFn: () => fetchEnterprises(params),
  })
}

export function useEnterprise(id: string) {
  return useQuery({
    queryKey: enterpriseDetailQueryKey(id),
    queryFn: () => fetchEnterpriseById(id),
    enabled: !!id,
  })
}

export function useCreateEnterprise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateEnterpriseDto) => createEnterprise(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTERPRISES_QUERY_KEY })
    },
  })
}

export function useUpdateEnterprise(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: UpdateEnterpriseDto) => updateEnterprise(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(enterpriseDetailQueryKey(id), updated)
      queryClient.setQueryData(enterpriseDetailQueryKey(updated.code), updated)
      queryClient.invalidateQueries({ queryKey: ENTERPRISES_QUERY_KEY })
    },
  })
}
