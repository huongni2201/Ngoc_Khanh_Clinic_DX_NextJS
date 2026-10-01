import * as React from "react"
import { act, cleanup, renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useLogout } from "../hooks/use-auth"
import { csrf } from "./fixtures"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("useLogout", () => {
  it("clears cached patient data only after backend logout succeeds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(csrf())
      .mockResolvedValueOnce(new Response(null, { status: 204 })))
    const queryClient = new QueryClient()
    queryClient.setQueryData(["patients"], [{ id: "patient-1" }])
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useLogout(), { wrapper })

    await act(async () => {
      expect(await result.current.logout()).toBe(true)
    })

    expect(queryClient.getQueryData(["patients"])).toBeUndefined()
  })
})
