import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchOrganizations,
  createOrganization,
  fetchOrganizationById,
  updateOrganization,
  deactivateOrganization,
} from "../api"
import {
  OrganizationFilterParams,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "../types"

export const ORGANIZATIONS_QUERY_KEY = ["organizations"]
export const organizationDetailQueryKey = (id: string) => ["organization", id]

export function useOrganizations(params?: OrganizationFilterParams) {
  return useQuery({
    queryKey: [...ORGANIZATIONS_QUERY_KEY, params],
    queryFn: () => fetchOrganizations(params),
    retry: false,
  })
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationDetailQueryKey(id),
    queryFn: () => fetchOrganizationById(id),
    enabled: !!id,
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateOrganizationDto) => createOrganization(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY })
    },
  })
}

export function useUpdateOrganization(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: UpdateOrganizationDto) => updateOrganization(id, dto),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: organizationDetailQueryKey(id) }),
        queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY }),
      ])
    },
  })
}

export function useDeactivateOrganization(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deactivateOrganization(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: organizationDetailQueryKey(id) }),
        queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY }),
      ])
    },
  })
}

