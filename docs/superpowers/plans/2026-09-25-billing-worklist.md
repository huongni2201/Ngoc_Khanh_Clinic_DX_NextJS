# Billing Worklist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/billing` operational payment worklist and a reusable status-driven payment dialog so reception staff can close pending bank transfers, continue working, and reliably inspect them later.

**Architecture:** A new `src/modules/billing` module owns invoice/payment models, a billing API facade, TanStack Query hooks, the shared payment dialog, and the payment worklist page. The pre-existing in-memory invoice store remains inside the reception adapter during this frontend-only phase so current encounters and payments share one source of truth; the billing facade is the replacement seam for the future backend. The App Router page remains composition-only and wraps the client page in the existing app shell and suspense boundary.

**Tech Stack:** Next.js 16.3.5 App Router, React 19.2.8, TypeScript strict mode, TanStack Query 5, Tailwind CSS 4 semantic tokens, shadcn/ui Mira primitives, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-25-billing-worklist-design.md`

## Global Constraints

- Use `pnpm` only and do not add dependencies.
- UI copy is Vietnamese; source identifiers are English.
- All component colors come from semantic tokens in `src/app/globals.css`; do not add arbitrary color values.
- Reuse `PageHeader`, `DataTablePagination`, and existing shadcn primitives before creating components.
- TanStack Query owns payment and invoice server state; React owns transient dialog state.
- Do not store payment state in Zustand, `localStorage`, or `sessionStorage`.
- Do not create a frontend webhook receiver or display a fabricated QR payload.
- Do not add demo patients, encounters, invoices, or transactions.
- Keep clinical service rows read-only in the payment workflow.
- Preserve unrelated working-tree changes, especially current edits under `src/components/ui`, `src/app/globals.css`, `src/app/layout.tsx`, and `src/shared/ui`.

## Review Focus

- A rapid double click on cash confirmation must produce one payment mutation and then a read-only paid state; Task 3 pins this with a disabled-button interaction test.
- Closing and reopening a pending transfer must preserve `PENDING` and the same invoice identity; Tasks 1 and 3 pin this at adapter and component levels.
- A payment that becomes paid while the `PENDING` filter is active must leave that result set and update counters; Tasks 2 and 4 pin query invalidation and page behavior.
- A transfer intent without a backend QR payload must show an explicit unavailable state and never render the existing simulated SVG; Task 3 pins this.
- Invalid `status`, `page`, or empty search parameters must normalize to a safe list view instead of producing an empty or broken page; Task 4 pins URL normalization.

---

### Task 1: Establish the billing domain and persistent adapter state

**Files:**
- Create: `src/modules/billing/types/index.ts`
- Create: `src/modules/billing/api/index.ts`
- Create: `src/modules/billing/__tests__/billing-api.test.ts`
- Modify: `src/modules/reception/types/index.ts:57-120`
- Modify: `src/modules/reception/api/index.ts:228-262, 454-546`

**Interfaces:**
- Consumes: the existing reception in-memory invoice/encounter store; no HTTP endpoint or new seed record is introduced.
- Produces:
  - `PaymentMethod = "CASH" | "TRANSFER"`
  - `PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "EXPIRED" | "FAILED"`
  - `Invoice`, `PaymentListParams`, `PaymentListResult`, `PaymentCounters`, `BillableEncounter`
  - Billing facade functions `fetchPayments(params)`, `fetchPaymentCounters()`, `fetchInvoiceByEncounter(encounter)`, `startTransferPayment(dto)`, `processCashPayment(dto)`, `recordTransferConfirmation(dto)`, `resetBillingStore()`

- [ ] **Step 1: Write the failing adapter tests**

Create `src/modules/billing/__tests__/billing-api.test.ts` with deterministic reset and tests for persisted pending state, filtering, missing QR data, duplicate finalization, and completed-encounter transition:

```ts
import { beforeEach, describe, expect, it } from "vitest"
import {
  fetchInvoiceByEncounter,
  fetchPaymentCounters,
  fetchPayments,
  processCashPayment,
  resetBillingStore,
  startTransferPayment,
} from "../api"
import { initialEncounters, resetReceptionStore } from "@/modules/reception/api"

const waitingEncounter = initialEncounters.find(
  (encounter) => encounter.status === "WAITING_PAYMENT"
)!

describe("billing API facade", () => {
  beforeEach(() => {
    resetReceptionStore()
    resetBillingStore()
  })

  it("persists a pending transfer so it can be listed after the dialog closes", async () => {
    const pending = await startTransferPayment({ encounter: waitingEncounter })
    const reopened = await fetchInvoiceByEncounter(waitingEncounter)
    const list = await fetchPayments({ status: "PENDING", page: 1, pageSize: 10 })

    expect(pending.status).toBe("PENDING")
    expect(reopened.id).toBe(pending.id)
    expect(list.data.map((invoice) => invoice.id)).toContain(pending.id)
    expect(pending.transferIntent?.qrCodeUrl).toBeUndefined()
  })

  it("finalizes cash only once and reports the paid counter", async () => {
    await fetchInvoiceByEncounter(waitingEncounter)
    const paid = await processCashPayment({ encounterId: waitingEncounter.id })
    const repeated = await processCashPayment({ encounterId: waitingEncounter.id })
    const counters = await fetchPaymentCounters()

    expect(repeated.id).toBe(paid.id)
    expect(repeated.paidAt).toBe(paid.paidAt)
    expect(counters.paidToday).toBe(1)
  })
})
```

- [ ] **Step 2: Run the adapter tests and verify the expected failure**

```bash
pnpm test -- src/modules/billing/__tests__/billing-api.test.ts
```

Expected: FAIL because `src/modules/billing/api` and billing domain types do not exist.

- [ ] **Step 3: Add the billing domain types**

Create the strict model in `src/modules/billing/types/index.ts`:

```ts
export type PaymentMethod = "CASH" | "TRANSFER"
export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "EXPIRED" | "FAILED"
export type PaymentStatusFilter = "ALL" | PaymentStatus

export interface BillableEncounter {
  id: string
  encounterCode: string
  patientId: string
  patientCode: string
  patientName: string
  examinationType: string
}

export interface TransferIntent {
  transferContent: string
  qrCodeUrl?: string
  bankName?: string
  accountName?: string
  accountNumber?: string
  expiresAt?: string
}

export interface Invoice {
  id: string
  encounterId: string
  encounterCode: string
  patientId: string
  patientName: string
  patientCode: string
  examinationType: string
  items: BillableItem[]
  subtotal: number
  discount: number
  total: number
  status: PaymentStatus
  paymentMethod?: PaymentMethod
  createdAt: string
  updatedAt: string
  paidAt?: string
  cashierName?: string
  transactionReference?: string
  transferIntent?: TransferIntent
  isPaid: boolean
}

export interface BillableItem {
  id: string
  name: string
  unitPrice: number
  quantity: number
  amount: number
  category?: string
}

export interface PaymentListParams {
  status?: PaymentStatusFilter
  search?: string
  page?: number
  pageSize?: number
}

export interface PaymentListResult {
  data: Invoice[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaymentCounters {
  unpaid: number
  pendingTransfer: number
  needsAttention: number
  paidToday: number
}
```

`isPaid` is a temporary compatibility field for the existing reception dialog and must remain synchronized with `status === "PAID"` through Task 2. Re-export the billing types from `src/modules/reception/types/index.ts` temporarily so the existing dialog and tests compile until Task 3 removes both compatibility surfaces.

- [ ] **Step 4: Extend the existing store and add the billing facade**

Keep `invoicesStore` in `src/modules/reception/api/index.ts`, convert the seed invoice to the explicit status model, and add these internal adapter operations: `listInvoiceRecords`, `getInvoiceRecord`, `startTransferRecord`, `settleCashRecord`, `confirmTransferRecord`, `getInvoiceCounters`, and `resetInvoiceStore`. Preserve the existing `fetchInvoiceByEncounter(encounterId)` and `processPayment(dto)` signatures as compatibility functions through Task 2; keep `isPaid` synchronized only until Task 3 removes the old dialog.

Implement the public billing facade in `src/modules/billing/api/index.ts` with these exact signatures:

```ts
export async function fetchPayments(
  params: PaymentListParams = {}
): Promise<PaymentListResult>
export async function fetchPaymentCounters(): Promise<PaymentCounters>
export async function fetchInvoiceByEncounter(
  encounter: BillableEncounter
): Promise<Invoice>
export async function startTransferPayment(input: {
  encounter: BillableEncounter
}): Promise<Invoice>
export async function processCashPayment(input: {
  encounterId: string
  discount?: number
}): Promise<Invoice>
export async function recordTransferConfirmation(input: {
  encounterId: string
  transactionReference?: string
}): Promise<Invoice>
export function resetBillingStore(): void
```

`fetchPayments()` searches patient name/code/encounter code, filters by status, sorts newest `updatedAt` first, and paginates. `startTransferPayment()` sets `paymentMethod: "TRANSFER"`, `status: "PENDING"`, and `transferIntent.transferContent` to the encounter code; it never creates `qrCodeUrl`. Finalization is idempotent and advances `WAITING_PAYMENT` encounters to `WAITING_RESULT` inside the same existing adapter.

- [ ] **Step 5: Run adapter and regression tests**

```bash
pnpm test -- src/modules/billing/__tests__/billing-api.test.ts src/modules/reception/__tests__/reception.test.tsx
```

Expected: PASS, including the legacy reception payment tests through the temporary compatibility functions.

- [ ] **Step 6: Commit the adapter boundary**

```bash
git add src/modules/billing/types/index.ts src/modules/billing/api/index.ts src/modules/billing/__tests__/billing-api.test.ts src/modules/reception/types/index.ts src/modules/reception/api/index.ts
git commit -m "feat(billing): add payment domain facade"
```

### Task 2: Add billing query hooks and cache synchronization

**Files:**
- Create: `src/modules/billing/hooks/use-billing.ts`
- Create: `src/modules/billing/__tests__/use-billing.test.tsx`

**Interfaces:**
- Consumes: all Task 1 billing API functions and `RECEPTION_WORKLIST_KEY` / `RECEPTION_COUNTERS_KEY` from reception hooks.
- Produces: `BILLING_LIST_KEY`, `BILLING_COUNTERS_KEY`, `BILLING_INVOICE_KEY()`, `usePayments()`, `usePaymentCounters()`, `useInvoice()`, `useStartTransferPayment()`, `useProcessCashPayment()`.

- [ ] **Step 1: Write failing query invalidation tests**

Create a test harness with a fresh `QueryClient` and test that starting a transfer updates the invoice cache, while cash completion invalidates billing list/counters and reception list/counters:

```tsx
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const { result } = renderHook(() => useProcessCashPayment(), { wrapper })
await act(async () => {
  await result.current.mutateAsync({ encounterId: waitingEncounter.id })
})

expect(queryClient.getQueryState(BILLING_LIST_KEY)?.isInvalidated).toBe(true)
expect(queryClient.getQueryState(RECEPTION_WORKLIST_KEY)?.isInvalidated).toBe(true)
```

Seed each query with `queryClient.setQueryData()` before asserting invalidation so the test observes a real cache entry.

- [ ] **Step 2: Run the hook test and verify failure**

```bash
pnpm test -- src/modules/billing/__tests__/use-billing.test.tsx
```

Expected: FAIL because the billing hooks do not exist.

- [ ] **Step 3: Implement query keys and hooks**

Use stable keys and enabled/refetch rules:

```ts
export const BILLING_LIST_KEY = ["billing", "payments"] as const
export const BILLING_COUNTERS_KEY = ["billing", "counters"] as const
export const BILLING_INVOICE_KEY = (encounterId: string) =>
  ["billing", "invoice", encounterId] as const

export function usePayments(params: PaymentListParams) {
  return useQuery({
    queryKey: [...BILLING_LIST_KEY, params],
    queryFn: () => fetchPayments(params),
    refetchInterval: 10_000,
  })
}

export function usePaymentCounters() {
  return useQuery({
    queryKey: BILLING_COUNTERS_KEY,
    queryFn: fetchPaymentCounters,
    refetchInterval: 10_000,
  })
}
```

`useInvoice(encounter, enabled)` polls every three seconds only while enabled and the cached invoice is `PENDING`. Mutation success handlers must update the detail cache and invalidate billing/reception lists and counters. Do not add a realtime dependency; future SSE/WebSocket listeners only need to invalidate these keys.

- [ ] **Step 4: Run hook and adapter tests**

```bash
pnpm test -- src/modules/billing/__tests__/use-billing.test.tsx src/modules/billing/__tests__/billing-api.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit query ownership**

```bash
git add src/modules/billing/hooks/use-billing.ts src/modules/billing/__tests__/use-billing.test.tsx
git commit -m "feat(billing): add payment query hooks"
```

### Task 3: Move and redesign the shared payment dialog

**Files:**
- Create: `src/modules/billing/components/payment-dialog.tsx`
- Create: `src/modules/billing/__tests__/payment-dialog.test.tsx`
- Delete: `src/modules/reception/components/payment-dialog.tsx`
- Modify: `src/modules/reception/hooks/use-reception.ts:1-100`
- Modify: `src/modules/reception/api/index.ts:payment compatibility exports`
- Modify: `src/modules/reception/types/index.ts:payment compatibility exports`
- Modify: `src/modules/reception/__tests__/reception.test.tsx:1-180`
- Modify: `src/modules/reception/index.ts`

**Interfaces:**
- Consumes: `BillableEncounter`, `Invoice`, and billing hooks from Tasks 1-2; existing `Dialog`, `Button`, `Table`, `Badge`, `Checkbox`, `Alert`, and `Skeleton` primitives.
- Produces:

```ts
export interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  encounter: BillableEncounter | null
  onPaid?: (invoice: Invoice) => void
}

export function PaymentDialog(props: PaymentDialogProps): React.JSX.Element | null
```

- [ ] **Step 1: Write status-driven dialog tests**

Cover these behaviors with Testing Library:

```tsx
it("closes a pending transfer without cancelling it", async () => {
  const onOpenChange = vi.fn()
  renderWithClient(
    <PaymentDialog open onOpenChange={onOpenChange} encounter={waitingEncounter} />
  )

  await userEvent.click(await screen.findByRole("button", { name: "Chuyển khoản" }))
  await userEvent.click(screen.getByRole("button", { name: "Tạo yêu cầu chuyển khoản" }))
  await screen.findByText("Đang chờ ngân hàng xác nhận")
  await userEvent.click(screen.getByRole("button", { name: "Đóng và tiếp tục" }))

  expect(onOpenChange).toHaveBeenCalledWith(false)
  expect((await fetchInvoiceByEncounter(waitingEncounter)).status).toBe("PENDING")
})

it("does not render a simulated QR when the backend provides no QR payload", async () => {
  await startTransferPayment({ encounter: waitingEncounter })
  renderWithClient(
    <PaymentDialog open onOpenChange={vi.fn()} encounter={waitingEncounter} />
  )

  expect(await screen.findByText("Chưa nhận được mã QR")).toBeInTheDocument()
  expect(screen.queryByLabelText("Mã QR thanh toán")).not.toBeInTheDocument()
})
```

Also test loading, invoice error with retry, cash double-click protection, paid read-only state, copy feedback, and keyboard selection of the two payment methods.

- [ ] **Step 2: Run the dialog tests and verify failure**

```bash
pnpm test -- src/modules/billing/__tests__/payment-dialog.test.tsx
```

Expected: FAIL because the billing dialog does not exist.

- [ ] **Step 3: Implement the redesigned dialog**

Use the existing two-column desktop layout and a single-column narrow layout. The right column must switch by invoice state:

```text
UNPAID + CASH     -> amount due and explicit cash confirmation
UNPAID + TRANSFER -> create-transfer action
PENDING           -> transfer details, pending indicator, close-and-continue
PAID              -> paid summary and done
EXPIRED / FAILED  -> attention alert and retry action only where adapter supports it
```

Render `<img alt="Mã QR thanh toán">` only when `transferIntent.qrCodeUrl` exists. Delete the simulated inline SVG and all hardcoded bank data. Use semantic tokens and Hugeicons already installed; do not add color variables.

Use `isPending` to disable cash submission immediately. When a refetch changes the invoice to `PAID`, invoke `onPaid` at most once using a ref keyed by invoice ID and `paidAt`; do not close the dialog automatically.

- [ ] **Step 4: Remove migration compatibility and update reception tests**

Import `PaymentDialog` from `@/modules/billing` in reception tests and remove the reception component export. Remove `INVOICE_DETAIL_KEY`, `useInvoice`, and `useProcessPayment` from `src/modules/reception/hooks/use-reception.ts`; remove the legacy `fetchInvoiceByEncounter`, `processPayment`, and `ProcessPaymentDto` compatibility surfaces from reception; remove the temporary `isPaid` field from `Invoice`. Preserve the existing test that verifies reception cannot add clinical services, but update cash confirmation assertions to the new button labels and paid state.

- [ ] **Step 5: Run dialog and reception tests**

```bash
pnpm test -- src/modules/billing/__tests__/payment-dialog.test.tsx src/modules/reception/__tests__/reception.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the shared dialog**

```bash
git add src/modules/billing/components/payment-dialog.tsx src/modules/billing/__tests__/payment-dialog.test.tsx src/modules/reception/components/payment-dialog.tsx src/modules/reception/hooks/use-reception.ts src/modules/reception/api/index.ts src/modules/reception/types/index.ts src/modules/reception/__tests__/reception.test.tsx src/modules/reception/index.ts
git commit -m "feat(billing): redesign shared payment dialog"
```

### Task 4: Build the operational payment worklist

**Files:**
- Create: `src/modules/billing/components/payment-status-badge.tsx`
- Create: `src/modules/billing/components/payment-counters-strip.tsx`
- Create: `src/modules/billing/components/payment-table.tsx`
- Create: `src/modules/billing/pages/payment-worklist-page.tsx`
- Create: `src/modules/billing/__tests__/payment-worklist.test.tsx`
- Create: `src/modules/billing/index.ts`

**Interfaces:**
- Consumes: billing hooks, `PaymentDialog`, `PageHeader`, `DataTablePagination`, `Table`, `Tabs`, `Input`, `Button`, `Badge`, and existing semantic tokens.
- Produces: `PaymentWorklistPage`, public billing exports, and URL state `status`, `q`, `page`.

- [ ] **Step 1: Write failing worklist tests**

Mock URL state explicitly instead of assuming a router-enabled render helper:

```tsx
const navigation = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
  replace: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  usePathname: () => "/billing",
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => navigation.searchParams,
}))
```

Test the durable operational behaviors:

```tsx
it("opens the same pending payment from the worklist", async () => {
  await startTransferPayment({ encounter: waitingEncounter })
  renderWithClient(<PaymentWorklistPage />)

  expect(await screen.findByText(waitingEncounter.patientName)).toBeInTheDocument()
  expect(screen.getByText("Đang chờ chuyển khoản")).toBeInTheDocument()
  await userEvent.click(screen.getByRole("button", { name: /Xem thanh toán/i }))

  expect(await screen.findByText("Đang chờ ngân hàng xác nhận")).toBeInTheDocument()
})

it("removes a paid item from the pending filter after refresh", async () => {
  const pending = await startTransferPayment({ encounter: waitingEncounter })
  navigation.searchParams = new URLSearchParams("status=PENDING")
  renderWithClient(<PaymentWorklistPage />)
  expect(await screen.findByText(waitingEncounter.patientName)).toBeInTheDocument()

  await recordTransferConfirmation({ encounterId: pending.encounterId })
  await userEvent.click(screen.getByRole("button", { name: "Làm mới" }))

  expect(await screen.findByText("Không có thanh toán phù hợp")).toBeInTheDocument()
})
```

Add cases for loading skeletons, retryable list error, empty results, search, counter filtering, pagination, and invalid `status=UNKNOWN&page=-4` normalization to `ALL` and page `1`.

- [ ] **Step 2: Run the page tests and verify failure**

```bash
pnpm test -- src/modules/billing/__tests__/payment-worklist.test.tsx
```

Expected: FAIL because the worklist components do not exist.

- [ ] **Step 3: Implement the status badge and summary strip**

Map every `PaymentStatus` exhaustively to an icon, Vietnamese label, and existing semantic status tokens. Use these labels:

```text
UNPAID  -> Chờ thu tiền
PENDING -> Đang chờ chuyển khoản
PAID    -> Đã thanh toán
EXPIRED -> Mã đã hết hạn
FAILED  -> Cần kiểm tra
```

The summary strip contains `Chờ thu tiền`, `Chờ chuyển khoản`, `Cần kiểm tra`, and `Đã thanh toán hôm nay`. Each filterable card is a semantic button with visible focus state and `aria-pressed`.

- [ ] **Step 4: Implement the table**

Use the existing `Table` primitives and keep identity visible. Right-align monetary values with `formatVND` from `@/shared/ui`. Row action labels must follow the spec exactly: `Thu phí`, `Xem thanh toán`, or `Xử lý`; paid rows also use `Xem thanh toán` until a real receipt renderer exists. Loading uses table-row skeletons; empty state uses a message and no decorative analytics.

- [ ] **Step 5: Implement URL-owned worklist state**

In `PaymentWorklistPage`, parse `status`, `q`, and `page` from `useSearchParams()`. Normalize status against the closed `PaymentStatusFilter` set and page to a positive integer. Use `router.replace()` to preserve shareable filters and reset page to `1` when search or status changes.

Use `PageHeader` with:

```tsx
<PageHeader
  breadcrumbs={[{ label: "Bàn tiếp đón", href: "/reception" }, { label: "Thanh toán" }]}
  title="Danh sách thu phí"
  description="Theo dõi các khoản chờ thu, chuyển khoản đang xử lý và thanh toán trong ngày"
  actions={<Button variant="outline" onClick={() => refetch()}>Làm mới</Button>}
/>
```

Render the shared `PaymentDialog` for the selected row. A background status change updates the list but never opens the dialog or changes focus.

- [ ] **Step 6: Export the billing public API**

`src/modules/billing/index.ts` exports domain types, hooks, `PaymentDialog`, `PaymentStatusBadge`, and `PaymentWorklistPage`. Do not export test-only helpers beyond the existing in-memory adapter reset function used by tests.

- [ ] **Step 7: Run the worklist test suite**

```bash
pnpm test -- src/modules/billing/__tests__/payment-worklist.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit the worklist**

```bash
git add src/modules/billing/components src/modules/billing/pages src/modules/billing/__tests__/payment-worklist.test.tsx src/modules/billing/index.ts
git commit -m "feat(billing): add payment worklist"
```

### Task 5: Add non-blocking payment completion notification

**Files:**
- Create: `src/modules/billing/components/payment-completion-notifier.tsx`
- Create: `src/modules/billing/__tests__/payment-completion-notifier.test.tsx`
- Modify: `src/modules/billing/index.ts`
- Modify: `src/widgets/app-shell/app-shell.tsx`

**Interfaces:**
- Consumes: `usePayments({ status: "PAID", page: 1, pageSize: 10 })`, `formatVND`, semantic tokens, and `next/link`.
- Produces: `PaymentCompletionNotifier`, a passive `aria-live="polite"` application notification mounted once in `AppShell`.

- [ ] **Step 1: Write the failing notification test**

Mock the paid-payment hook with a mutable result so the first render establishes a baseline and a later render adds one paid invoice. Assert no initial notification, then assert the new payment appears without opening a dialog or moving focus:

```tsx
const queryState = vi.hoisted(() => ({ paidInvoices: [] as Invoice[] }))

vi.mock("../hooks/use-billing", () => ({
  usePayments: () => ({
    data: {
      data: queryState.paidInvoices,
      page: 1,
      pageSize: 10,
      total: queryState.paidInvoices.length,
      totalPages: 1,
    },
    isSuccess: true,
  }),
}))

it("announces only payments that become paid after the notifier mounts", async () => {
  const { rerender } = render(<PaymentCompletionNotifier />)
  expect(screen.queryByRole("status")).not.toBeInTheDocument()

  queryState.paidInvoices = [newlyPaidInvoice]
  rerender(<PaymentCompletionNotifier />)

  expect(await screen.findByRole("status")).toHaveTextContent(
    "Thanh toán thành công"
  )
  expect(screen.getByText(newlyPaidInvoice.patientName)).toBeInTheDocument()
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
})
```

Also assert that dismissing the notification preserves the current focused element and that the action link targets `/billing?status=PAID` without placing patient identity in the URL.

- [ ] **Step 2: Run the notifier test and verify failure**

```bash
pnpm test -- src/modules/billing/__tests__/payment-completion-notifier.test.tsx
```

Expected: FAIL because `PaymentCompletionNotifier` does not exist.

- [ ] **Step 3: Implement the passive notifier**

On the first successful query, store the returned paid invoice IDs in a ref without notifying. On later query results, select the first unseen paid invoice, add all returned IDs to the ref, and render a fixed non-modal status card with:

```text
Thanh toán thành công
{patientName} · {formatted total}
[Xem danh sách] [Đóng]
```

Use `role="status"`, `aria-live="polite"`, and existing surface/border/status tokens. Do not call `.focus()`, open a dialog, issue a browser notification, or persist seen IDs outside component memory. Auto-dismiss after eight seconds and clear the timer on unmount.

- [ ] **Step 4: Mount once in the app shell**

Export the notifier from `src/modules/billing/index.ts` and render it after the shell content in `AppShell`. This makes webhook/polling transitions visible while the receptionist is working on another patient without blocking the current task.

- [ ] **Step 5: Run notifier and billing tests**

```bash
pnpm test -- src/modules/billing/__tests__/payment-completion-notifier.test.tsx src/modules/billing
```

Expected: PASS.

- [ ] **Step 6: Commit the notifier**

```bash
git add src/modules/billing/components/payment-completion-notifier.tsx src/modules/billing/__tests__/payment-completion-notifier.test.tsx src/modules/billing/index.ts src/widgets/app-shell/app-shell.tsx
git commit -m "feat(billing): notify completed payments"
```

### Task 6: Add the route, integrate reception, and verify end to end

**Files:**
- Create: `src/app/billing/page.tsx`
- Modify: `src/modules/reception/pages/reception-page.tsx:9-35, payment dialog rendering`
- Modify: `src/modules/reception/__tests__/reception.test.tsx`

**Interfaces:**
- Consumes: `PaymentWorklistPage` and `PaymentDialog` from the billing module; existing `AppShell`, `Skeleton`, and reception encounter selection.
- Produces: accessible `/billing` route and shared payment behavior from both entry points.

- [ ] **Step 1: Write the failing reception integration test**

Update the reception test to start a transfer, close the dialog, reopen the same patient, and assert the pending state remains:

```tsx
it("reopens a transfer that was left pending", async () => {
  renderWithClient(<ReceptionPage />)
  await userEvent.click(await screen.findByRole("button", { name: "Thu phí" }))
  await userEvent.click(screen.getByRole("button", { name: "Chuyển khoản" }))
  await userEvent.click(screen.getByRole("button", { name: "Tạo yêu cầu chuyển khoản" }))
  await userEvent.click(screen.getByRole("button", { name: "Đóng và tiếp tục" }))
  await userEvent.click(screen.getByRole("button", { name: "Thu phí" }))

  expect(await screen.findByText("Đang chờ ngân hàng xác nhận")).toBeInTheDocument()
})
```

Add a cash-payment integration test that completes payment, asserts the worklist refreshes, and asserts `screen.queryByRole("heading", { name: "In giấy khám bệnh" })` remains absent. This prevents the examination form from being used as a payment receipt.

- [ ] **Step 2: Run the integration test and verify failure**

```bash
pnpm test -- src/modules/reception/__tests__/reception.test.tsx
```

Expected: FAIL until reception imports and uses the billing dialog.

- [ ] **Step 3: Add the Next.js route**

Follow `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` and `14-metadata-and-og-images.md`. Create a Server Component route with static metadata and a suspense fallback:

```tsx
import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { PaymentWorklistPage } from "@/modules/billing"
import { AppShell } from "@/widgets/app-shell/app-shell"

export const metadata: Metadata = {
  title: "Thanh toán — Ngọc Khánh Clinic",
  description: "Danh sách thu phí và theo dõi thanh toán tại Phòng Khám Ngọc Khánh",
}

export default function BillingRoute() {
  return (
    <AppShell>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <PaymentWorklistPage />
      </Suspense>
    </AppShell>
  )
}
```

- [ ] **Step 4: Integrate the shared dialog into reception**

Replace the local reception dialog import with `PaymentDialog` from `@/modules/billing`. Preserve the existing selected encounter and refresh callbacks. Remove the current behavior that opens `PrintExaminationDialog` after a payment, because that component prints an examination form rather than a payment receipt. When a transfer is merely closed, do not invoke the paid callback or any print dialog.

- [ ] **Step 5: Run all feature tests**

```bash
pnpm test -- src/modules/billing src/modules/reception/__tests__/reception.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Run repository verification**

Run each command independently and record the result:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all commands exit `0`. If a failure comes from unrelated pre-existing working-tree changes, capture the exact command and failure without modifying unrelated files.

- [ ] **Step 7: Manually verify both entry points**

With the existing local development server:

1. Open `/reception`, filter `Chờ thu phí`, and open Lê Đức Anh.
2. Select transfer, create the pending request, and choose `Đóng và tiếp tục`.
3. Open `/billing`; verify the same invoice appears under `Đang chờ chuyển khoản`.
4. Reopen it and verify invoice identity, patient, amount, transfer content, and missing-QR state are preserved.
5. Switch to a narrow viewport and verify identity, amount, status, and row action remain usable without horizontal page overflow.
6. Verify keyboard focus returns to the invoking row action after closing the dialog.

- [ ] **Step 8: Commit the route and integration**

```bash
git add src/app/billing/page.tsx src/modules/reception/pages/reception-page.tsx src/modules/reception/__tests__/reception.test.tsx
git commit -m "feat(billing): integrate payment worklist"
```
