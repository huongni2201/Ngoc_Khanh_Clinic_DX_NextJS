# Ngọc Khánh Clinic — Frontend Architecture

## Purpose

Updated 2026-10-09. This document describes how the current frontend is structured. Use ADRs to
explain why long-lived decisions were made; use this document to explain how
the frontend is organized.

## High-Level Flow

```text
Browser
  │
  ▼
Next.js App Router
  │
  ▼
Route Composition
  │
  ▼
Module Page / Feature or Widget Composition
  ├──────────────► Query / Mutation Hook
  │                       │
  │                       ▼
  │                   Module API
  │                       │
  │                       ▼
  │                Shared HTTP Client
  │                       │
  │                       ▼
  │                    Backend
  │
  ▼
Domain Components
  ├──────────────► Shared App Components
  └──────────────► shadcn Primitives
```

## Directory Responsibilities

```text
src/
├── app/                 routes, layouts, metadata, boundaries
├── components/ui/       shadcn UI primitives
├── modules/             business/domain feature ownership
├── shared/              reusable app-level frontend capabilities
├── widgets/             large reusable app compositions
├── providers/           React providers
└── lib/                 small framework/shadcn utilities
```

## Dependency Direction

### Backend-aligned contexts

`modules` contains accesscontrol, appointment, billing, catalog, clinical,
diagnostics, document, encounter, healthexamination, patient and prescription.
Organization and Batch/Participant features live under
`healthexamination/organizations` and `healthexamination/batches`. Catalog owns
service lookup; negotiated batch prices and batch reports stay in healthexamination.

Reception, doctor, patient-workspace, appointment-workspace and encounter-detail
are widget compositions. The encounter-detail widget owns the combined view
model; clinical, diagnostics, prescription and document components receive their
own data slices. Modules never import widgets/app. Internal imports bypass their
own public barrel; cross-context imports use public exports. See
[ADR-0009](../adr/0009-backend-aligned-module-ownership.md).

```text
app
 ├──► widgets ──► modules (public exports)
 └─────────────► modules (public exports)
 ↓
shared
 ↓
components/ui
```

Rules:

- `components/ui` must not depend on business modules.
- `shared` must not own business-specific rules.
- Modules should minimize direct dependencies on other modules.
- Cross-module imports should use public module exports.
- `app` composes; it does not own business behavior.

## Component Ownership

### Primitive UI

Location: `src/components/ui`

Examples: Button, Input, Dialog, Sheet, Select, Table, Tabs, Popover, Calendar, Tooltip.

### Shared Application Components

Location: `src/shared/ui`

Examples: PageHeader, ScreenLayout, ScreenLoadingSkeleton, SearchField,
StatusPill, DataTablePagination, MoneyInput and WorklistTabHeader.

These may compose shadcn primitives but remain domain-neutral.

### Domain Components

Location: `src/modules/<domain>/components`

Examples: ParticipantsTab, ParticipantFormDialog, HealthExaminationBatchOverview
and OrganizationHealthExaminationBatchesTab.

These contain business terminology or behavior.

## Reuse Strategy

```text
current module
→ shared
→ installed shadcn
→ shadcn registry
→ compose
→ create
```

See ADR-0002.

## Styling & Color Tokens

[PROJECT_RULES §15](../../PROJECT_RULES.md#15-ui--ux) owns color/token policy.
[MASTER](../../design-system/ngoc-khanh-clinic/MASTER.md) describes visual usage and
contrast limitations; implemented token values live in `src/app/globals.css`.

## State Ownership

```text
Server state      → TanStack Query
Form state        → React Hook Form
Validation        → Zod
URL state         → Next.js search params
Local UI state    → React state
Shared UI state   → Zustand only when truly cross-component
```

See ADR-0003.

## API and Contract Flow

```text
UI
 ↓
Query / Mutation Hook
 ↓
Module API
 ↓
Shared HTTP Client
 ↓
Backend HTTP Contract
```

Pages and components do not contain HTTP implementation details. When a
backend implementation exists, its endpoint, method, request/response DTO and
pagination/error envelope are authoritative.

## Transport DTO and View Model

Transport DTOs match backend request/response payloads exactly. They do not
contain UI-only fields or presentation-formatted values.

```text
Backend HTTP Contract
        ↓
Module Transport DTO
        ↓
Module Mapper
        ↓
View Model
        ↓
Component
```

`Transport DTO != View Model`. Derived labels, formatted dates, combined values
and table-specific fields belong in a mapper/view model. Existing frontend mocks
must not override an existing backend contract.

See ADR-0004.

## Domain Direction

```text
Organization
  └── HealthExaminationBatch
        └── HealthExaminationParticipant
              ↓ check-in
            Patient link/create
              ↓
            Encounter
```

`HealthExaminationParticipant` is a batch membership record and is not
automatically a `Patient`. Roster list/manual changes/import have HTTP contracts;
Participant-to-Patient visit preparation/check-in does not yet have a public handler.

## Corporate Health Examination Flow

Current mapped operations include authentication, organization/batch configuration,
Participant list/manual changes/template/import, examination-details reconciliation
and import/export, and payment-summary JSON/DOCX. See
[the API inventory](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md)
for exact routes and authorization gaps. The single-step roster import was restored
on 2026-10-06; the former preview/confirm/cancel chain remains removed. Visit
preparation and official clinical printing need explicit HTTP contracts. The
Participant action gates still use legacy permissions and need alignment with
the backend's separate permission codes; mapped Organization/Batch DELETE and
catalog lookup also have production authorization gaps. Existing
FE callers do not make missing endpoints supported. See
[code follow-ups](../maintenance/code-follow-ups.md).

## Routes and Planned Print Direction

```text
/auth/login
/organizations
/organizations/[organizationId]
/organizations/[organizationId]/health-examination-batches/[batchId]
```

Existing staff workspace routes (some business integrations remain unavailable):

```text
/reception
/doctor
/billing
/patients
/appointments
/encounters
```

`/health-check` and `/health-check/print/preview` are planned print routes;
they are not current App Router pages. A route or rendered workspace is not
evidence of a supported backend operation.

## Architecture Changes

### User authentication implementation

`modules/accesscontrol` owns STAFF/PATIENT login, logout, session schemas, hooks and AuthBoundary.
The flow is component → auth hook → auth API → `shared/api/http-client` → backend
`accesscontrol` (login, me, logout). The browser sends the HttpOnly session cookie
with `credentials: "include"`; frontend code never receives or persists the session
ID and sends no CSRF token (the backend checks `Origin` and CORS). TanStack Query
owns the session view.

AppShell mounts protected screens and the payment notifier only after a successful
login or session verification. AppHeader receives real identity display values and
uses the auth module's public logout hook. The root QueryProvider mounts cross-tab synchronization
and handles 401 errors from queries explicitly marked `requiresAuth`. Shared
transport remains independent of accesscontrol. The Participant adapter in
healthexamination uses the shared API client, includes session cookies and forwards
cancellation signals. Both shared client entry points use the same cookie-aware transport with a
15-second timeout. QueryProvider recognizes their HTTP error contracts without
turning permission failures into logout.

Every STAFF session enters the staff workspace, matching the backend. Patients
remain signed in with a notice and logout action; business data is cleared when
`/me` removes workspace access. Session restoration uses a non-sensitive
`nkc-session-present=1` localStorage hint, never identity or authorization data.
Without the hint, fresh visitors see login without an `/me` request; with it,
`/me` verifies the HttpOnly cookie. A 401 or successful logout clears the hint
and business data; a transient outage preserves the hint and exposes retry.
Cross-tab signals reset the query and re-read the hint. See
[ADR-0007](../adr/0007-session-login-backend-adr-0014.md) for the backend contract
and [ADR-0008](../adr/0008-login-session-restoration.md) for restoration behavior.
Backend authorization remains
required; the client boundary does not protect server-side data access.

Update this file when the **current architecture** changes.

Create or supersede an ADR when the **decision/rationale** changes.
