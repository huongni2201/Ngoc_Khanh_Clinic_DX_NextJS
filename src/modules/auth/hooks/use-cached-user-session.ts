"use client"

import { useQuery } from "@tanstack/react-query"
import type { UserSession } from "../types"
import { SESSION_QUERY_KEY } from "../utils/session-cache"

/**
 * Reads the session that `AuthBoundary` already loaded, without fetching or validating it. Unlike
 * `useAuth` it has no side effects (it never clears cached business data), so feature pages can use
 * it to decide which actions to show. Display only: the backend checks every request.
 */
export function useCachedUserSession(): UserSession | null | undefined {
  return useQuery<UserSession | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => Promise.reject(new Error("The session is loaded by AuthBoundary")),
    enabled: false,
    retry: false,
  }).data
}
