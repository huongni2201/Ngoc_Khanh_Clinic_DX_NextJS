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
    queryFn: ({ signal }) => fetchOrganizations(params, signal),
    meta: { requiresAuth: true },
    retry: false,
  })
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: ({ signal }) => fetchOrganizationById(id, signal),
    meta: { requiresAuth: true },
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

/**
 * Reads the latest version after a 409. It replaces the cached detail and refreshes the lists, and
 * never resubmits the user's edit.
 */
export function useReloadOrganization(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => fetchOrganizationById(id),
    onSuccess: async (organization) => {
      queryClient.setQueryData(organizationKeys.detail(id), organization)
      await queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
    },
  })
}

export function useDeactivateOrganization(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rowVersion: number) => deactivateOrganization(id, rowVersion),
    onSuccess: async () => {
      // The backend reports an INACTIVE organization as 404, so the detail must not be refetched.
      queryClient.removeQueries({ queryKey: organizationKeys.detail(id) })
      await queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
    },
  })
}
