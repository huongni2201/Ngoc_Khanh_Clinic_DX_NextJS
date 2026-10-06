"use client"

import * as React from "react"
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthSessionSync, replaceSession, notifySessionChanged } from "@/modules/auth"
import { HttpError } from "@/shared/api/http-client"
import { ApiClientError } from "@/shared/api/api-client"
import { ApiUnavailableError } from "@/shared/api/api-unavailable"

export function shouldRetryQuery(failureCount: number, error: unknown) {
  if (error instanceof ApiUnavailableError) return false

  if (
    (error instanceof ApiClientError || error instanceof HttpError) &&
    error.status !== undefined &&
    ((error.status >= 400 && error.status < 500) || error.status === 501)
  ) {
    return false
  }

  return failureCount < 3
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () => {
      const client = new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.requiresAuth &&
              (error instanceof HttpError || error instanceof ApiClientError) &&
              error.status === 401) {
              void replaceSession(client, null).then(notifySessionChanged)
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: shouldRetryQuery,
          },
        },
      })
      return client
    }
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionSync />
      {children}
    </QueryClientProvider>
  )
}
