import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createStaffMember, fetchAssignableRoles, fetchStaffMembers } from "../api/staff-members-api"
import { roleKeys, staffMemberKeys } from "../staff-member-query-keys"
import type { CreateStaffMemberInput, StaffMemberFilterParams } from "../types/staff-member"

export function useStaffMembers(params: StaffMemberFilterParams | undefined, enabled = true) {
  return useQuery({
    queryKey: staffMemberKeys.list(params),
    queryFn: ({ signal }) => fetchStaffMembers(params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled,
  })
}

/** Roles an administrator may grant when creating a staff member. */
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
