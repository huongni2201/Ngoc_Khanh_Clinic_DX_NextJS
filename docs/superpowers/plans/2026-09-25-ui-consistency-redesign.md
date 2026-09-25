# Ngọc Khánh Clinic UI Consistency Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize every currently implemented Ngọc Khánh Clinic screen into one calm, information-dense, accessible healthcare operations interface without changing business behavior.

**Architecture:** Establish semantic tokens and primitive defaults first, then one shared page-header contract and a consistent application shell. Migrate each domain module onto those foundations while keeping query, form, URL, API, and domain ownership unchanged; finish with repository-wide icon/style audits and full verification.

**Tech Stack:** Next.js 16.3.5 App Router, React 19.2.8, TypeScript 5, Tailwind CSS 4, shadcn/ui Mira, Base UI, Hugeicons, TanStack Query, React Hook Form, Zod, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-25-ui-consistency-redesign-design.md`

## Global Constraints

- Treat the current uncommitted working tree as the authoritative baseline; preserve user-owned changes.
- Do not commit during this execution. Use scoped diff reviews and test checkpoints instead.
- Keep routes, API contracts, DTOs, query keys, validation rules, and business calculations unchanged.
- Keep `src/app` routing-only, domain behavior in `src/modules`, shared application UI in `src/shared`, and primitives in `src/components/ui`.
- Reuse existing components before creating new ones; do not introduce one-to-one primitive wrappers.
- Use Inter and semantic color tokens from `src/app/globals.css`; no arbitrary colors in component code.
- Use Hugeicons for product UI. Do not add dependencies.
- Do not add mock data, fake metrics, charts, actions, statuses, permissions, or backend behavior.
- Preserve loading, empty, error, success, partial-data, and permission behavior that is supported by existing contracts.
- Optimize for 1366×768, 1440×900, and 1920×1080 before narrower layouts.
- Before editing Next.js layout, font, link, or image code, read the matching guide in `node_modules/next/dist/docs/01-app/`.

## Review Focus

- Long Vietnamese titles and action labels at 1366×768 must wrap without overlapping or pushing the primary workflow off-screen; covered by shell and module visual checks in Tasks 2–9.
- Empty, loading, and failed queries must retain an accessible status/message and a usable recovery action; covered by module tests in Tasks 3–8.
- URL-backed tabs, filters, searches, and pagination must retain their current query parameters after structural UI changes; covered by Tasks 3–8.
- Dialogs with long forms must remain scrollable at 768px height while their cancel/primary action order stays consistent; covered by Tasks 3–9.
- Status and clinical warnings must remain understandable without color and all icon-only controls must have accessible names; covered by Tasks 3–10.

---

### Task 1: Lock the Shared Visual Foundation

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/textarea.tsx`
- Modify: `src/components/ui/table.tsx`
- Modify: `src/components/ui/tabs.tsx`
- Modify: `src/components/ui/dialog.tsx`
- Modify: `src/components/ui/sheet.tsx`
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/alert.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/dropdown-menu.tsx`
- Modify: `src/components/ui/popover.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/pagination.tsx`
- Modify: `src/shared/ui/data-table-pagination.tsx`
- Test: `src/shared/ui/__tests__/data-table-pagination.test.tsx`

**Interfaces:**
- Consumes: existing shadcn/Base UI component APIs and semantic variables in `src/app/globals.css`.
- Produces: unchanged public component props with standardized 36–40px controls, 6–12px radii, border-first surfaces, visible focus, compact tables, underline tabs, and floating-layer-only shadows.

- [ ] **Step 1: Read the installed Next.js guidance before changing root layout fonts**

Run:

```powershell
Get-Content -Raw node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
Get-Content -Raw node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md
```

Expected: confirm the installed App Router layout and `next/font` behavior before editing `src/app/layout.tsx`.

- [ ] **Step 2: Capture the primitive baseline**

Run:

```powershell
pnpm test -- src/shared/ui/__tests__/data-table-pagination.test.tsx
pnpm typecheck
```

Expected: record current pass/fail state before shared changes; do not attribute a pre-existing failure to this task.

- [ ] **Step 3: Add a pagination regression test for accessible current-page state**

Add to `src/shared/ui/__tests__/data-table-pagination.test.tsx`:

```tsx
it("exposes the active page and keeps navigation buttons named", () => {
  render(
    <DataTablePagination
      currentPage={2}
      pageSize={10}
      totalItems={31}
      totalPages={4}
      onPageChange={vi.fn()}
      entityName="bệnh nhân"
    />
  )

  expect(screen.getByRole("navigation", { name: "Phân trang" })).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page")
  expect(screen.getByRole("link", { name: /trang trước/i })).toBeInTheDocument()
  expect(screen.getByRole("link", { name: /trang sau/i })).toBeInTheDocument()
})
```

- [ ] **Step 4: Run the focused test and confirm any failure is meaningful**

Run: `pnpm test -- src/shared/ui/__tests__/data-table-pagination.test.tsx`

Expected: PASS if the current accessible contract already exists, otherwise FAIL only on the missing accessible state to be fixed in this task.

- [ ] **Step 5: Normalize tokens and typography without changing semantic names**

In `src/app/globals.css`:

- Keep the existing semantic color variable names and both `:root`/`.dark` mappings.
- Set the shared radius base so `rounded-md` resolves to roughly 8px, `rounded-lg` to roughly 10px, and `rounded-xl` to roughly 12px.
- Add semantic size variables only if Tailwind utilities cannot express the approved 4px spacing scale and 36–40px control heights.
- Retain status tokens and ensure foreground/background pairs exist in both themes.
- Keep base focus outlines enabled.

In `src/app/layout.tsx`, retain Inter as `--font-sans`, retain Geist Mono only as `--font-geist-mono`, and remove Geist Sans from the HTML class list so product text has one sans family.

- [ ] **Step 6: Standardize existing primitive defaults in place**

Apply these exact rules while preserving every exported component and variant name:

```text
Button/Input/Select/Textarea: rounded-md; default h-9 or h-10; visible focus ring; no default decorative shadow.
Table: text-sm; compact header/row padding; subtle horizontal separators; row hover from semantic hover/accent token.
Tabs: transparent list; active trigger uses bottom border/indicator; no default pill container.
Dialog/Sheet/Dropdown/Popover: rounded-lg; shadow allowed because these are floating layers.
Card: rounded-lg border bg-card; no default shadow.
Badge: compact radius and padding; no metadata-specific variants.
Alert: border-first semantic surface; icon and text alignment preserved.
Pagination: 36px targets, named previous/next controls, current page via aria-current.
```

- [ ] **Step 7: Verify primitive behavior and inspect the scoped diff**

Run:

```powershell
pnpm test -- src/shared/ui/__tests__/data-table-pagination.test.tsx src/shared/ui/__tests__/money-input.test.tsx
pnpm typecheck
git diff --check -- src/app/globals.css src/app/layout.tsx src/components/ui src/shared/ui
```

Expected: focused tests and typecheck pass; the diff contains no whitespace errors and no primitive API rename.

---

### Task 2: Standardize the Shared Page Header and Application Shell

**Files:**
- Create: `src/shared/ui/page-header.tsx`
- Create: `src/shared/ui/__tests__/page-header.test.tsx`
- Modify: `src/shared/ui/index.ts`
- Modify: `src/widgets/app-shell/app-shell.tsx`
- Modify: `src/widgets/app-sidebar/app-sidebar.tsx`
- Modify: `src/widgets/app-header/app-header.tsx`
- Create: `src/widgets/__tests__/app-shell.test.tsx`

**Interfaces:**
- Consumes: `Button`, `Input`, `Sheet`, Next.js `Link`, semantic tokens, and Hugeicons.
- Produces: `PageHeader`, `PageBreadcrumbItem`, and a shell with a 248px sidebar, 64px header, consistent main padding, named navigation/search controls, and no hardcoded SVG colors.

- [ ] **Step 1: Write the shared page-header contract test**

Create `src/shared/ui/__tests__/page-header.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "@/components/ui/button"
import { PageHeader } from "../page-header"

describe("PageHeader", () => {
  it("renders one page heading, breadcrumb navigation, description, and actions", () => {
    render(
      <PageHeader
        breadcrumbs={[{ label: "Doanh nghiệp", href: "/enterprises" }, { label: "Đợt khám" }]}
        title="Đợt khám tháng 9"
        description="Danh sách nhân viên tham gia đợt khám"
        actions={<Button>Import nhân sự</Button>}
      />
    )

    expect(screen.getByRole("heading", { level: 1, name: "Đợt khám tháng 9" })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Doanh nghiệp" })).toHaveAttribute("href", "/enterprises")
    expect(screen.getByText("Danh sách nhân viên tham gia đợt khám")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Import nhân sự" })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the page-header test and verify it fails because the component does not exist**

Run: `pnpm test -- src/shared/ui/__tests__/page-header.test.tsx`

Expected: FAIL with an unresolved `../page-header` module.

- [ ] **Step 3: Implement the minimal shared page-header API**

Create `src/shared/ui/page-header.tsx` with this implementation:

```tsx
import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

export interface PageBreadcrumbItem {
  label: string
  href?: string
}

export interface PageHeaderProps {
  breadcrumbs?: readonly PageBreadcrumbItem[]
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ breadcrumbs, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb">
          <ol className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumbs.map((item, index) => {
              const isCurrent = index === breadcrumbs.length - 1

              return (
                <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                  {index > 0 ? (
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 shrink-0" aria-hidden="true" />
                  ) : null}
                  {item.href && !isCurrent ? (
                    <Link href={item.href} className="truncate transition-colors hover:text-foreground">
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={cn("truncate", isCurrent && "font-medium text-foreground")}
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold leading-[1.25] tracking-tight text-foreground">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}
```

Render the final breadcrumb item as text, not a link, and export the component/types from `src/shared/ui/index.ts`.

- [ ] **Step 4: Write shell accessibility tests before changing shell composition**

Create `src/widgets/__tests__/app-shell.test.tsx` and mock `next/navigation` so `usePathname()` returns `/enterprises`. Assert:

```tsx
expect(screen.getByRole("navigation", { name: "Điều hướng chính" })).toBeInTheDocument()
expect(screen.getByRole("link", { name: "Doanh nghiệp" })).toHaveAttribute("aria-current", "page")
expect(screen.getByRole("searchbox", { name: "Tìm kiếm toàn hệ thống" })).toBeInTheDocument()
expect(screen.getByRole("main")).toContainElement(screen.getByText("Nội dung"))
```

- [ ] **Step 5: Migrate the shell to the approved dimensions and Hugeicons**

In the three widget files:

- Use `w-[248px]` only for layout dimension; this is not a color and is permitted.
- Retain the 64px header.
- Use `px-6 py-6 xl:px-8` for main content.
- Add `aria-label="Điều hướng chính"` and `aria-current="page"` to active navigation.
- Replace product-facing Lucide imports and inline SVG icons with Hugeicons.
- Remove the hardcoded colored SVG avatar; use a semantic neutral avatar/initial treatment.
- Keep one global search field but give it `aria-label="Tìm kiếm toàn hệ thống"`.
- Keep mobile navigation in the existing Sheet and preserve the current open/close state.
- Do not invent notification, help, or user-menu behavior; controls without implemented behavior remain visually secondary and accessible.

- [ ] **Step 6: Run shared/shell tests and inspect the checkpoint**

Run:

```powershell
pnpm test -- src/shared/ui/__tests__/page-header.test.tsx src/widgets/__tests__/app-shell.test.tsx
pnpm typecheck
git diff --check -- src/shared/ui src/widgets
```

Expected: tests pass, active navigation is announced, the search is named, and TypeScript reports no icon type mismatch.

---

### Task 3: Migrate Enterprise Screens and Dialogs

**Files:**
- Modify: `src/modules/companies/pages/enterprise-list-page.tsx`
- Modify: `src/modules/companies/pages/enterprise-detail-page.tsx`
- Modify: `src/modules/companies/components/enterprise-page-header.tsx`
- Modify: `src/modules/companies/components/enterprise-detail-header.tsx`
- Modify: `src/modules/companies/components/enterprise-counters-strip.tsx`
- Modify: `src/modules/companies/components/enterprise-summary-strip.tsx`
- Modify: `src/modules/companies/components/enterprise-filters.tsx`
- Modify: `src/modules/companies/components/enterprise-table.tsx`
- Modify: `src/modules/companies/components/enterprise-tabs.tsx`
- Modify: `src/modules/companies/components/enterprise-info-card.tsx`
- Modify: `src/modules/companies/components/enterprise-health-examination-batches-tab.tsx`
- Modify: `src/modules/companies/components/health-examination-batch-toolbar.tsx`
- Modify: `src/modules/companies/components/health-examination-batch-table.tsx`
- Modify: `src/modules/companies/components/health-examination-batch-basic-info-section.tsx`
- Modify: `src/modules/companies/components/examination-item-price-table.tsx`
- Modify: `src/modules/companies/components/examination-item-row.tsx`
- Modify: `src/modules/companies/components/company-logo.tsx`
- Modify: `src/modules/companies/components/create-enterprise-dialog.tsx`
- Modify: `src/modules/companies/components/edit-enterprise-dialog.tsx`
- Modify: `src/modules/companies/components/create-health-examination-batch-dialog.tsx`
- Test: `src/modules/companies/__tests__/enterprise-list.test.tsx`
- Test: `src/modules/companies/__tests__/enterprise-detail.test.tsx`
- Test: `src/modules/companies/__tests__/create-health-examination-batch.test.tsx`

**Interfaces:**
- Consumes: `PageHeader`, standardized primitives, `DataTablePagination`, existing company hooks and domain types.
- Produces: enterprise list/detail/batch UI with unchanged URL filters, queries, mutations, dialog contracts, and public module exports.

- [ ] **Step 1: Extend enterprise tests around the structural contract**

Add assertions to existing tests:

```tsx
expect(screen.getByRole("heading", { level: 1, name: /doanh nghiệp/i })).toBeInTheDocument()
expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument()
expect(screen.getByRole("button", { name: /thêm doanh nghiệp/i })).toBeInTheDocument()
expect(screen.getByRole("table")).toBeInTheDocument()
```

For the error fixture, assert the visible error message and `Thử lại` button. For the empty fixture, assert the current empty-state title and the create action. For URL-backed filters, retain the existing router replacement assertion and verify unrelated query parameters are not discarded.

- [ ] **Step 2: Run enterprise tests before migration**

Run: `pnpm test -- src/modules/companies/__tests__`

Expected: new structural assertions fail only where the current pages do not yet use the shared header/accessibility contract.

- [ ] **Step 3: Replace duplicate enterprise headers with `PageHeader` composition**

Keep `EnterprisePageHeader` and `EnterpriseDetailHeader` as domain components because they add domain actions/status, but render `PageHeader` internally. Use exactly one primary action per context; edit/download/supporting actions use outline or ghost variants. Replace Lucide product icons with Hugeicons.

- [ ] **Step 4: Flatten list/detail surfaces**

Apply these concrete transformations:

```text
Counter/summary strip: one bordered compact band; no shadow; no colored icon circles; status remains icon/text aware.
List toolbar: search + status filter on one row when width permits.
Tables: rounded-lg outer border only; no card rows; compact header and cells; right-aligned action column.
Detail information: section heading + divider + definition-grid rows; remove rounded-2xl card shell.
Tabs: standardized underline treatment from the primitive.
Price table: numeric columns right-aligned; editing affordances retain labels and keyboard access.
```

- [ ] **Step 5: Normalize enterprise dialogs without changing form schemas**

Each dialog must use the existing Dialog primitives in this exact order: `DialogHeader`, scrollable form content, then `DialogFooter`. Apply `max-h-[calc(100dvh-2rem)] overflow-hidden p-0` to `DialogContent`; apply `px-6 pt-6` to `DialogHeader`; apply `min-h-0 flex-1 overflow-y-auto px-6 py-5` to the form-content region; and apply `border-t px-6 py-4` to `DialogFooter`. The footer renders the cancel action first and the submit action second.

Preserve form registration, Zod resolution, mutation calls, error mapping, focus behavior, and success callbacks. At 768px height, cap content using viewport-relative max height and allow only the body to scroll.

- [ ] **Step 6: Verify enterprises**

Run:

```powershell
pnpm test -- src/modules/companies/__tests__
pnpm typecheck
git diff --check -- src/modules/companies
```

Expected: all enterprise tests pass, query behavior is unchanged, and no company component imports Lucide.

---

### Task 4: Migrate Health-Examination Batch Screens

**Files:**
- Modify: `src/modules/health-check-batches/pages/health-examination-batch-detail-page.tsx`
- Modify: `src/modules/health-check-batches/components/health-examination-batch-header.tsx`
- Modify: `src/modules/health-check-batches/components/health-examination-batch-summary-strip.tsx`
- Modify: `src/modules/health-check-batches/components/health-examination-batch-tabs.tsx`
- Modify: `src/modules/health-check-batches/components/import-employees-dialog.tsx`
- Modify: `src/modules/health-check-batches/components/employees-tab/employees-tab.tsx`
- Modify: `src/modules/health-check-batches/components/employees-tab/employees-toolbar.tsx`
- Modify: `src/modules/health-check-batches/components/employees-tab/employees-table.tsx`
- Modify: `src/modules/health-check-batches/components/employees-tab/empty-employees-state.tsx`
- Modify: `src/modules/health-check-batches/components/examination-detail-tab/examination-detail-tab.tsx`
- Modify: `src/modules/health-check-batches/components/examination-detail-tab/examination-detail-toolbar.tsx`
- Modify: `src/modules/health-check-batches/components/examination-detail-tab/examination-matrix-table.tsx`
- Modify: `src/modules/health-check-batches/components/report-tab/report-tab.tsx`
- Modify: `src/modules/health-check-batches/components/report-tab/report-header.tsx`
- Modify: `src/modules/health-check-batches/components/report-tab/report-actions.tsx`
- Modify: `src/modules/health-check-batches/components/report-tab/report-export-actions.tsx`
- Modify: `src/modules/health-check-batches/components/report-tab/report-summary-table.tsx`
- Modify: `src/modules/health-check-batches/components/report-tab/examination-summary-table.tsx`
- Modify: `src/modules/health-check-batches/components/report-tab/examination-summary-row.tsx`
- Modify: `src/modules/health-check-batches/components/report-tab/report-total-row.tsx`
- Modify: `src/modules/health-check-batches/components/report-tab/calculation-example.tsx`
- Test: `src/modules/health-check-batches/__tests__/health-examination-batch-detail.test.tsx`
- Test: `src/modules/health-check-batches/__tests__/examination-detail-tab.test.tsx`
- Test: `src/modules/health-check-batches/__tests__/health-examination-batch-report.test.tsx`

**Interfaces:**
- Consumes: shared page header/primitives/pagination and existing batch hooks/types/export utilities.
- Produces: unchanged employees/examination/report tab behavior with one visual hierarchy and accessible import/report actions.

- [ ] **Step 1: Add state and tab regression assertions**

Extend existing tests to assert:

```tsx
expect(screen.getByRole("tab", { name: /nhân sự/i })).toHaveAttribute("aria-selected", "true")
await user.click(screen.getByRole("tab", { name: /chi tiết khám/i }))
expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining("tab=details"), { scroll: false })
```

Add explicit assertions for loading skeleton presence, batch-not-found error text plus retry action, empty employee import action, and non-color report status text.

- [ ] **Step 2: Run batch tests before migration**

Run: `pnpm test -- src/modules/health-check-batches/__tests__`

Expected: record baseline; structural assertions may fail before migration while data behavior remains green.

- [ ] **Step 3: Apply the shared header, tabs, toolbar, and table hierarchy**

- Render `HealthExaminationBatchHeader` through `PageHeader`.
- Keep Import as the primary employee-tab action and template download as outline/ghost.
- Keep the URL tab mapping exactly `employees` → no parameter, `examination` → `tab=details`, and `report` → `tab=report`.
- Convert summary metrics into one bordered information band without shadow or decorative icon backgrounds.
- Use shared tab styling and preserve ARIA tab roles.
- Put search/filters/actions into compact toolbars and retain the existing query/filter state.
- Keep matrix tables horizontally scrollable rather than dropping clinical columns.

- [ ] **Step 4: Simplify reporting surfaces without changing calculations**

Remove nested Card wrappers from report sections; use section headings, dividers, and bordered table regions. Preserve every calculation, total, export callback, and label. Right-align counts and monetary values. Use semantic status styling only where the value is a true status.

- [ ] **Step 5: Normalize import dialog and empty/error states**

Use the standard dialog body/footer structure from Task 3, preserve file validation and callbacks, and ensure errors remain adjacent to the relevant import step. The empty employee state must expose both download-template and import actions by accessible name.

- [ ] **Step 6: Verify health-examination batches**

Run:

```powershell
pnpm test -- src/modules/health-check-batches/__tests__
pnpm typecheck
git diff --check -- src/modules/health-check-batches
```

Expected: tests pass, URL tabs are unchanged, export calculations are unchanged, and module TSX files contain no Lucide imports.

---

### Task 5: Migrate Patient Registry Screens

**Files:**
- Modify: `src/modules/patients/pages/patients-page.tsx`
- Modify: `src/modules/patients/pages/patient-detail-page.tsx`
- Modify: `src/modules/patients/components/patient-counters-strip.tsx`
- Modify: `src/modules/patients/components/patient-toolbar.tsx`
- Modify: `src/modules/patients/components/patient-table.tsx`
- Modify: `src/modules/patients/components/patient-search-dialog.tsx`
- Modify: `src/modules/patients/components/create-patient-dialog.tsx`
- Modify: `src/modules/patients/components/edit-patient-dialog.tsx`
- Modify: `src/modules/patients/components/encounter/encounter-history-table.tsx`
- Test: `src/modules/patients/__tests__/patients.test.tsx`

**Interfaces:**
- Consumes: `PageHeader`, shared primitives/pagination, current patient hooks/schemas/formatters.
- Produces: patient list/detail UI with unchanged debounce, selection, CRUD callbacks, navigation, and encounter ownership.

- [ ] **Step 1: Pin patient identity, filters, and empty/error behavior in tests**

Add assertions for one `Bệnh nhân` h1, named search field, existing 250ms debounce behavior, patient identity columns, empty state, fetch error/retry state, and primary `Thêm bệnh nhân` action. On detail, assert the patient name is the only h1 and encounter history remains visible.

- [ ] **Step 2: Run patient tests before migration**

Run: `pnpm test -- src/modules/patients/__tests__/patients.test.tsx`

Expected: behavioral assertions pass; new page-structure assertions fail only where the shared header is not yet used.

- [ ] **Step 3: Migrate list structure**

- Use `PageHeader` with one primary add action.
- Convert counters to the same compact bordered-band pattern as enterprises; retain click-to-filter behavior.
- Keep search/gender/age filters together in one toolbar and preserve the current 250ms debounce and page reset.
- Standardize table/pagination density, keep patient identity readable, and retain bulk-selection accessibility.

- [ ] **Step 4: Migrate patient detail structure**

Replace the rounded-2xl summary banner with a restrained entity header and metadata definition strip. Render gender, birth date/age, last examination, CCCD, phone, email, and address as text—not badges. Keep patient code as a compact identifier. Keep one dominant `Tiếp nhận khám` action and demote list/edit actions.

Tabs must use the shared underline style. Encounter history remains the primary tab; no clinical record is detached from its encounter.

- [ ] **Step 5: Normalize patient dialogs**

Apply the shared dialog header/body/footer structure and replace product Lucide icons with Hugeicons. Preserve schemas, form fields, mutations, duplicate-submit prevention, and existing `onSuccess` callbacks.

- [ ] **Step 6: Verify patient registry**

Run:

```powershell
pnpm test -- src/modules/patients/__tests__/patients.test.tsx
pnpm typecheck
git diff --check -- src/modules/patients/pages src/modules/patients/components
```

Expected: patient behavior/tests pass and the patient registry uses no decorative nested cards or Lucide icons.

---

### Task 6: Migrate Encounter and Clinical Views

**Files:**
- Modify: `src/modules/patients/pages/encounter-detail-page.tsx`
- Modify: `src/modules/patients/components/encounter/encounter-header-card.tsx`
- Modify: `src/modules/patients/components/encounter/encounter-tabs-nav.tsx`
- Modify: `src/modules/patients/components/encounter/encounter-summary-view.tsx`
- Modify: `src/modules/patients/components/encounter/encounter-diagnosis-view.tsx`
- Modify: `src/modules/patients/components/encounter/encounter-lab-orders-view.tsx`
- Modify: `src/modules/patients/components/encounter/encounter-lab-detail-cbc-view.tsx`
- Modify: `src/modules/patients/components/encounter/encounter-imaging-detail-xray-view.tsx`
- Modify: `src/modules/patients/components/encounter/encounter-prescription-view.tsx`
- Modify: `src/modules/patients/components/encounter/encounter-documents-view.tsx`
- Modify: `src/modules/patients/components/encounter/print-prescription-dialog.tsx`
- Test: `src/modules/patients/__tests__/encounter-detail.test.tsx`

**Interfaces:**
- Consumes: patient/encounter types and hooks, shared header/primitives, existing print callbacks.
- Produces: encounter-owned clinical views with unchanged tab routing/data and explicit accessible safety signals.

- [ ] **Step 1: Extend encounter tests for ownership and warnings**

Assert that the patient/encounter identity appears in the page header, tab selection exposes `aria-selected`, prescriptions/results remain under the selected encounter fixture, and every abnormal/warning fixture has visible descriptive text in addition to semantic color.

- [ ] **Step 2: Run encounter tests before migration**

Run: `pnpm test -- src/modules/patients/__tests__/encounter-detail.test.tsx`

Expected: current data-ownership assertions pass; new semantic structure assertions expose any missing labels.

- [ ] **Step 3: Replace the encounter header card with entity context**

Keep the domain component name if changing it would churn imports, but render it as a flat header/metadata band using `PageHeader`. Keep encounter code/status/date/room/doctor as scan-friendly metadata. Status may remain a badge; ordinary metadata may not.

- [ ] **Step 4: Flatten each clinical tab into sections**

For summary, diagnosis, orders, results, prescriptions, and documents:

```text
Use section heading + divider + table/definition list.
Remove card-per-field and nested rounded-2xl containers.
Keep abnormal/warning values paired with icon and explicit label.
Keep result units, reference ranges, medication directions, and document actions unchanged.
Keep tables scrollable rather than hiding columns.
```

- [ ] **Step 5: Normalize the prescription print dialog**

Keep print content and browser print behavior unchanged. Apply the standard dialog title/body/footer pattern to the preview controls; print media must still exclude application chrome and dialog controls.

- [ ] **Step 6: Verify encounter views**

Run:

```powershell
pnpm test -- src/modules/patients/__tests__/encounter-detail.test.tsx
pnpm typecheck
git diff --check -- src/modules/patients/pages/encounter-detail-page.tsx src/modules/patients/components/encounter
```

Expected: encounter tests pass and warnings remain understandable without color.

---

### Task 7: Migrate Reception Workflow

**Files:**
- Modify: `src/modules/reception/pages/reception-page.tsx`
- Modify: `src/modules/reception/components/reception-header-actions.tsx`
- Modify: `src/modules/reception/components/reception-counters-strip.tsx`
- Modify: `src/modules/reception/components/reception-patient-table.tsx`
- Modify: `src/modules/reception/components/reception-status-badge.tsx`
- Modify: `src/modules/reception/components/today-appointments-dialog.tsx`
- Modify: `src/modules/reception/components/receive-patient-dialog.tsx`
- Modify: `src/modules/reception/components/assign-room-dialog.tsx`
- Modify: `src/modules/reception/components/payment-dialog.tsx`
- Modify: `src/modules/reception/components/print-examination-dialog.tsx`
- Modify: `src/modules/reception/components/encounter-detail-dialog.tsx`
- Test: `src/modules/reception/__tests__/reception.test.tsx`

**Interfaces:**
- Consumes: `PageHeader`, patient dialogs, appointment hooks, reception hooks/types, standardized primitives.
- Produces: unchanged intake/check-in/room/payment/print transitions in a consistent operational layout.

- [ ] **Step 1: Add workflow-preservation tests**

Keep existing check-in tests and add assertions that:

```tsx
expect(screen.getByRole("heading", { level: 1, name: "Lễ tân" })).toBeInTheDocument()
expect(screen.getByRole("button", { name: /tiếp nhận bệnh nhân/i })).toBeInTheDocument()
expect(screen.getByRole("button", { name: /thử lại|tải lại/i })).toBeInTheDocument()
```

For appointment query parameters, retain the test that the matching appointment opens intake and verify closing the dialog clears only the handled query context. For status fixtures, assert the status label text rather than only CSS classes.

- [ ] **Step 2: Run reception tests before migration**

Run: `pnpm test -- src/modules/reception/__tests__/reception.test.tsx`

Expected: existing cross-dialog workflow stays green; structural assertions guide the migration.

- [ ] **Step 3: Migrate page header, counters, and worklist**

Use `PageHeader`; make `Tiếp nhận bệnh nhân` the single primary action, with find/create/today appointments as outline or ghost actions. Convert counters to the shared compact band. Standardize tabs/search/room filter/table actions and preserve all handlers and TanStack Query calls.

- [ ] **Step 4: Normalize all reception dialogs**

Apply one dialog structure and button order. Preserve every transition among patient search, creation, intake, room assignment, payment, encounter detail, and print. Long forms use a scrollable body at 768px height. Action buttons remain visible without duplicating primary actions inside the body.

- [ ] **Step 5: Standardize statuses and icons**

Keep status badges only for encounter workflow states. Pair every status color with its Vietnamese label, replace Lucide product icons with Hugeicons, and add accessible names/tooltips to compact row actions.

- [ ] **Step 6: Verify reception**

Run:

```powershell
pnpm test -- src/modules/reception/__tests__/reception.test.tsx
pnpm typecheck
git diff --check -- src/modules/reception
```

Expected: reception tests pass and cross-dialog workflow behavior is unchanged.

---

### Task 8: Migrate Appointment Screens

**Files:**
- Modify: `src/modules/appointments/pages/appointments-page.tsx`
- Modify: `src/modules/appointments/components/appointment-header-actions.tsx`
- Modify: `src/modules/appointments/components/appointment-counters-strip.tsx`
- Modify: `src/modules/appointments/components/appointment-table.tsx`
- Modify: `src/modules/appointments/components/appointment-status-badge.tsx`
- Modify: `src/modules/appointments/components/create-appointment-dialog.tsx`
- Modify: `src/modules/appointments/components/edit-appointment-dialog.tsx`
- Modify: `src/modules/appointments/components/appointment-detail-dialog.tsx`
- Test: `src/modules/appointments/__tests__/appointments.test.tsx`

**Interfaces:**
- Consumes: shared page header/primitives/pagination and current appointment hooks/schemas/types.
- Produces: unchanged create/edit/detail/check-in behavior with consistent filters, statuses, and dialog layout.

- [ ] **Step 1: Add appointment structure and behavior assertions**

Assert one `Lịch hẹn` h1, one primary `Tạo lịch hẹn` action, visible status labels, accessible row actions, preserved tab/filter behavior, and consistent dialog cancel/submit order. Retain existing mutation and reception-navigation assertions.

- [ ] **Step 2: Run appointment tests before migration**

Run: `pnpm test -- src/modules/appointments/__tests__/appointments.test.tsx`

Expected: behavioral tests establish the baseline and structural assertions identify migration work.

- [ ] **Step 3: Migrate list/header/table surfaces**

Use `PageHeader`, compact counters, one toolbar, standardized table/pagination, and Hugeicons. Keep appointment status as badge text; keep patient, phone, date, room, physician, and enterprise as plain cells. Use compact named row actions.

- [ ] **Step 4: Normalize appointment dialogs**

Apply standard dialog header/body/footer and scroll behavior. Preserve existing React Hook Form/Zod contracts, dependent fields, mutations, loading/disabled states, and detail-to-edit transitions.

- [ ] **Step 5: Verify appointments**

Run:

```powershell
pnpm test -- src/modules/appointments/__tests__/appointments.test.tsx
pnpm typecheck
git diff --check -- src/modules/appointments
```

Expected: all appointment tests pass and module TSX contains no Lucide imports.

---

### Task 9: Align Authentication With the Product System

**Files:**
- Modify: `src/modules/auth/pages/login-page.tsx`
- Modify: `src/modules/auth/components/login-card.tsx`
- Modify: `src/modules/auth/components/login-form.tsx`
- Modify: `src/modules/auth/components/login-background-decorations.tsx`
- Test: `src/modules/auth/__tests__/login-page.test.tsx`

**Interfaces:**
- Consumes: standardized Button/Input/Checkbox/Alert primitives and existing auth hook/schema.
- Produces: the same login API and validation behavior in a restrained non-marketing authentication layout.

- [ ] **Step 1: Add authentication accessibility regressions**

Retain existing login validation/submission tests and assert:

```tsx
expect(screen.getByRole("heading", { level: 1, name: "Đăng nhập hệ thống" })).toBeInTheDocument()
expect(screen.getByLabelText(/tên đăng nhập/i)).toBeRequired()
expect(screen.getByLabelText(/mật khẩu/i)).toBeRequired()
expect(screen.getByRole("button", { name: /hiện mật khẩu/i })).toBeInTheDocument()
```

Assert the server error remains associated with an alert and the busy submit label remains visible.

- [ ] **Step 2: Run auth tests before migration**

Run: `pnpm test -- src/modules/auth/__tests__/login-page.test.tsx`

Expected: current business behavior passes; any required-field assertion failure is fixed without changing the schema.

- [ ] **Step 3: Remove decorative AI-style login treatment**

Keep a single restrained bordered login panel, 10–12px radius, and no decorative blob/gradient/glow. Remove or reduce `LoginBackgroundDecorations` to a semantic background treatment; delete the component only if no behavior/import depends on it after migration. Use one logo/brand block, left-aligned form fields, and the same Inter/control system as the app.

- [ ] **Step 4: Normalize form controls and icons**

Use Hugeicons, 40px controls, visible labels, inline errors, named password visibility control, and one full-width primary submit button. Preserve `rememberMe`, disabled/busy behavior, server-error clearing, submission, and navigation behavior.

- [ ] **Step 5: Verify authentication**

Run:

```powershell
pnpm test -- src/modules/auth/__tests__/login-page.test.tsx
pnpm typecheck
git diff --check -- src/modules/auth
```

Expected: login tests pass, no production auth behavior changes, and the auth module has no Lucide import.

---

### Task 10: Repository-Wide Consistency Audit and Full Verification

**Files:**
- Modify only files identified by the audits below where the violation is inside the approved UI scope.
- Do not modify API, schema, hook, type, or mock-data files unless a TypeScript import cleanup caused directly by this redesign requires it.

**Interfaces:**
- Consumes: all outputs from Tasks 1–9.
- Produces: one verified UI system across every implemented route with documented residual risks.

- [ ] **Step 1: Audit arbitrary and unmapped colors**

Run:

```powershell
rg -n 'bg-\[#|text-\[#|border-\[#|style=\{\{[^}]*color|\b(bg|text|border)-(blue|slate|emerald|amber|red|green|yellow|sky|indigo)-[0-9]' src -g '*.tsx'
```

Expected: no component-level arbitrary/unmapped color matches. Replace each in-scope match with an existing semantic token; add a token to both themes only when the semantic meaning does not already exist.

- [ ] **Step 2: Audit product icon consistency and accessible icon controls**

Run:

```powershell
rg -n 'from "lucide-react"|from ''lucide-react''' src -g '*.tsx'
rg -n '<button|<Button' src/modules src/widgets -g '*.tsx'
```

Expected: no Lucide product UI imports remain. Primitive-internal icons are already Hugeicons. Inspect icon-only buttons and add `aria-label`; add Tooltip for unfamiliar actions.

- [ ] **Step 3: Audit radius, shadows, cards, and badges**

Run:

```powershell
rg -n 'rounded-(2xl|3xl|4xl)|shadow-(sm|md|lg|xl|2xl)|<Card|<Badge' src/modules src/widgets src/shared -g '*.tsx'
```

Expected: every remaining large radius/shadow/Card/Badge has a documented functional reason in the final report. Replace ordinary page-section shadows, nested cards, and metadata badges with borders/dividers/plain text.

- [ ] **Step 4: Run focused module suites together**

Run:

```powershell
pnpm test -- src/shared src/widgets src/modules/auth src/modules/companies src/modules/health-check-batches src/modules/patients src/modules/reception src/modules/appointments
```

Expected: all focused tests pass in one run, proving shared primitive changes do not depend on test order.

- [ ] **Step 5: Run all repository checks**

Run in order:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all four commands exit successfully. If a failure was present before the redesign, reproduce it against the baseline evidence and report it separately; do not hide it.

- [ ] **Step 6: Run the application and perform visual verification**

Run: `pnpm dev`

Inspect these routes at 1366×768, 1440×900, and 1920×1080, plus one narrower viewport:

```text
/auth/login
/enterprises
/enterprises/[existing enterprise id]
/enterprises/[existing enterprise id]/health-examination-batches/[existing batch id]
/patients
/patients/[existing patient id]
/patients/[existing patient id]/encounters/[existing encounter id]
/reception
/appointments
```

For each route verify: shell consistency, one h1, action hierarchy, 24–32px page padding, no page-level decorative shadow, readable tables, visible focus, no unintended horizontal page overflow, and usable dialogs at 768px height. Horizontal scrolling inside wide operational tables is acceptable. Repeat `/enterprises`, `/patients/[existing patient id]/encounters/[existing encounter id]`, and one long dialog at 1440×900 with the `.dark` theme active to confirm surface, text, border, focus, and semantic-status contrast.

- [ ] **Step 7: Review the complete diff without modifying unrelated changes**

Run:

```powershell
git diff --check
git status --short
git diff -- src/app src/components/ui src/shared src/widgets src/modules
```

Expected: every changed UI line traces to the approved redesign or a directly required test update. Preserve unrelated user changes and list any residual risk, missing contract, or pre-existing failure in the completion report.

- [ ] **Step 8: Prepare the required completion report**

Report:

```text
1. What changed.
2. Files added/modified.
3. Existing components reused.
4. New reusable component created and why existing options were insufficient.
5. Checks actually run and their exact outcomes.
6. Assumptions or missing API contracts.
7. Remaining risks or follow-up items.
```
