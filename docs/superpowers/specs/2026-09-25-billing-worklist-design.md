# Billing Worklist Design

## Purpose

Create an operational payment worklist at `/billing` so reception staff can close a payment dialog, continue serving another patient, and later reopen or verify the unfinished payment without losing its state.

This is a cashier-facing workflow, not an accounting, reconciliation, refund, or revenue-reporting system.

## Intended User and Success Criteria

The primary user is a receptionist who also collects fees.

The change is successful when the receptionist can:

- start or inspect a payment from the reception worklist;
- close a pending bank-transfer dialog without cancelling the payment;
- find that payment later in a dedicated list;
- distinguish unpaid, transfer-pending, paid, and attention-required records;
- reopen the same payment detail instead of creating a duplicate payment;
- see payment completion without the UI stealing focus from the current patient workflow.

## Scope

### Included

- A `/billing` route using the existing application shell.
- A payment worklist with operational summary counts, status filters, search, and row actions.
- A redesigned payment dialog shared by reception and the payment worklist.
- Persistent pending-transfer state in the frontend data adapter.
- Background refresh behavior that updates the list after backend payment state changes.
- Loading, empty, error, pending, paid, expired, and failed UI states.
- Behavioral tests for the list, dialog lifecycle, and query invalidation.

### Excluded

- Accounting reports or end-of-day reconciliation.
- Refunds, partial payments, split payments, insurance settlement, and corporate invoicing.
- Editing clinical service charges from the payment screen.
- A frontend webhook receiver. Payment-provider webhooks terminate at the backend.
- Browser storage as a source of truth for payment state.

## Chosen Approach

Build a dedicated operational payment worklist while retaining the existing payment dialog as the focused action surface.

The rejected alternatives are:

1. Reception-only filtering. This is smaller, but completed payments leave the reception queue and pending transfers become difficult to find later.
2. A full billing subsystem. This would introduce accounting workflows and contracts that are not required for the current reception use case.

The dedicated worklist provides durable visibility without expanding into unsupported financial operations.

## Information Architecture

The page has four layers:

1. Page header: title, concise workflow description, and refresh status.
2. Operational summary strip: awaiting collection, pending transfer, needs attention, and paid today.
3. Filter and search controls: status tabs plus search by patient name, patient code, encounter code, or phone number.
4. Payment table: the authoritative operational list.

The table columns are:

```text
Created time
Encounter / patient identity
Amount
Payment method
Payment status
Last updated
Action
```

Identity remains visible and amounts are right-aligned. Status always includes text and an icon; color is supplementary.

## Payment Status Model

The frontend uses an explicit status union rather than relying only on `isPaid`:

```text
UNPAID   -> payment has not started
PENDING  -> transfer intent exists and confirmation is pending
PAID     -> backend has confirmed payment
EXPIRED  -> transfer intent can no longer be used
FAILED   -> payment needs staff attention
```

Row actions are status-dependent:

```text
UNPAID   -> Collect payment
PENDING  -> View payment
PAID     -> View receipt
EXPIRED  -> Reopen and create a new transfer intent
FAILED   -> Inspect
```

The backend remains authoritative. Duplicate webhook delivery and duplicate payment submission must be handled idempotently by the backend contract.

## Payment Dialog UX

### Cash

- Show the amount due as the main visual anchor.
- Keep the explicit action `Confirm collected {amount}`.
- Disable duplicate submission while the mutation is pending.
- Close only after the backend confirms the cash payment.

### Bank transfer awaiting confirmation

- Show the QR payload supplied by the data contract, amount, bank details, and transfer content.
- Provide a copy action with visible success feedback.
- Replace `Cancel` with `Close and continue`.
- Explain that closing does not cancel the payment and monitoring continues.
- Do not provide a manual `Confirm paid` action when automatic confirmation is expected.
- Do not automatically close or reopen the dialog when payment completes.

### Paid

- Replace the QR area with a compact success state.
- Show amount, paid time, method, and transaction reference when available.
- Lock payment controls.
- Offer `Print receipt` and `Done` actions.

### Closing while pending

Closing the dialog only removes the overlay. It does not change the payment status. The payment remains visible under `Pending transfer` in `/billing`, and reopening it retrieves the latest server state.

If payment completes while another workflow is active, update cached lists and show a non-blocking notification. Never open a dialog or move focus automatically.

## Data and State Flow

```text
Payment list or reception row
  -> open shared payment dialog
  -> billing query/mutation hook
  -> billing API adapter
  -> backend payment contract

Provider webhook
  -> backend verifies and records payment
  -> frontend observes the new invoice status
  -> TanStack Query updates invoice, payment list, reception worklist, and counters
```

TanStack Query owns invoice and payment-list server state. React state owns only transient UI selection and disclosure. No payment state is stored in Zustand or local storage.

The frontend observation mechanism is transport-neutral: realtime events may invalidate the relevant query keys, while polling remains a safe fallback. Reopening the dialog always performs or triggers a fresh invoice read.

## Module Boundaries

```text
src/app/billing/page.tsx
  -> route composition, metadata, suspense boundary

src/modules/billing/
  -> payment models, API adapter, query hooks, list page, list components
  -> shared payment dialog exported through the module public API

src/modules/reception/
  -> imports the payment dialog from the billing module
  -> retains reception worklist behavior only
```

Existing shadcn primitives are reused: `Button`, `Dialog`, `Table`, `Badge`, `Checkbox`, `Alert`, `Skeleton`, and `Tabs`. No new primitive wrapper is required.

## Current Adapter Constraint

The repository currently uses an in-memory reception API adapter and has no independent payment-list endpoint or webhook/realtime contract. Implementation will not add new demo patients or invoices. It will expose the existing invoice store through a billing-list adapter and persist pending-transfer state there so the complete frontend behavior is testable in the current application. The adapter will not fabricate a usable QR payload; when no backend QR data exists, the dialog will show a clear unavailable state while preserving the pending record.

Production integration requires the backend to provide equivalent capabilities:

- list payments with filters and stable pagination;
- fetch one payment/invoice by encounter or invoice ID;
- create or retrieve a transfer intent;
- return authoritative payment status and timestamps;
- reject duplicate payment finalization safely.

The frontend adapter boundary prevents the UI from depending on the current in-memory implementation.

## Error and Edge States

- List load failure: show an inline error state with retry.
- Invoice load failure: keep the dialog open and allow retry.
- Transfer-intent failure: do not display a fake QR; explain that the code could not be created.
- Expired transfer: remove the active QR and provide a deliberate retry action.
- Already paid: show the paid read-only view and prevent resubmission.
- Empty filter: explain that no payments match and preserve the filters.
- Partial data: display available identity data and mark unavailable fields instead of fabricating values.

## Accessibility and Responsive Behavior

- Desktop-first table layout consistent with reception.
- On narrow screens, preserve identity, amount, status, and action; secondary details may stack.
- Payment-method choices are keyboard-operable and expose selected state.
- Dialog focus remains trapped while open and returns to the invoking control when closed.
- Status is never communicated by color alone.
- Refreshes and webhook-driven changes do not steal focus.
- Reduced-motion preferences are respected.

## Testing

Tests cover:

- rendering each payment status and its correct action;
- filtering and searching the payment worklist;
- opening the same payment from reception and `/billing`;
- closing a pending transfer without changing its status;
- reopening a pending transfer with current data;
- transitioning a pending payment to paid and invalidating all relevant queries;
- preventing cash or transfer payment duplication;
- loading, empty, error, and already-paid dialog states;
- keyboard-accessible payment-method selection and dialog closure.

## Verification

Run the repository checks after implementation:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Manually verify `/reception` and `/billing` at desktop and narrow viewport widths, including closing and reopening a pending transfer.
