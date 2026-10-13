import type { AccountType } from "./types"

export const userAccountKeys = {
  all: ["user-accounts"] as const,
  assignableRoles: () => [...userAccountKeys.all, "assignable-roles"] as const,
  eligibleOwnerSearches: () => [...userAccountKeys.all, "eligible-owners"] as const,
  eligibleOwners: (accountType: AccountType, keyword: string) =>
    [...userAccountKeys.eligibleOwnerSearches(), accountType, keyword] as const,
  usernameAvailability: (username: string) =>
    [...userAccountKeys.all, "username-availability", username] as const,
}
