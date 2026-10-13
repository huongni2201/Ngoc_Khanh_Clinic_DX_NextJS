import type { AccountType } from "./types"

export const userAccountKeys = {
  all: ["user-accounts"] as const,
  assignableRoles: () => [...userAccountKeys.all, "assignable-roles"] as const,
  ownerCandidateSearches: () => [...userAccountKeys.all, "owner-candidates"] as const,
  ownerCandidates: (accountType: AccountType, keyword: string) =>
    [...userAccountKeys.ownerCandidateSearches(), accountType, keyword] as const,
  usernameAvailability: (username: string) =>
    [...userAccountKeys.all, "username-availability", username] as const,
}
