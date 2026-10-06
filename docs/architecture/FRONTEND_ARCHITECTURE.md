# Ngọc Khánh Clinic — Frontend Architecture

## Purpose

This document describes how the current frontend is structured. Use ADRs to
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
Module Page / Feature
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

```text
app
 ↓
modules / widgets
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

Location: `src/shared/components`

Examples: DataTable, EmptyState, ErrorState, PageHeader, ConfirmAction, PermissionState.

These may compose shadcn primitives but remain domain-neutral.

### Domain Components

Location: `src/modules/<domain>/components`

Examples: ParticipantValidationBadge, OrganizationSummary,
HealthExaminationBatchStatus, PatientMatchPanel.

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
automatically a `Patient`. This is domain direction; roster/check-in HTTP handlers
are not yet implemented in the current backend.

## Corporate Health Examination Flow

Current backend HTTP operations are organization list/create/get/update/deactivate,
batch create/list and authentication. See [the API inventory](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md).
Excel roster import was removed on 2026-10-05. Roster, print and visit preparation
are domain/UI directions requiring explicit HTTP contracts. Existing FE callers
do not make missing endpoints supported. See [code follow-ups](../maintenance/code-follow-ups.md).

## Route Direction

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

## Architecture Changes

### User authentication implementation

`modules/auth` owns STAFF/PATIENT login, logout, session schemas, hooks and AuthBoundary.
The flow is component → auth hook → auth API → `shared/api/http-client` → identity.
The browser sends HttpOnly cookies with `credentials: "include"`; frontend code
does not receive or persist a JWT/session ID. TanStack Query owns the session view.

AppShell mounts protected screens and the payment notifier only after `/me`
verification. AppHeader receives real identity display values and uses the auth
module's public logout hook. The root QueryProvider mounts cross-tab synchronization
and handles 401 errors from queries explicitly marked `requiresAuth`. Shared
transport remains independent of the auth module. The legacy participant-roster adapter uses
the shared API client, includes session cookies and forwards cancellation signals.
Its backend route is currently absent. Both shared client entry points use the same cookie-aware transport with a
15-second timeout. QueryProvider recognizes their HTTP error contracts without
turning permission failures into logout.

Staff with effective assignments enter the staff workspace. Patients and roleless
staff remain signed in with a notice and logout action; business data is cleared
when `/me` removes workspace access. See [ADR-0006](../adr/0006-shared-user-login.md) and
[cookie/CSRF decision](../adr/0005-staff-cookie-session.md). Backend authorization remains
required; the client boundary does not protect server-side data access.

Update this file when the **current architecture** changes.

Create or supersede an ADR when the **decision/rationale** changes.
