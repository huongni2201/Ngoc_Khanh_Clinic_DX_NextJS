# Ngọc Khánh Clinic Frontend — Project Rules

> Production frontend rules for the real Ngọc Khánh Clinic application. These rules are mandatory unless a later ADR or explicit project decision overrides them.

## 1. Product direction

The frontend is a real production application, not a demo/prototype.

Primary MVP:

```text
Company
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
Mẫu số 03 Preview
  ↓
Bulk Print
  ↓
Employee Check-in
  ↓
Patient Link/Create
  ↓
Encounter
  ↓
Clinical Workflow
```

Current priority: **enterprise/corporate health checks first**.

## 2. Technology baseline

```text
Node.js            24.21.0 LTS
pnpm                11.26.0
Next.js             16.3.5
ESLint              10.11.0
eslint-config-next  16.3.5
TypeScript          compatible stable version
React               stable version installed by Next.js
shadcn/ui           Mira preset
Typography          Inter
Icons               Hugeicons
```

Rules:
- No canary/beta/RC in production.
- Do not use `latest` blindly for core dependencies.
- Pin framework/toolchain versions.
- Upgrade via reviewed PR.
- Major upgrades require explicit approval.
- Security patches must be tested before deployment.
- Do not change the core stack without an ADR.

## 3. Package manager

Use **pnpm only**. Do not mix npm/yarn/bun in the repo.

Required:

```json
{
  "packageManager": "pnpm@11.26.0",
  "engines": {
    "node": "24.21.x"
  }
}
```

Commit `pnpm-lock.yaml`. Do not regenerate it casually.

## 4. Architecture

Use **Next.js App Router + Domain/Module-Based Architecture**.

```text
src/
├── app/
├── modules/
├── shared/
├── widgets/
└── providers/
```

### app/
Routing/composition only.

Allowed:
- routes/layouts/metadata;
- route-level composition;
- loading/error/not-found boundaries.

Avoid:
- business rules;
- direct API implementation;
- large reusable forms;
- domain validation;
- large reusable UI.

Route example:

```tsx
import { CompanyListPage } from '@/modules/companies'

export default function Page() {
  return <CompanyListPage />
}
```

## 5. Modules

Business code lives in `src/modules/`.

Initial modules:

```text
auth/
companies/
health-check-batches/
employees/
health-check-print/
```

Later:

```text
reception/
patients/
encounters/
clinical/
diagnostics/
billing/
prescriptions/
appointments/
```

A module may contain:

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

Do not create empty folders preemptively.

## 6. Module public API

Each module exposes public contracts through `index.ts`.

Preferred:

```ts
import { CompanyListPage, useCompany, type Company } from '@/modules/companies'
```

Avoid deep cross-module imports.

Avoid circular dependencies.

## 7. Shared layer

`src/shared` contains only truly reusable domain-neutral code.

Allowed examples:

```text
shared/api/http-client.ts
shared/ui/data-table/
shared/ui/empty-state/
shared/ui/error-state/
shared/hooks/use-debounce.ts
shared/lib/date.ts
shared/lib/money.ts
shared/constants/routes.ts
```

Do not put domain objects such as Company, Employee, Patient or Encounter in shared.

## 8. Widgets

`widgets/` contains large reusable app composition blocks, e.g.:

```text
app-sidebar/
app-header/
patient-search/
status-summary/
```

Do not use widgets as a dumping ground.

## 9. Domain model

Enterprise hierarchy:

```text
Company
  └── HealthCheckBatch
        └── CompanyEmployee
```

Do not model Campaign above Company.

## 10. Employee is not Patient

`CompanyEmployee` and `Patient` are separate concepts.

Correct flow:

```text
Excel row
  ↓
CompanyEmployee
  ↓
Employee arrives
  ↓
Search Patient by identity
  ├── Found → Link
  └── Not found → Create Patient
  ↓
Create Encounter
```

Do not create Patients for every imported employee.

## 11. Corporate-first routing

Primary production routes:

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
/billing
/diagnostics
```

## 12. Server state

Use **TanStack Query** for API/server state.

Do not mirror API responses into Zustand without a strong reason.

```text
API
 ↓
TanStack Query
 ↓
UI
```

## 13. Zustand

Use only for true client-side/global UI state:
- sidebar state;
- temporary wizard draft;
- temporary bulk selection if local/URL state is insufficient;
- UI preferences.

Do not use Zustand instead of TanStack Query, React Hook Form, URL params, or local component state.

## 14. Forms

Use:

```text
React Hook Form + Zod
```

Forms must support:
- field errors;
- form-level errors;
- submitting state;
- duplicate-submit prevention;
- server validation errors.

Do not duplicate validation rules across components.

## 15. API layer

Do not call Axios/fetch directly from presentational components.

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

Shared HTTP concerns:
- base URL;
- auth/session;
- timeout;
- request ID;
- error normalization;
- 401 handling.

## 16. API/domain types

Do not assume API DTO = frontend view model.

Use explicit mapping when necessary:

```text
API DTO
 ↓
Mapper
 ↓
Frontend Model
```

Avoid `any`; prefer `unknown` and validate/narrow.

## 17. Zod boundaries

Validate untrusted data at boundaries:
- forms;
- Excel imports;
- API responses where necessary;
- route/search params where applicable;
- environment variables.

## 18. UI design system

Baseline:

```text
shadcn/ui: Mira
Typography: Inter
Icons: Hugeicons
```

Direction:
- healthcare enterprise;
- calm;
- professional;
- desktop-first;
- realistic;
- low cognitive load;
- not flashy;
- not overly “AI-generated”.

Semantic colors:
- Blue: active/primary/in-progress
- Green: valid/completed
- Orange: waiting/attention
- Red: blocking/destructive
- Gray: neutral/disabled

Never communicate state by color alone.

## 19. Information density

Use progressive disclosure:

```text
Page   → primary workflow
Drawer → context/inspection
Modal  → short focused task
Page   → complex multi-step workflow
```

Examples:
- Company list → Page
- Company detail → Page
- Employee quick view → Drawer
- Create batch → Modal
- Excel import → Wizard/Page
- Print preview → Dedicated Page
- Cancel visit → Confirm Modal

## 20. Modal rules

Use modal for short blocking tasks. Avoid giant tables or complex workflows inside modals.

Every modal needs:
- clear title;
- close behavior;
- primary CTA;
- secondary/cancel;
- loading state;
- error state;
- keyboard focus management.

## 21. Drawer rules

Use drawers for:
- quick details;
- patient/employee context;
- secondary actions;
- non-blocking information.

Do not hide a major workflow permanently inside a drawer.

## 22. Tables

Use TanStack Table for complex operational tables.

Employee roster should support:
- row selection;
- bulk selection;
- sorting;
- filtering;
- pagination/virtualization;
- sticky header;
- column visibility;
- keyboard accessibility.

Keep `Họ và tên` and `CCCD` visible during horizontal scrolling where practical.

## 23. Required UI states

Significant screens must support:

```text
loading
empty
error
success
partial-data
permission-denied
```

Never leave a blank page on failure.

## 24. Employee validation

Support at minimum:

```text
VALID
MISSING_INFORMATION
UNDERAGE
DUPLICATE_IDENTITY
```

Blocking validation errors cannot enter bulk print.

Mẫu số 03 age rule:

```text
ageOnExaminationDate >= 18
```

Do not calculate age from year only.

## 25. Excel import

Excel import is P0.

```text
Choose File
 ↓
Column Mapping
 ↓
Validation Preview
 ↓
Confirm Import
```

Rules:
- never silently import invalid rows;
- show row/cell errors;
- preserve leading zeroes in identity numbers;
- support Vietnamese header mapping later;
- display valid/warning/error counts;
- keep parsing logic out of page components.

## 26. Health-check printing

Use one shared Mẫu số 03 implementation for:
- individual print;
- enterprise bulk print;
- reprint.

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

Never fabricate/prefill clinical findings from assumptions.

## 27. Print workflow

Requirements:
- A4;
- deterministic page breaks;
- no dashboard chrome in print;
- preview before bulk print;
- batch count visible;
- reprint supported;
- errors identify affected employee(s).

## 28. RBAC

Frontend permission checks are UX only; backend remains authoritative.

Initial roles may include:

```text
FRONT_DESK
DOCTOR
CASHIER
CLINIC_ADMIN
```

Do not expose enterprise master-data management to doctors by default.

## 29. Security/privacy

Never store:
- passwords;
- secrets;
- private API keys;
- sensitive tokens

in source code.

Do not log full patient payloads.

Avoid sensitive clinical data in `localStorage`.

Treat healthcare data as sensitive.

## 30. Environment variables

Use `NEXT_PUBLIC_*` only for browser-safe values.

Secrets belong to server/backend.

Validate env config where practical.

## 31. Error handling

Normalize API errors.

Example:

```ts
type AppError = {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
  requestId?: string
}
```

Never show backend stack traces to users.

## 32. Dates

Use one date library consistently. UI may display `dd/MM/yyyy`, but internal parsing must be deterministic.

## 33. Money

Do not trust frontend floating-point calculations as authoritative for billing.

Backend-calculated totals are authoritative.

## 34. Accessibility

Minimum:
- keyboard navigation;
- visible focus;
- proper labels;
- semantic buttons;
- accessible dialogs;
- sufficient contrast;
- non-color status indicators.

## 35. Responsive strategy

Primary target: desktop >= 1280px.

Tablet:
- hide low-priority columns;
- collapse row actions.

Mobile:
- reading/search/status review only;
- do not prioritize bulk Excel import/printing.

## 36. Performance

Avoid obvious performance problems:
- server pagination for large datasets when available;
- do not render thousands of rows blindly;
- virtualize when needed;
- debounce search where appropriate;
- avoid unnecessary global state;
- avoid unnecessary `use client`.

## 37. Server/client components

Default to Server Components where useful.

Use `use client` only when needed for:
- event handlers;
- browser APIs;
- local state;
- React Query;
- client forms.

Do not mark entire route trees as client components.

## 38. React Compiler

React Compiler may be enabled.

Do not add `useMemo`, `useCallback`, or `React.memo` everywhere without a real reason.

## 39. Naming

Code identifiers: English.

UI labels: Vietnamese.

Conventions:
- files: kebab-case
- React components: PascalCase
- variables/functions: camelCase
- real constants: UPPER_SNAKE_CASE

## 40. TypeScript

Use strict TypeScript.

Rules:
- avoid `any`;
- avoid unsafe casts;
- prefer discriminated unions for status/state;
- centralize enums/constants;
- use exhaustive handling where useful.

## 41. Component boundaries

Avoid giant components mixing:
- data fetching;
- business rules;
- forms;
- tables;
- modal logic;
- printing.

Also avoid splitting tiny components without benefit.

Optimize for cohesion.

## 42. Business logic location

Keep business rules close to their domain module.

Employee-specific validation belongs under `modules/employees`, not generic shared utilities.

## 43. Testing

Use Vitest + Testing Library for unit/component tests.

Use Playwright for critical E2E workflows.

Critical workflows requiring tests:
- create company;
- create batch;
- Excel validation;
- under-18 rejection;
- duplicate identity detection;
- bulk selection;
- Mẫu 03 mapping;
- print batch preparation;
- employee check-in.

## 44. Definition of Done

Applicable checks must pass:

```text
TypeScript
ESLint
Unit/component tests
Relevant E2E
Production build
Loading state
Empty state
Error state
Permission behavior
Desktop UX
Accessibility basics
```

## 45. Lint/format

ESLint is the authoritative linter.

Prettier is the formatter.

Do not replace/add another authoritative linter/formatter without an ADR.

Recommended scripts:

```text
lint
format
format:check
typecheck
test
test:e2e
build
```

## 46. Dependency rules

Before adding a package ask:
1. Can React/Next/platform solve it?
2. Is it maintained?
3. Compatible with Node 24/Next 16?
4. Bundle/runtime cost?
5. Duplicate existing dependency?
6. Acceptable license?
7. Needed now?

Do not add packages because they are trendy.

## 47. No demo data in production components

No hard-coded fake companies/patients/employees in production paths.

Use test fixtures, mock API layers for tests, or backend seed data.

## 48. Git

Prefer focused commits, e.g.:

```text
feat(companies): add company list
feat(employees): add import validation
fix(print): correct Mẫu 03 page break
refactor(api): normalize API errors
test(employees): cover underage validation
```

Do not mix unrelated changes.

## 49. AI/code-agent rules

Before edits:
- inspect architecture;
- read these rules;
- do not invent APIs;
- do not add mock production data;
- reuse existing components;
- avoid duplication;
- run checks after changes;
- summarize changed files;
- state assumptions;
- flag missing backend contracts;
- do not silently redesign architecture.

## 50. Current implementation order

```text
1. Production frontend foundation
2. App shell/providers
3. HTTP client/API conventions
4. Company List
5. Company Detail
6. Health Check Batch
7. Employee Roster
8. Excel Import Wizard
9. Employee Validation
10. Bulk Selection
11. Mẫu số 03 Renderer
12. Print Preview
13. Bulk Print
14. Employee Check-in
15. Patient Link/Create
16. Encounter
17. Doctor Workflow
18. Diagnostics
19. Billing
```

Final principle:

```text
clear domain boundaries
+
simple data flow
+
real API contracts
+
progressive disclosure
+
testable business rules
```

over:

```text
clever abstraction
+
premature patterns
+
large global stores
+
hard-coded demo behavior
+
duplicated domain logic
```
