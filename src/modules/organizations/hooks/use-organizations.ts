import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchOrganizations,
  createOrganization,
  fetchOrganizationById,
  updateOrganization,
  deactivateOrganization,
} from "../api"
import { organizationKeys } from "../query-keys"
import {
  OrganizationFilterParams,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "../types"

export function useOrganizations(params?: OrganizationFilterParams) {
  return useQuery({
    queryKey: organizationKeys.list(params),
    queryFn: () => fetchOrganizations(params),
    retry: false,
  })
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => fetchOrganizationById(id),
    enabled: !!id,
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateOrganizationDto) => createOrganization(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
    },
  })
}

export function useUpdateOrganization(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: UpdateOrganizationDto) => updateOrganization(id, dto),
    onSuccess: async (organization) => {
      queryClient.setQueryData(organizationKeys.detail(id), organization)
      await queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
    },
  })
}

export function useDeactivateOrganization(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deactivateOrganization(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: organizationKeys.lists() }),
      ])
    },
  })
}

