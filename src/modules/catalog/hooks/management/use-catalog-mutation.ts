"use client"

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query"
import { notifySessionChanged, replaceSession } from "@/modules/accesscontrol"
import { ApiClientError } from "@/shared/api/api-client"
import { catalogManagementKeys } from "../../query-keys.management"

/** Keeps catalog writes consistent with session expiry and concurrent changes. */
export function useCatalogMutation<TData, TVariables>(options: UseMutationOptions<TData, Error, TVariables>) {
  const client = useQueryClient()
  return useMutation({
    ...options,
    meta: { ...options.meta, requiresAuth: true },
    retry: false,
    onError: async (...args) => {
      const [error] = args
      if (error instanceof ApiClientError && error.status === 401) {
        await replaceSession(client, null)
        notifySessionChanged()
      } else if (error instanceof ApiClientError && error.status === 409) {
        // Refresh server state without replacing the user's open form or resubmitting it.
        await client.invalidateQueries({ queryKey: catalogManagementKeys.all })
      }
      await options.onError?.(...args)
    },
  })
}
