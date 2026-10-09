import type { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { apiClient } from "@/shared/api/api-client"
import { useClinicalServices, catalogKeys } from "@/modules/catalog"

vi.unmock("@/modules/catalog/api/services")
afterEach(() => vi.restoreAllMocks())

it("loads services only when enabled and retains the existing cache entry", async () => {
  const service = { id: "s-1", code: "S1", name: "Khám", serviceType: "GENERAL", unitPrice: 90_000 }
  const get = vi.spyOn(apiClient, "get").mockResolvedValue({ result: "OK", code: 200,
    data: { items: [{ ...service, active: true }], page: 1, size: 100, totalElements: 1, totalPages: 1 },
  })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const { result, rerender, unmount } = renderHook(
    ({ enabled }) => useClinicalServices(enabled), { wrapper, initialProps: { enabled: false } }
  )
  expect(get).not.toHaveBeenCalled()
  rerender({ enabled: true })
  await waitFor(() => expect(result.current.data).toEqual([service]))
  expect(catalogKeys.clinicalServices()).toEqual(["health-examinations", "clinical-services"])
  expect(client.getQueryData(["health-examinations", "clinical-services"])).toEqual([service])
  unmount()
  client.clear()
})
