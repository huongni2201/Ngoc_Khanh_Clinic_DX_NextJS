import { describe, expect, it, vi, afterEach } from "vitest"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ALL_PERMISSIONS, renderWithClient } from "@/test-utils/render-with-client"
import { CatalogListLayout } from "../components/management/catalog-list-layout"
import { CatalogDetailSheet } from "../components/management/catalog-detail-sheet"
import { CatalogReferencePicker } from "../components/management/catalog-reference-picker"
import { DepartmentFormDialog } from "../components/management/forms/department-form-dialog"
import { DepartmentManagementPage } from "../pages/management/department-management-page"
import { RoomManagementPage } from "../pages/management/room-management-page"
import { SpecialtyManagementPage } from "../pages/management/specialty-management-page"
import { ServiceManagementPage } from "../pages/management/service-management-page"
import { MedicineManagementPage } from "../pages/management/medicine-management-page"

const mockReplace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/admin/catalog/departments",
  useSearchParams: () => new URLSearchParams(),
}))

afterEach(() => {
  mockReplace.mockClear()
  vi.unstubAllGlobals()
})

function ok(data: unknown) {
  return new Response(JSON.stringify({ result: "OK", code: 200, data }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

describe("UI/UX Consistency across 5 catalogs", () => {
  describe("CatalogListLayout streamlined header and toolbar", () => {
    it("renders page header, search field, count indicator, and table content without redundant tabs", () => {
      renderWithClient(
        <CatalogListLayout
          breadcrumbs={[{ label: "Quản lý danh mục", href: "/admin/catalog/departments" }, { label: "Khoa" }]}
          title="Khoa"
          description="Quản lý khoa"
          searchValue=""
          searchPlaceholder="Tìm kiếm..."
          onSearchChange={() => {}}
          totalItems={42}
          entityLabel="khoa"
          isLoading={false}
          isError={false}
          error={null}
          currentPage={1}
          pageSize={10}
          totalPages={5}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          onRetry={() => {}}
        >
          <div>Table content</div>
        </CatalogListLayout>,
        { permissions: ALL_PERMISSIONS }
      )

      // Redundant sub-navigation tabs have been removed
      expect(screen.queryByRole("navigation", { name: "Danh mục phòng khám" })).not.toBeInTheDocument()

      // Header, search field and count are present
      expect(screen.getByRole("heading", { name: "Khoa" })).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Tìm kiếm...")).toBeInTheDocument()
      expect(screen.getByText(/Tổng cộng:/)).toHaveTextContent("42")
      expect(screen.getByText("Table content")).toBeInTheDocument()
    })

    it("renders filter toolbar card with labels, search input, filter slot, and reset button unified with /doctor", () => {
      const onReset = vi.fn()
      renderWithClient(
        <CatalogListLayout
          breadcrumbs={[{ label: "Quản lý danh mục", href: "/admin/catalog/departments" }, { label: "Khoa" }]}
          title="Khoa"
          description="Quản lý khoa"
          searchValue="Cấp cứu"
          searchPlaceholder="Tìm kiếm..."
          onSearchChange={() => {}}
          hasActiveFilters={true}
          onResetFilters={onReset}
          filterSlot={<div>Custom filter</div>}
          totalItems={5}
          entityLabel="khoa"
          isLoading={false}
          isError={false}
          error={null}
          currentPage={1}
          pageSize={10}
          totalPages={1}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          onRetry={() => {}}
        >
          <div>Table content</div>
        </CatalogListLayout>,
        { permissions: ALL_PERMISSIONS }
      )

      const filterSection = screen.getByRole("search", { name: "Bộ lọc khoa" })
      expect(filterSection).toBeInTheDocument()
      expect(within(filterSection).getByText("Tìm kiếm")).toBeInTheDocument()
      expect(within(filterSection).getByText("Custom filter")).toBeInTheDocument()
      const resetBtn = within(filterSection).getByRole("button", { name: "Xóa lọc" })
      expect(resetBtn).not.toBeDisabled()
    })
  })

  describe("CatalogDetailSheet with InfoList inheritance", () => {
    it("renders detail attributes using semantic dl/dt/dd with monospace support and audit timestamps", () => {
      renderWithClient(
        <CatalogDetailSheet
          open
          onOpenChange={() => {}}
          title="Khoa Cấp cứu"
          description="Mã: CC"
          active={true}
          rows={[
            { label: "Mã khoa", value: "CC", mono: true },
            { label: "Tên khoa", value: "Khoa Cấp cứu" },
            { label: "Mô tả", value: null },
          ]}
          createdAt="2026-01-01T08:00:00Z"
          updatedAt="2026-01-02T10:30:00Z"
        />
      )

      const sheet = screen.getByRole("dialog", { name: "Khoa Cấp cứu" })
      expect(sheet).toBeInTheDocument()

      // Semantic info-list exists
      const lists = sheet.querySelectorAll('[data-slot="info-list"]')
      expect(lists.length).toBe(2) // mainItems + auditItems

      // Check dt and dd
      expect(within(sheet).getByText("Mã khoa")).toBeInTheDocument()
      const codeValue = within(sheet).getByText("CC", { selector: "p" })
      expect(codeValue.closest("dd")).toHaveClass("font-mono")

      // Empty field fallback
      expect(within(sheet).getByText("—", { selector: "p" })).toBeInTheDocument()

      // Status pill displayed with title
      expect(within(sheet).getByText("Đang sử dụng")).toBeInTheDocument()

      // Audit fields
      expect(within(sheet).getByText("Ngày tạo")).toBeInTheDocument()
      expect(within(sheet).getByText("Cập nhật lần cuối")).toBeInTheDocument()
    })
  })

  describe("Form Dialogs with FormTextField inheritance", () => {
    it("renders form fields with standard label, required markers, and error wiring", async () => {
      const user = userEvent.setup()
      renderWithClient(
        <DepartmentFormDialog
          open
          onOpenChange={() => {}}
        />,
        { permissions: ALL_PERMISSIONS }
      )

      const dialog = screen.getByRole("dialog", { name: "Thêm khoa mới" })
      expect(dialog).toBeInTheDocument()

      // Both fields with required indicators
      expect(within(dialog).getByLabelText(/^Mã khoa/)).toBeInTheDocument()
      expect(within(dialog).getByLabelText(/^Tên khoa/)).toBeInTheDocument()

      // Submit empty to trigger validation
      await user.click(within(dialog).getByRole("button", { name: "Thêm khoa" }))

      expect(await within(dialog).findByText("Mã bắt buộc")).toBeInTheDocument()
      expect(within(dialog).getByText("Tên bắt buộc")).toBeInTheDocument()
    })
  })

  describe("Empty state presentation across all 5 pages", () => {
    it.each([
      ["Khoa", DepartmentManagementPage, "Chưa có khoa nào"],
      ["Phòng", RoomManagementPage, "Chưa có phòng nào"],
      ["Chuyên khoa", SpecialtyManagementPage, "Chưa có chuyên khoa nào"],
      ["Dịch vụ", ServiceManagementPage, "Chưa có dịch vụ nào"],
      ["Thuốc", MedicineManagementPage, "Chưa có thuốc nào"],
    ] as const)("page %s renders polished empty state with icon and CTA", async (_name, Page, emptyText) => {
      vi.stubGlobal("fetch", vi.fn(async () => ok({ items: [], page: 1, size: 10, totalElements: 0, totalPages: 0 })))

      renderWithClient(<Page />, { permissions: ALL_PERMISSIONS })

      expect(await screen.findByText(emptyText)).toBeInTheDocument()
      const table = screen.getByRole("table")
      expect(within(table).getByRole("button", { name: new RegExp(`Thêm ${_name.toLowerCase()}`, "i") })).toBeInTheDocument()
    })
  })

  describe("Searchable Option Dropdown (CatalogReferencePicker)", () => {
    it("renders as an option dropdown, filters with search input, and selects options without opening a full dialog", async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      const sampleItems = [
        { id: "dept-1", code: "KB", name: "Khoa Khám bệnh", active: true },
        { id: "dept-2", code: "CC", name: "Khoa Cấp cứu", active: true },
        { id: "dept-3", code: "XN", name: "Khoa Xét nghiệm", active: false },
      ]

      renderWithClient(
        <CatalogReferencePicker
          id="test-picker"
          title="Khoa"
          placeholder="Chọn khoa..."
          items={sampleItems}
          onSelect={onSelect}
        />,
        { permissions: ALL_PERMISSIONS }
      )

      // Trigger button displays placeholder
      const trigger = screen.getByRole("button", { name: "Chọn khoa..." })
      expect(trigger).toBeInTheDocument()

      // Click to open dropdown
      await user.click(trigger)

      // Search input is focused inside the popover
      const searchInput = screen.getByPlaceholderText("Tìm khoa...")
      expect(searchInput).toBeInTheDocument()

      // Options display name only without code
      expect(screen.getByText("Khoa Khám bệnh")).toBeInTheDocument()
      expect(screen.getByText("Khoa Cấp cứu")).toBeInTheDocument()
      expect(screen.queryByText("KB")).not.toBeInTheDocument()
      expect(screen.queryByText("CC")).not.toBeInTheDocument()

      // Type in search box to filter
      await user.type(searchInput, "Cấp cứu")
      expect(screen.queryByText("Khoa Khám bệnh")).not.toBeInTheDocument()
      expect(screen.getByText("Khoa Cấp cứu")).toBeInTheDocument()

      // Click option to select
      await user.click(screen.getByText("Khoa Cấp cứu"))
      expect(onSelect).toHaveBeenCalledWith(sampleItems[1])
    })
  })
})
