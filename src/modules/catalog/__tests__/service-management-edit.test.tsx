import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"
import { renderWithClient } from "@/test-utils/render-with-client"
import { ServiceManagementPage } from "../pages/management/service-management-page"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/admin/catalog/services",
  useSearchParams: () => new URLSearchParams(),
}))

afterEach(() => vi.unstubAllGlobals())

it("loads service detail before editing and preserves its instruction and version", async () => {
  const user = userEvent.setup()
  const row = { id: "service-1", code: "KHAM", name: "Khám nội", serviceType: "CONSULTATION",
    performingDepartmentId: "department-1", performingDepartmentName: "Khoa khám",
    specialtyId: null, specialtyName: null, unitPrice: 150000.5, active: true,
    rowVersion: 2, createdAt: null, updatedAt: null }
  const requests: { path: string; method: string; body?: string }[] = []
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = new URL(String(input)).pathname
    const method = init?.method ?? "GET"
    requests.push({ path, method, body: init?.body as string | undefined })
    const data = path.endsWith("/services/service-1")
      ? { ...row, preparationInstruction: "Giữ hướng dẫn trước khi khám" }
      : { items: path.endsWith("/services") ? [row] : [], page: 1, size: 10,
          totalElements: path.endsWith("/services") ? 1 : 0, totalPages: 1 }
    return new Response(JSON.stringify({ result: "OK", code: 200, data }), {
      status: 200, headers: { "Content-Type": "application/json" },
    })
  }))
  renderWithClient(<ServiceManagementPage />, { permissions: [
    "CATALOG_SERVICE_VIEW", "CATALOG_SERVICE_DETAIL_VIEW", "CATALOG_SERVICE_UPDATE",
    "CATALOG_DEPARTMENT_VIEW", "CATALOG_SPECIALTY_VIEW",
  ] })
  await user.click(await screen.findByRole("button", { name: "Sửa Khám nội" }))
  expect(await screen.findByLabelText(/^Hướng dẫn chuẩn bị/)).toHaveValue("Giữ hướng dẫn trước khi khám")
  expect(screen.getByLabelText(/^Tên dịch vụ/)).toHaveValue("Khám nội")
  await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
  await waitFor(() => expect(requests.filter((r) => r.method === "PUT")).toHaveLength(1))
  const update = requests.find((r) => r.method === "PUT")
  expect(JSON.parse(update?.body ?? "{}")).toMatchObject({
    preparationInstruction: "Giữ hướng dẫn trước khi khám", rowVersion: 2,
  })
})
