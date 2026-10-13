"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  checkUsernameAvailability,
  createUserAccount,
  fetchAssignableRoles,
  searchEligibleOwners,
} from "../api/user-accounts-api"
import { userAccountKeys } from "../query-keys"
import type { AccountType, CreateUserAccountInput } from "../types"

export function useAssignableRoles(enabled = true) {
  return useQuery({
    queryKey: userAccountKeys.assignableRoles(),
    queryFn: ({ signal }) => fetchAssignableRoles(signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled,
  })
}

/** Runs only for a submitted keyword (Search button or Enter), never while typing. */
export function useEligibleOwners(accountType: AccountType, keyword: string | null) {
  return useQuery({
    queryKey: userAccountKeys.eligibleOwners(accountType, keyword ?? ""),
    queryFn: ({ signal }) => searchEligibleOwners(accountType, keyword ?? "", signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: keyword !== null,
    // Another Administrator may link a profile at any time; always ask again.
    staleTime: 0,
    gcTime: 0,
  })
}

/** Advisory only: creation checks the username again. */
export function useUsernameAvailability(username: string | null) {
  return useQuery({
    queryKey: userAccountKeys.usernameAvailability(username ?? ""),
    queryFn: ({ signal }) => checkUsernameAvailability(username ?? "", signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: username !== null,
    staleTime: 0,
  })
}

/**
 * The request carries the temporary password, so the mutation is never retried and its variables
 * are dropped from the cache as soon as it settles.
 */
export function useCreateUserAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserAccountInput) => createUserAccount(input),
    retry: false,
    gcTime: 0,
    // The owner and the username are taken now: drop the searches and checks that said otherwise.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userAccountKeys.all })
    },
  })
}
