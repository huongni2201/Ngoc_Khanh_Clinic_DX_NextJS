# Ngọc Khánh Clinic — Frontend Architecture

## Purpose

This document describes the **current frontend architecture**.

Use ADRs to explain **why** long-lived decisions were made. Use this document to explain **how** the frontend is currently structured.

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
  │
  ├──────────────► Shared App Components
  │
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

Examples: EmployeeValidationBadge, CompanySummary, HealthCheckBatchStatus, PatientMatchPanel.

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

## API Flow

```text
UI
 ↓
query/mutation hook
 ↓
module API
 ↓
shared HTTP client
 ↓
backend
```

Pages/components do not contain HTTP implementation details.

See ADR-0004.

## Domain Direction

```text
Company
  └── HealthCheckBatch
        └── CompanyEmployee
              ↓ check-in
            Patient link/create
              ↓
            Encounter
```

The corporate employee roster is intentionally separate from the patient registry.

## Corporate Health Check Flow

```text
Company List
  ↓
Company Detail
  ↓
Health Check Batch
  ↓
Employee Roster
  ↓
Excel Import
  ↓
Validation
  ↓
Bulk Selection
  ↓
Mẫu số 03 Print Preview
  ↓
Bulk Print
  ↓
Employee Arrival
  ↓
Patient Match/Create
  ↓
Encounter
```

## Route Direction

```text
/login
/health-check
/health-check/companies/[companyId]
/health-check/companies/[companyId]/batches/[batchId]
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

Update this file when the **current architecture** changes.

Create or supersede an ADR when the **decision/rationale** changes.
