import * as React from "react"
import { act, renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"
import { useAuth } from "../hooks/use-auth"

describe("useAuth", () => {
  it("clears cached patient data on logout", async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(["patients"], [{ id: "patient-1" }])
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.logout()
    })

    expect(queryClient.getQueryData(["patients"])).toBeUndefined()
  })
})
