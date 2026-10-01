"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/auth-api"
import { clearBusinessData, SESSION_QUERY_KEY } from "../utils/session-cache"
import type { UserSession } from "../types"
import { canAccessStaffWorkspace } from "../utils/staff-workspace-access"

export function useUserSession() {
  const client = useQueryClient()
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async ({ signal }) => {
      const session = await authApi.me(signal)
      signal.throwIfAborted()
      const previous = client.getQueryData<UserSession | null>(SESSION_QUERY_KEY)
      if (!session || previous?.userId !== session.userId || !canAccessStaffWorkspace(session)) {
        await clearBusinessData(client)
      }
      signal.throwIfAborted()
      return session
    },
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}
