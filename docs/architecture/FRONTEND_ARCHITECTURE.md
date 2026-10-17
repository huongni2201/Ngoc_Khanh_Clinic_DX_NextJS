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
Organization features live under `healthexamination/organizations`; Agreement,
Participant, Session and Assignment features live under `healthexamination/agreements`.
Catalog owns service lookup; negotiated agreement prices and reports stay in healthexamination.

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

Examples: ParticipantsTab, ParticipantFormDialog, HealthExaminationAgreementOverview,
SessionsTab and OrganizationAgreementsTab.

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
  └── HealthExaminationAgreement (services, prices, validity)
        └── HealthExaminationParticipant
              ├── SessionAssignment ── Session (date, site, activity)
              ↓ check-in
            Patient link/create
              ↓
            Encounter
```

`HealthExaminationParticipant` is an agreement roster record (dates come from its session assignments) and is not
automatically a `Patient`. Roster list/manual changes/import have HTTP contracts;
Participant-to-Patient visit preparation/check-in does not yet have a public handler.

## Corporate Health Examination Flow

Current mapped operations include authentication, organization/agreement configuration, sessions and assignments,
Participant list/manual changes/template/import, examination-details reconciliation
and import/export, payment-summary JSON/DOCX, and blank examination form printing
(one PDF per Participant and background print jobs, see
[ADR-0010](../adr/0010-backend-rendered-examination-form-printing.md)). See
[the API inventory](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md)
for exact routes and authorization gaps. The single-step roster import was restored
on 2026-10-06; the former preview/confirm/cancel chain remains removed. Visit
preparation and official clinical printing need explicit HTTP contracts. The
Participant action gates use the backend's separate permission codes (see
"Permission checks" under accesscontrol); mapped Organization/Agreement DELETE and
catalog lookup also have production authorization gaps. Existing
FE callers do not make missing endpoints supported. See
[code follow-ups](../maintenance/code-follow-ups.md).

## Routes and Printing

```text
/auth/login
/organizations
/organizations/[organizationId]
/organizations/[organizationId]/agreements/[agreementId]   (?tab=overview|participants|sessions|examination|report)
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

There are no print routes. Examination forms are printed as backend PDFs from the
Participants tab ([ADR-0010](../adr/0010-backend-rendered-examination-form-printing.md));
`modules/document` owns the render-job API and polling, `healthexamination` the
selection and dialogs. A route or rendered workspace is not
evidence of a supported backend operation.

Document-template editing/upload/publish screens are excluded from product scope
by [backend ADR-0018](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/adr/0018-it-managed-document-templates.md).
Business/clinical staff approve content and IT releases validated template versions.
This supersedes only the future template-maintenance screens mentioned in ADR-0010;
PDF preview/printing and Excel download/import workflows remain supported.

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

**Permission checks.** A screen decides which features to show or enable only through
`usePermissions()` (`can`, `canAll`, `canAny`) from `modules/accesscontrol`. It reads the
permission codes already carried by the session (`roleAssignments[].permissions`) and knows
nothing about roles; there is no role matrix in the frontend. Codes are the `PERMISSION`
constants in `accesscontrol/permissions.ts`, the backend permissions tied to an HTTP
endpoint, so a typo fails type checking and `permission-codes.test.ts` fails when a code is
not defined by the backend migrations (skipped without the backend checkout). A feature
that calls several endpoints needs all of them. Each feature module groups its flags in one
hook, for example `useAgreementPermissions()` for the agreement screens (participants, sessions,
assignments, agreement create/edit/delete/activate/end) and `useOrganizationPermissions()` for the Organization screens
(create, edit, deactivate), instead of calling `hasStaffPermission` inline. The sidebar hides
an item whose `permission` the session lacks ("Đơn vị" needs `ORGANIZATION_SEARCH`). Until the session is loaded (`isKnown` false) a read still
tries and the backend answers. Add a code to `PERMISSION` when a screen needs it. These
checks only hide or disable controls; the backend decides every request.

### Clinic Manager catalog management

The same AppShell/AppSidebar contains the permission-gated staff member entry and a catalog
group at `/admin/catalog/{departments|rooms|specialties|services|medicines}`. Catalog screens
use the shared canAccessCatalogManagement check (STAFF with CLINIC_MANAGER or local TEST)
in addition to typed endpoint permissions; the existing staff-member
workflow keeps its permission checks. Staff accounts, including Clinic Manager, are created by an authorized administrator through the
existing `/staff-members` form with one role, loaded from the role API.

Catalog owns its management adapters, hooks, query keys and forms. It reuses ScreenLayout,
PageHeader, SearchField, StatusPill and DataTablePagination. Service list rows and detail records
are distinct: opening detail/edit fetches the full record so preparation instructions are not
lost. The adapter maps numeric backend prices into the form's decimal string and maps its
department filter to the backend's `performingDepartmentId` parameter. Dialogs mount when opened
so each edit starts with its own record. TEST keeps every backend-granted permission and can
open all five catalogs; neither its role nor this UI check invents permissions absent from the session.
Sidebar, direct routes and the catalog index use the same access predicate. Backend V007 grants catalog access to CLINIC_MANAGER; administrator has no catalog grants; sign in again after deployment to refresh the permission snapshot.

Catalog mutations use a module-local hook to clear the session/business cache on 401 and
refresh management queries on 409; writes are never automatically retried. Conflict recovery
keeps the draft until the user explicitly discards it and loads a fresh detail/version. Form
reload blocks closing/submitting until the new snapshot is ready. Status dialogs offer the
same explicit reload without a draft. Parent filters reuse the searchable, paginated reference
picker with all statuses; creation pickers stay active-only. Reference choices are buttons with
keyboard/focus behavior, and enum/status Select controls receive Vietnamese label mappings.

Update this file when the **current architecture** changes.

Create or supersede an ADR when the **decision/rationale** changes.
