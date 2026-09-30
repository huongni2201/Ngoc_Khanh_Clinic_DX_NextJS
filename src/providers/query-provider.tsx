"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApiClientError } from "@/shared/api/api-client"

export function shouldRetryQuery(failureCount: number, error: unknown) {
  if (
    error instanceof ApiClientError &&
    ((error.status >= 400 && error.status < 500) || error.status === 501)
  ) {
    return false
  }

  return failureCount < 3
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: shouldRetryQuery,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
