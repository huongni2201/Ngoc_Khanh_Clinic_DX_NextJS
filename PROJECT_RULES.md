# Ngọc Khánh Clinic Frontend — Project Rules

> Mandatory production frontend rules. A later accepted ADR may supersede a rule.

## 1. Product Scope

This is a **real production clinic application**.

Corporate health examinations are the primary vertical slice. Supported backend
HTTP scope is organization list/create/get/update/deactivate, batch list/create/get/update/delete, the active service catalog list (`GET /api/v1/catalog/services`) and authentication.
See [the backend inventory](../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md)
for current routes. Handler existence does not imply production authorization.

Roster, visit preparation and issued-record history follow
[accepted backend workflows](../Ngoc_Khanh_Clinic_DX_Springboot/docs/architecture/03-domain-and-workflows.md);
domain/storage contracts do not imply public endpoints. Excel import was removed
on 2026-10-05; there is no under-18 eligibility rejection. Legacy frontend
integrations are tracked in [code follow-ups](docs/maintenance/code-follow-ups.md).

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

Current module directories:

```text
auth/
organizations/
health-examinations/
appointments/
billing/
doctor/
patients/
encounters/
reception/
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
eligibility and persistence constraints. Do not introduce age rejection or
removed import behavior through frontend validation.

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

For example, the organization detail endpoint exists:

```http
GET /api/v1/organizations/{organizationId}
```

Organization list/deactivate (`DELETE` with `rowVersion`), batch list/create/get/update/delete
and the active service catalog list exist. The participant list, examination matrix, report and
export endpoints do not exist in the current backend, so those tabs show "Chưa hỗ trợ" and send no request. Check [the API inventory](../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md)
before enabling an integration. Path renames require a backend contract change.

### Backend Enum and Lifecycle Status Rule

Frontend transport types must preserve backend enum values exactly. Do not
simplify, rename, merge or invent backend statuses in transport DTOs.

UI labels may map these values to localized copy without changing the
underlying transport value:

```text
DRAFT             → Nháp
READY             → Sẵn sàng
FINALIZED         → Đã hoàn tất chuyên môn
CLOSED            → Đã đóng
```

BatchStatus has exactly these four values. Record/attendance/reconciliation
states do not extend it. Centralize display mapping and exhaustive handling.

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
Instant (UTC): 2026-09-29T11:30:00Z
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

Roster addition never creates Patient or Encounter. Visit preparation links or
creates Patient by exact CCCD. There is no age-eligibility rejection. The flow
below describes domain direction; its HTTP endpoints are not yet available.

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

## 12. Removed Excel Import

Excel roster import is removed from the current product contract (2026-10-05).
No template/upload/mapping/preview/confirm/cancel endpoint is supported.
Remaining frontend import code is migration debt, not a P0 feature or a reference
for new work. See [code follow-ups](docs/maintenance/code-follow-ups.md).
Historical database records do not restore an application workflow.

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

Read [the design reference](design-system/ngoc-khanh-clinic/MASTER.md) for visual
usage and contrast limitations; globals.css owns implemented token values.

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

Test supported organization/batch and authentication contracts, backend errors,
exact enums and date mapping. Roster, bulk selection, print mapping and visit
preparation tests apply when the feature is authorized and its contract exists.
Removed import and age-rejection expectations are not current acceptance criteria.

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

For runtime/build changes, run all configured applicable checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For documentation/skill/ignore/line-ending-policy changes without runtime/build
edits, verify links/anchors, skill resources, contract consistency and git diffs.
A line-ending policy change does not authorize repository-wide renormalization.

For UI work also verify reuse search, loading/empty/error states, accessibility basics, desktop workflow and no unnecessary duplicate primitive.

---

## 29. Current Implementation Order

Integrate supported organization list/create/detail/update/deactivate, batch
list/create/detail/update/delete, the service catalog and authentication contracts first. Track mismatched callers in
[code follow-ups](docs/maintenance/code-follow-ups.md).
Roster, examination matrix, report, export, printing and downstream
clinical workflows require approved backend HTTP contracts before enablement.
No Excel import implementation is planned under the current baseline.

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
