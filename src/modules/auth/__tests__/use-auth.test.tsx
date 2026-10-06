import * as React from "react"
import { act, cleanup, renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useLogout } from "../hooks/use-auth"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function render() {
  const queryClient = new QueryClient()
  queryClient.setQueryData(["patients"], [{ id: "patient-1" }])
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, ...renderHook(() => useLogout(), { wrapper }) }
}

describe("useLogout", () => {
  it("clears cached patient data only after backend logout succeeds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(null, { status: 204 })))
    const { queryClient, result } = render()

    await act(async () => {
      expect(await result.current.logout()).toBe(true)
    })

    expect(queryClient.getQueryData(["patients"])).toBeUndefined()
  })

  it.each([
    [403, "Yêu cầu bị từ chối do nguồn truy cập không hợp lệ. Vui lòng tải lại trang."],
    [503, "Hệ thống đăng nhập tạm thời không khả dụng. Vui lòng thử lại sau."],
  ])("explains a %s logout failure and keeps data", async (status, message) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(null, { status })))
    const { queryClient, result } = render()

    await act(async () => {
      expect(await result.current.logout()).toBe(false)
    })

    expect(result.current.logoutError).toBe(message)
    expect(queryClient.getQueryData(["patients"])).toEqual([{ id: "patient-1" }])
  })
})
