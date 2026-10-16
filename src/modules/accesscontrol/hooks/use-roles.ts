import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createRole,
  fetchAllRoles,
  fetchPermissionCatalog,
  fetchRolePermissions,
  updateRole,
  updateRolePermissions,
} from "../api/roles-api"
import { permissionKeys, roleKeys } from "../staff-member-query-keys"
import type {
  CreateRoleInput,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
} from "../types/role"

/**
 * Every role, loaded page by page. Kept under `roleKeys.lists()`, so creating, updating a role or
 * saving its permissions refreshes it.
 */
export function useAllRoles(enabled = true) {
  return useQuery({
    queryKey: roleKeys.allRoles(),
    queryFn: ({ signal }) => fetchAllRoles(signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled,
  })
}

/** Creates a role. Never retried: a retry could report the role it just created as a duplicate. */
export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRoleInput) => createRole(input),
    onSuccess: async () => {
      // Lists and the assignable roles of the staff form both change.
      await queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

export function useUpdateRole(roleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateRoleInput) => updateRole(roleId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

/** The predefined permissions; they only change with a backend migration. */
export function usePermissionCatalog(enabled = true) {
  return useQuery({
    queryKey: permissionKeys.catalog(),
    queryFn: ({ signal }) => fetchPermissionCatalog(signal),
    meta: { requiresAuth: true },
    retry: false,
    staleTime: Infinity,
    enabled,
  })
}

export function useRolePermissions(roleId: string | undefined) {
  return useQuery({
    queryKey: roleKeys.permissions(roleId ?? ""),
    queryFn: ({ signal }) => fetchRolePermissions(roleId as string, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(roleId),
  })
}

/** Saves the pending changes of one role. Never retried: the row version moves on every save. */
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, input }: { roleId: string; input: UpdateRolePermissionsInput }) =>
      updateRolePermissions(roleId, input),
    onSuccess: (saved) => {
      queryClient.setQueryData(roleKeys.permissions(saved.roleId), saved)
      // Permission counts on the role list and the role selector change. Not awaited: the save is
      // done, and reading every page of roles must not keep the screen locked.
      void queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
  })
}
