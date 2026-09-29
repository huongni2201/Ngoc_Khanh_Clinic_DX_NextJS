# Ngọc Khánh Clinic Frontend — Project Rules

> Mandatory production frontend rules. A later accepted ADR may supersede a rule.

## 1. Product Scope

This is a **real production clinic application**.

Current MVP priority:

```text
Organization
→ Health Examination Batch
→ Participant Roster
→ Excel Import
→ Validation
→ Bulk Selection
→ Mẫu số 03 Preview
→ Bulk Print
→ Participant Check-in
→ Patient Link/Create
→ Encounter
```

Organization/corporate health checks are the current primary vertical slice.

---

## 2. Production Baseline

```text
Node.js            24.21.0 LTS
pnpm                11.26.0
Next.js             16.3.5
ESLint              10.11.0
eslint-config-next  16.3.5
shadcn/ui           Mira
Typography          Inter
Icons               Hugeicons
```

Rules:

- Use pnpm only.
- Do not use canary/beta/RC dependencies in production.
- Do not upgrade major framework/tooling versions casually.
- Keep `pnpm-lock.yaml` committed.
- Long-lived stack changes require an ADR.
- Do not use `latest` blindly for core dependencies.

---

## 3. Frontend Architecture

Use:

```text
Next.js App Router
+
Domain / Module-Based Architecture
```

Canonical structure:

```text
src/
├── app/
├── components/
│   └── ui/
├── modules/
├── shared/
├── widgets/
├── providers/
└── lib/
```

### `src/app`

Allowed: routes, layouts, metadata, loading/error/not-found boundaries, route-level composition.

Do not put domain business logic, API implementation, validation engines or large reusable feature components here.

### `src/components/ui`

Contains shadcn/ui primitives and intentionally maintained primitive variants.

### `src/modules`

Contains domain/business feature code.

Initial modules may include:

```text
auth/
organizations/
health-examinations/
participants/ (owned by health-examinations)
health-check-print/
```

Later:

```text
patients/
encounters/
reception/
clinical/
diagnostics/
billing/
```

A module may contain only what it needs:

```text
api/
components/
features/
hooks/
pages/
schemas/
types/
utils/
index.ts
```

Do not create empty folder trees speculatively.

### `src/shared`

Contains application-level reusable frontend code not owned by one business module.

Examples:

```text
shared/api/
shared/components/data-table/
shared/components/empty-state/
shared/components/error-state/
shared/components/page-header/
shared/hooks/
shared/config/
shared/types/
```

Do not place domain entities or domain rules in `shared`.

### `src/widgets`

Contains large reusable application compositions such as app shell, app header/sidebar, patient search or status summary.

### `src/lib`

Small framework/shadcn utilities only. Do not turn it into a business-logic dumping ground.

---

## 4. Reuse-First UI Policy — Mandatory

Before creating new UI code, search for existing implementations.

Priority:

```text
Existing module component
  ↓
Existing src/shared component
  ↓
Existing src/components/ui shadcn primitive
  ↓
Available shadcn registry component
  ↓
Composition of existing primitives
  ↓
New reusable component
```

Rules:

- Do not reimplement a primitive already provided by shadcn/ui.
- Do not create one-to-one wrappers with no added behavior.
- Do not duplicate reusable components across modules.
- Do not copy an existing component merely to change spacing/color.
- Prefer props, variants, composition and shared abstractions.
- New cross-module reusable app components belong in `src/shared`.
- Domain-specific components stay inside their owning module.
- A custom primitive requires a clear functional gap.

Examples that should normally reuse shadcn:

```text
Button
Input
Label
Dialog
Sheet
Select
Checkbox
RadioGroup
Tabs
Table
Badge
Card
Calendar
Popover
Tooltip
Skeleton
Alert
DropdownMenu
```

Forbidden unless meaningful behavior is added:

```text
CustomButton
BaseButton
AppButton
CustomModal
AppModal
CustomSelect
BaseCheckbox
```

See ADR-0002.

---

## 5. Module Boundaries

Each module should expose its public contract through `index.ts`.

Preferred:

```ts
import { OrganizationListPage, type Organization } from '@/modules/organizations'
```

Avoid deep cross-module imports and circular dependencies.

Business-specific logic belongs close to the domain that owns it.

---

## 6. State Management

Use:

```text
TanStack Query   = server/API state
React Hook Form  = form state
Zod              = validation/schema boundaries
URL params       = shareable navigation/search/filter state
React state      = local transient UI state
Zustand          = cross-component client-only state
```

Rules:

- Do not mirror TanStack Query results into Zustand.
- Do not use Zustand merely to avoid passing a few local props.
- Do not store form state in Zustand when React Hook Form is the natural owner.
- Prefer URL state for shareable search/filter/sort state.

See ADR-0003.

---

## 7. Forms and Validation

Use React Hook Form + Zod.

Forms must handle field errors, form/server errors, submitting state, duplicate-submit prevention, accessible labels and accessible error associations.

Do not duplicate validation rules in multiple components.

### Validation Authority

Frontend validation improves user experience but is not authoritative. Backend
validation remains authoritative for required business data, duplicate identity,
organization scope, batch membership, participant uniqueness, service
eligibility, age eligibility, import confirmation and persistence constraints.

Frontend may validate early for immediate feedback, but it must still handle and
display backend validation results.

---

## 8. API Layer

Presentation components must not call Axios/fetch directly.

Preferred flow:

```text
Component
↓
Query/Mutation Hook
↓
Module API
↓
Shared HTTP Client
↓
Backend
```

Rules:

- Do not invent backend endpoints or DTO fields.
- Do not assume API DTO = frontend view model.
- Map DTOs explicitly when UI/domain models differ.
- Normalize API errors.
- Treat backend-calculated financial totals as authoritative.

See ADR-0004.

### Backend Contract Is Authoritative

For features backed by an existing backend implementation, the backend HTTP
contract is the authoritative source of truth.

Priority:

1. Backend endpoint and HTTP method
2. Backend request/response DTO
3. Backend pagination/error envelope
4. Frontend transport DTO
5. Frontend mapper
6. Frontend view model
7. UI

Existing frontend mocks, temporary types, fixtures, UI assumptions and legacy
routes must not override an existing backend contract. If the UI needs a
different shape, add a mapper/view model instead of changing the transport
contract.

### Transport DTO vs View Model

Types representing HTTP request/response payloads must match backend contracts
exactly. Transport DTOs must not contain frontend-only fields.

Use module-local mappers when the UI needs derived labels, formatted dates,
computed presentation state, combined values or table-specific fields:

```text
Backend DTO
→ Frontend Transport DTO
→ Mapper
→ View Model
→ UI
```

Never add fabricated fields such as `profileStatus: "VALID"` to a transport
DTO. A UI-only status is allowed only in a view model when the value can be
derived from an authoritative source.

### Existing Endpoint Rule

When a backend endpoint exists, frontend API code must call that endpoint as
implemented. Do not rename backend path segments locally for readability.

For example, the participant endpoint remains:

```http
GET /api/v1/organizations/{organizationId}/health-examination-batches/{batchId}/participant
```

Do not replace it with `/employees`, `/participants` or `/roster`. A route
rename is a backend contract change and must be implemented/versioned there
first.

### Backend Enum and Lifecycle Status Rule

Frontend transport types must preserve backend enum values exactly. Do not
simplify, rename, merge or invent backend statuses in transport DTOs.

UI labels may map these values to localized copy without changing the
underlying transport value:

```text
DRAFT             → Nháp
READY             → Sẵn sàng
IN_PROGRESS       → Đang khám
RESULT_PROCESSING → Đang xử lý kết quả
FINALIZED         → Đã hoàn tất chuyên môn
CLOSED            → Đã đóng
CANCELED          → Đã hủy
```

Centralize display mapping and use exhaustive handling where practical.

### No Runtime Mock Fallback

Production API code must never silently fall back to mock, demo or in-memory
data when an endpoint is unavailable, a request fails or an integration is
unfinished.

Use an explicit loading, error, unavailable or disabled state instead. Test
fixtures, test mocks and isolated development-only fixtures that cannot execute
in production paths are allowed.

### TanStack Query Key Factory

Modules with related list, detail and mutation queries must centralize query
keys. Do not duplicate key fragments across hooks.

```ts
export const participantKeys = {
  all: ["health-examination-batch-participants"] as const,
  batch: (organizationId: string, batchId: string) =>
    [...participantKeys.all, organizationId, batchId] as const,
  list: (organizationId: string, batchId: string, params: ParticipantListParams) =>
    [...participantKeys.batch(organizationId, batchId), "list", params] as const,
}
```

Mutations must invalidate with the same factory and the batch-level prefix.
Prefer module-local factories; do not create a global query-key framework.

### Date and Time Contract

Preserve backend date/time values in API, cache and application layers:

```text
LocalDate:      2026-09-29
OffsetDateTime: 2026-09-29T18:30:00+07:00
```

Do not store presentation-formatted values such as `29/09/2026` in transport
DTOs, cache data or application state. Format dates only at the presentation
boundary.

---

## 9. Server / Client Components

Default to Server Components where useful.

Use `'use client'` only when required for event handlers, browser APIs, interactive local state, React Query hooks, client-side forms or client-only libraries.

Do not mark entire route trees as client components unnecessarily.

---

## 10. Domain Rules

Organization health-examination hierarchy:

```text
Organization
  └── HealthExaminationBatch
        └── HealthExaminationParticipant
```

`HealthExaminationParticipant` and `Patient` are separate concepts.

Do not create Patient records for all imported participants.

Correct check-in flow:

```text
HealthExaminationParticipant
↓
Search Patient
├── found → Link
└── not found → Create
↓
Encounter
```

---

## 11. Corporate-First Routing

Primary routes should evolve around:

```text
/login
/health-check
/organizations/[organizationId]
/organizations/[organizationId]/health-examination-batches/[batchId]
/health-check/print/preview
```

Later:

```text
/reception
/doctor
/diagnostics
/billing
```

---

## 12. Excel Import

Excel import is P0.

```text
Download Template
→ Fill Template
→ Choose File
→ Upload
→ Backend Parse
→ Backend Validate
→ Validation Preview
→ Confirm Import
→ Persist
```

Column mapping is optional and is only introduced if the product explicitly
supports arbitrary customer spreadsheet formats. For the controlled clinic
template, backend parsing and validation are authoritative.

Frontend may provide early feedback for required fields, valid dates, age >= 18
on examination date, duplicate identity and leading-zero preservation, but it
must display backend validation results.

Never silently import invalid rows. Show row/cell errors. Keep parsing logic outside page components. Blocking invalid rows cannot enter bulk print.

---

## 13. Health Check Print

Use one shared Mẫu số 03 implementation for individual health check, enterprise bulk print and reprint.

```text
Source Data
↓
Mapper
↓
HealthCheckPrintModel
↓
Mẫu 03 Components
↓
Print Preview
↓
Browser Print
```

Never fabricate or prefill clinical findings from assumptions.

---

## 14. Print Workflow

Requirements:

```text
A4
deterministic page breaks
no dashboard chrome in print
preview before bulk print
visible batch count
reprint support
clear per-participant errors
```

---

## 15. UI / UX

Baseline:

```text
Mira + Inter + Hugeicons
```

Direction:

```text
healthcare enterprise
professional
calm
clean
desktop-first
low cognitive load
accessible
workflow-first
```

### Color & Design Token Discipline — Mandatory

- **No custom / arbitrary colors**: Forbidden to use arbitrary hex/rgb/hsl values (e.g. `#123456`, `rgb(...)`), Tailwind arbitrary values (e.g. `text-[#...]`, `bg-[#...]`, `border-[#...]`), inline style colors (`style={{ color: '...' }}`), or arbitrary unmapped palette classes (`bg-blue-500`, `text-slate-600`, `border-emerald-400`, etc.) in component code.
- **Single source of truth (`src/app/globals.css`)**: All colors MUST strictly be derived from the semantic design tokens defined in `src/app/globals.css` (Tailwind `@theme inline` variables, mapped via `:root` and `.dark`):
  - Surfaces / Backgrounds: `bg-background`, `bg-card`, `bg-popover`, `bg-muted`, `bg-accent`, `bg-secondary`, `bg-sidebar`
  - Foregrounds / Text: `text-foreground`, `text-card-foreground`, `text-popover-foreground`, `text-muted-foreground`, `text-accent-foreground`, `text-secondary-foreground`, `text-sidebar-foreground`
  - Actions / Primary: `bg-primary`, `text-primary-foreground`, `bg-sidebar-primary`, `text-sidebar-primary-foreground`
  - Feedback / Destructive: `bg-destructive`, `text-destructive`, `text-destructive-foreground`
  - Borders & Rings: `border-border`, `border-input`, `ring-ring`, `border-sidebar-border`, `ring-sidebar-ring`
  - Visualizations: `text-chart-1` ... `text-chart-5`, `bg-chart-1` ... `bg-chart-5`
- **Extending tokens**: If a new semantic color is genuinely required (e.g. clinic-specific status tokens like warning or success), it MUST be formally added as CSS variables in `src/app/globals.css` (for both `:root` and `.dark`) and registered under `@theme inline`, rather than invented ad-hoc inside a component.
- **Color accessibility**: Never communicate status by color alone (always pair color with an icon, badge text, or descriptive label).

Use progressive disclosure:

```text
Page   → primary workflow
Drawer → contextual details
Modal  → short focused action
Page   → complex multi-step task
```

---

## 16. Tables

Use TanStack Table for complex operational tables.

Support as needed: row/bulk selection, sorting, filtering, pagination, virtualization, sticky headers, column visibility and keyboard accessibility.

Keep identity columns visible where practical:

```text
Họ và tên
CCCD
```

---

## 17. Required UI States

Significant screens must handle applicable states:

```text
loading
empty
error
success
partial-data
permission-denied
```

Never leave a blank page on API failure.

---

## 18. Accessibility

Minimum:

- keyboard navigation;
- visible focus state;
- semantic buttons;
- labels linked to inputs;
- accessible dialogs;
- sufficient contrast;
- non-color status indicators;
- accessible table selection.

---

## 19. Security / Privacy

Healthcare data is sensitive.

Never expose secrets in browser source, log full patient payloads, store passwords/private keys, place sensitive clinical information into localStorage without review, or rely on hidden buttons for authorization.

Backend authorization is authoritative. Frontend RBAC is UX only.

---

## 20. TypeScript

Use strict TypeScript.

Avoid `any`, unsafe broad casts, duplicated enum/status strings and silent null assumptions.

Prefer `unknown`, Zod validation, discriminated unions and exhaustive handling.

---

## 21. Naming

Source identifiers use English. UI labels use Vietnamese.

```text
files             kebab-case
React components  PascalCase
functions/vars    camelCase
real constants    UPPER_SNAKE_CASE
```

Canonical clinic vocabulary:

- `Organization` is the domain term for an external unit participating in a group health examination; generic UI copy is “Đơn vị”.
- `Encounter` is the actual care interaction and is distinct from `Appointment` scheduling.
- `HealthExaminationBatch` is the group examination program/batch.
- `ClinicalService` is the catalog term for billable or performable clinic services.
- `ServiceRequest` is a clinical order; reports and results must not be named orders.
- `Enterprise` is legacy terminology and must not be introduced in new code.
- `Payment` is a transaction, `PaymentReceipt` is proof of collection, and `Invoice` is the charge artifact.
- `ReceptionWorklistStage` is a derived workflow/presentation state; do not use it as `EncounterStatus`, `PaymentStatus`, or diagnostic state.

---

## 22. Component Boundaries

Avoid giant components mixing data fetching, business rules, form state, table rendering, modal logic and printing.

Also avoid splitting tiny components without meaningful benefit. Optimize for cohesion.

---

## 23. Performance

Avoid premature optimization, but prevent obvious issues: server pagination for large datasets, virtualization when needed, no thousands of rendered rows, no unnecessary global state, debounce where useful, and avoid unnecessary `'use client'`.

---

## 24. Testing

Use Vitest + Testing Library. Use Playwright for critical E2E workflows.

Critical tests include organization creation, health-examination batch creation, Excel validation, under-18 rejection, duplicate identity, bulk selection, Mẫu số 03 mapping, print-batch preparation and participant check-in.

Tests verify behavior through public interfaces, not implementation details.

---

## 25. Dependency Policy

Before adding a dependency:

1. Can React/Next.js/platform solve it?
2. Does the project already have a dependency for it?
3. Does shadcn already provide the needed UI?
4. Is it maintained?
5. Is it compatible with current Node/Next/React?
6. Does it add meaningful bundle/runtime cost?
7. Is it needed now?

Do not add packages because they are trendy.

---

## 26. No Demo Data in Production Paths

Do not hard-code fake organizations, participants, patients, encounters, payments or results inside production components.

Use test fixtures, test mocks or backend seed data.

Production API code must not silently fall back to mock, demo or in-memory data
after an API failure or while an integration is unfinished. Render an explicit
loading, error, unavailable or disabled state instead.

---

## 27. AI / Code-Agent Discipline

Before modifying code:

- read `AGENTS.md`;
- read relevant ADRs;
- inspect existing reusable components;
- select only relevant FE skills;
- do not invent APIs;
- do not add production mock data;
- avoid duplicate code;
- keep changes scoped;
- report assumptions;
- verify before claiming completion.

---

## 28. Definition of Done

Run all configured applicable checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For UI work also verify reuse search, loading/empty/error states, accessibility basics, desktop workflow and no unnecessary duplicate primitive.

---

## 29. Current Implementation Order

```text
1. Frontend foundation
2. App shell/providers
3. HTTP client/API conventions
4. Organization List
5. Organization Detail
6. Health Examination Batch
7. Participant Roster
8. Excel Import Wizard
9. Participant Validation
10. Bulk Selection
11. Mẫu số 03 Renderer
12. Print Preview
13. Bulk Print
14. Participant Check-in
15. Patient Link/Create
16. Encounter
17. Doctor Workflow
18. Diagnostics
19. Billing
```

---

## Final Principle

Prefer:

```text
reuse
+
clear ownership
+
simple data flow
+
real API contracts
+
testable business rules
+
safe healthcare data handling
```

over unnecessary custom code and abstraction.
