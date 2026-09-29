"use client"

import * as React from "react"
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthSessionSync, replaceSession, notifySessionChanged } from "@/modules/auth"
import { HttpError } from "@/shared/api/http-client"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () => {
      const client = new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.requiresAuth && error instanceof HttpError && error.status === 401) {
              void replaceSession(client, null).then(notifySessionChanged)
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
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
