import { act, renderHook, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ALL_PERMISSIONS, renderWithClient } from "@/test-utils/render-with-client"
import { DepartmentManagementPage } from "../pages/management/department-management-page"
import { RoomManagementPage } from "../pages/management/room-management-page"
import { SpecialtyManagementPage } from "../pages/management/specialty-management-page"
import { ServiceManagementPage } from "../pages/management/service-management-page"
import { MedicineManagementPage } from "../pages/management/medicine-management-page"
import {
  useUpdateDepartment,
  useCreateSpecialty,
  useUpdateSpecialty,
} from "../hooks/management/use-catalog-management"
import { catalogManagementKeys } from "../query-keys.management"

const mockReplace = vi.fn()
let queryString = ""

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/admin/catalog/departments",
  useSearchParams: () => new URLSearchParams(queryString),
}))

afterEach(() => {
  queryString = ""
  mockReplace.mockClear()
  vi.unstubAllGlobals()
})

const dept = {
  id: "d-1",
  code: "D1",
  name: "Khoa cũ",
  departmentType: "CLINICAL",
  active: true,
  rowVersion: 0,
  createdAt: null,
  updatedAt: null,
}

function ok(data: unknown) {
  return new Response(JSON.stringify({ result: "OK", code: 200, data }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

describe("FE-01: Sheet chi tiết đồng bộ sau khi sửa", () => {
  it("cập nhật tên và version trong Sheet sau khi sửa và gửi version mới khi ngừng sử dụng", async () => {
    const user = userEvent.setup()
    let row = { ...dept }
    const deletes: string[] = []

    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input))
      if (init?.method === "PUT") {
        row = { ...row, ...JSON.parse(String(init.body)), rowVersion: 1 }
        return ok(row)
      }
      if (init?.method === "DELETE") {
        deletes.push(url.search)
        return new Response(null, { status: 204 })
      }
      return ok(url.pathname.endsWith("/d-1") ? row : { items: [row], page: 1, size: 10, totalElements: 1, totalPages: 1 })
    }))

    renderWithClient(<DepartmentManagementPage />, { permissions: ALL_PERMISSIONS })
    await user.click(await screen.findByRole("button", { name: "Xem Khoa cũ" }))
    await user.click(screen.getByRole("button", { name: /^Sửa$/ }))

    const input = screen.getByLabelText(/^Tên khoa/)
    await user.clear(input)
    await user.type(input, "Khoa mới")
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }))

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Sửa thông tin khoa" })).not.toBeInTheDocument())

    // Sheet must display updated title "Khoa mới"
    const sheet = screen.getByRole("dialog", { name: "Khoa mới" })
    expect(within(sheet).getByText("Khoa mới", { selector: "p" })).toBeInTheDocument()

    // Deactivating from Sheet sends the updated rowVersion=1
    await user.click(within(sheet).getByRole("button", { name: "Ngừng sử dụng" }))
    const confirm = screen.getByRole("dialog", { name: /Ngừng sử dụng/ })
    await user.click(within(confirm).getByRole("button", { name: "Ngừng sử dụng" }))

    await waitFor(() => expect(deletes).toEqual(["?rowVersion=1"]))
  })
})

describe("FE-02: Bộ lọc trạng thái trên cả 5 màn hình", () => {
  it.each([
    ["departments", DepartmentManagementPage],
    ["rooms", RoomManagementPage],
    ["specialties", SpecialtyManagementPage],
    ["services", ServiceManagementPage],
    ["medicines", MedicineManagementPage],
  ] as const)("màn hình %s có combobox trạng thái", async (_name, Page) => {
    vi.stubGlobal("fetch", vi.fn(async () => ok({ items: [], page: 1, size: 10, totalElements: 0, totalPages: 0 })))
    renderWithClient(<Page />, { permissions: ALL_PERMISSIONS })
    await screen.findByText(/Chưa có .* nào/)
    expect(screen.getByRole("combobox", { name: /trạng thái/i })).toBeInTheDocument()
  })
})

describe("FE-03: Invalidate picker cache khi thay đổi danh mục", () => {
  it("làm mới department picker cache khi cập nhật khoa", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ok({ ...dept, name: "Khoa mới", rowVersion: 1 })))
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: 300000, retry: false } } })
    const key = catalogManagementKeys.departmentPicker({ active: true, page: 1, size: 10 })
    client.setQueryData(key, { items: [dept] })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useUpdateDepartment(dept.id), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ name: "Khoa mới", departmentType: "CLINICAL", rowVersion: 0 })
    })

    expect(client.getQueryState(key)?.isInvalidated).toBe(true)
  })

  it("làm mới specialty picker cache khi tạo chuyên khoa", async () => {
    const specialty = { id: "s-1", code: "S1", name: "Chuyên khoa mới", active: true, rowVersion: 0, createdAt: null, updatedAt: null }
    vi.stubGlobal("fetch", vi.fn(async () => ok(specialty)))
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: 300000, retry: false } } })
    const key = catalogManagementKeys.specialtyPicker({ active: true, page: 1, size: 10 })
    client.setQueryData(key, { items: [] })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCreateSpecialty(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ code: "S1", name: specialty.name })
    })

    expect(client.getQueryState(key)?.isInvalidated).toBe(true)
  })

  it("làm mới specialty picker cache khi cập nhật chuyên khoa", async () => {
    const specialty = { id: "s-1", code: "S1", name: "Chuyên khoa mới", active: true, rowVersion: 1, createdAt: null, updatedAt: null }
    vi.stubGlobal("fetch", vi.fn(async () => ok(specialty)))
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: 300000, retry: false } } })
    const key = catalogManagementKeys.specialtyPicker({ active: true, page: 1, size: 10 })
    client.setQueryData(key, { items: [{ id: "s-1", code: "S1", name: "Chuyên khoa cũ" }] })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useUpdateSpecialty("s-1"), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ name: "Chuyên khoa mới", rowVersion: 0 })
    })

    expect(client.getQueryState(key)?.isInvalidated).toBe(true)
  })
})

describe("FE-04: Đưa về trang hợp lệ khi số trang giảm", () => {
  it("điều hướng về trang cuối hợp lệ khi page > totalPages", async () => {
    queryString = "page=2&q=Khoa"
    vi.stubGlobal("fetch", vi.fn(async () => ok({ items: [], page: 2, size: 10, totalElements: 10, totalPages: 1 })))

    renderWithClient(<DepartmentManagementPage />, { permissions: ALL_PERMISSIONS })

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining("page=1"))
    })
  })
})
