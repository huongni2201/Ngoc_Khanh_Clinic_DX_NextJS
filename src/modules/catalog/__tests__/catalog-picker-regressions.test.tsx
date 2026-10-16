import { afterEach, describe, expect, it, vi } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ALL_PERMISSIONS, renderWithClient } from "@/test-utils/render-with-client"
import { CatalogReferencePicker } from "../components/management/catalog-reference-picker"
import { CatalogParentFilter } from "../components/management/catalog-parent-filter"
import { permissionLabel } from "@/modules/accesscontrol/utils/permission-labels"

afterEach(() => vi.unstubAllGlobals())

const item = { id: "d1", code: "NOI", name: "Khoa Nội", active: true }

describe("catalog picker regressions", () => {
  it.each(["department", "specialty"] as const)("only fetches the permitted %s reference list", async (kind) => {
    const calls: string[] = []
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      calls.push(new URL(String(input)).pathname)
      return Response.json({ result: "OK", code: 200, data: { items: [], page: 1, size: 50, totalElements: 0, totalPages: 0 } })
    }))
    renderWithClient(<CatalogParentFilter kind={kind} onChange={vi.fn()} />, { permissions: ALL_PERMISSIONS })
    const expected = `/api/v1/catalog/management/${kind === "department" ? "departments" : "specialties"}`
    await waitFor(() => expect(calls).toContain(expected))
    expect(calls.every((url) => url === expected)).toBe(true)
  })

  it("keeps server search matches and forwards pagination", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderWithClient(<CatalogReferencePicker open items={[item]} searchValue="matched by server" onSearchChange={vi.fn()} onSelect={vi.fn()} currentPage={1} totalPages={2} onPageChange={onPageChange} />)
    expect(await screen.findByRole("button", { name: item.name })).toBeVisible()
    expect(screen.getByRole("button", { name: "Trang trước" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Trang sau" }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("offers retry without presenting an error as an empty result", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    renderWithClient(<CatalogReferencePicker open isError items={[]} onRetry={onRetry} onSelect={vi.fn()} />)
    expect(await screen.findByRole("alert")).toHaveTextContent("Không thể tải dữ liệu")
    expect(screen.queryByText("Chưa có dữ liệu")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Thử lại" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("clears a selected reference with the keyboard", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderWithClient(<CatalogReferencePicker items={[item]} selectedId={item.id} clearable onSelect={onSelect} />)
    screen.getByRole("button", { name: "Bỏ chọn" }).focus()
    await user.keyboard("{Enter}")
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it("shows all catalog permissions in Vietnamese on the role management screen", () => {
    for (const resource of ["DEPARTMENT", "ROOM", "SPECIALTY", "SERVICE", "MEDICINE"]) {
      for (const action of ["VIEW", "DETAIL_VIEW", "CREATE", "UPDATE", "DEACTIVATE", "REACTIVATE"]) {
        expect(permissionLabel({ code: `CATALOG_${resource}_${action}`, name: "English fallback" })).not.toBe("English fallback")
      }
    }
  })
})
