import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  changeAccountRole,
  createStaffMember,
  fetchAssignableRoles,
  fetchStaffMembers,
} from "../api/staff-members-api"
import { roleKeys, staffMemberKeys } from "../staff-member-query-keys"
import type {
  ChangeAccountRoleInput,
  CreateStaffMemberInput,
  StaffMemberFilterParams,
} from "../types/staff-member"

export function useStaffMembers(params: StaffMemberFilterParams | undefined, enabled = true) {
  return useQuery({
    queryKey: staffMemberKeys.list(params),
    queryFn: ({ signal }) => fetchStaffMembers(params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled,
  })
}

/** Roles an administrator may grant to a staff account, when creating it or changing its role. */
export function useAssignableRoles(enabled = true) {
  return useQuery({
    queryKey: roleKeys.assignable(),
    queryFn: ({ signal }) => fetchAssignableRoles(signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled,
  })
}

/** Creates a staff member and its account. Never retried: a retry could create a second person. */
export function useCreateStaffMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateStaffMemberInput) => createStaffMember(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: staffMemberKeys.lists() })
    },
  })
}

/** Lets the Change Role panel know a save is still in flight. */
export const CHANGE_ACCOUNT_ROLE_MUTATION_KEY = ["accounts", "change-role"] as const

/**
 * Changes the role of a staff account. Never retried: the account version moves on every change.
 * The staff list shows the new role, and the role list the new user counts. A rejected change also
 * reloads the staff list, so the panel opened again starts from the latest account version.
 */
export function useChangeAccountRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: CHANGE_ACCOUNT_ROLE_MUTATION_KEY,
    mutationFn: ({ accountId, input }: { accountId: string; input: ChangeAccountRoleInput }) =>
      changeAccountRole(accountId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffMemberKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: staffMemberKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: roleKeys.assignable() })
    },
  })
}
