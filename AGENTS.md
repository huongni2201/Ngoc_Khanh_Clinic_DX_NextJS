# AGENTS.md

## Ngọc Khánh Clinic Frontend

This repository contains the **production frontend** for Ngọc Khánh Clinic.

This is not a demo/prototype repository.

Before making any change, read:

1. `PROJECT_RULES.md`
2. `PROJECT_SKILLS.md`

These files are authoritative for architecture, coding rules, UX direction, testing, security, and skill selection.

---

## 1. Current Product Priority

The current MVP priority is **enterprise / corporate health checks first**.

Primary vertical slice:

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
```

Do not prioritize unrelated outpatient, doctor, diagnostic, or billing features before this flow unless the task explicitly requires them.

---

## 2. Architecture

Use:

```text
Next.js App Router
+
Domain / Module-Based Architecture
```

Canonical root structure:

```text
src/
├── app/
├── modules/
├── shared/
├── widgets/
└── providers/
```

### `src/app`

Routing/composition only.

Do not place domain business logic, API implementations, large forms, validation engines, or reusable business UI directly in route files.

### `src/modules`

Business/domain code.

Initial priority modules:

```text
auth/
companies/
health-check-batches/
employees/
health-check-print/
```

### `src/shared`

Only domain-neutral reusable infrastructure/UI.

### `src/widgets`

Large reusable application composition blocks such as app shell/header/sidebar.

---

## 3. Domain Rules

The enterprise hierarchy is:

```text
Company
  └── HealthCheckBatch
        └── CompanyEmployee
```

Do not model Campaign above Company.

`CompanyEmployee` is not the same as `Patient`.

Correct flow:

```text
CompanyEmployee
  ↓ employee arrives
Search Patient
  ├── found → link
  └── not found → create
  ↓
Encounter
```

Do not create Patients for all imported employees automatically.

---

## 4. Technology Rules

Production baseline:

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

Use pnpm only.

Do not introduce:
- canary/beta/RC dependencies;
- another package manager;
- another authoritative linter/formatter;
- major framework changes

without explicit approval / ADR.

---

## 5. State Management

Use:

```text
TanStack Query → server/API state
React Hook Form → form state
Zod            → validation
Zustand         → true cross-component client/UI state only
URL params      → shareable filter/search/navigation state where suitable
```

Do not copy server state into Zustand without a documented reason.

---

## 6. API Rules

Presentation components must not call HTTP directly.

Preferred dependency flow:

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

Do not invent backend endpoints or response fields.

If an API contract is missing, clearly flag the assumption instead of fabricating it.

---

## 7. Module Imports

Each module should expose its public API through `index.ts`.

Preferred:

```ts
import { CompanyListPage, type Company } from '@/modules/companies'
```

Avoid deep cross-module imports such as:

```ts
import { Company } from '@/modules/companies/types/company.types'
```

Avoid circular dependencies.

---

## 8. UI/UX Direction

The application is a real healthcare enterprise system.

Design for:

```text
professional
calm
clean
desktop-first
low cognitive load
workflow-first
progressive disclosure
```

Avoid:

```text
flashy gradients
excessive cards
fake analytics
decorative dashboards
overly AI-looking layouts
huge information density
```

Use:

```text
Page   → main workflow
Drawer → contextual information
Modal  → short focused action
Page   → complex multi-step flow
```

For important UI tasks, use the skills specified in `PROJECT_SKILLS.md`, especially:

```text
ui-ux-pro-max
frontend-design
web-design-guidelines
design-system
tailwind-design-system
```

---

## 9. No Demo Data

Do not hard-code fake production data into application components.

Do not add example companies, employees, patients, encounters, payments, or results in production paths.

Use:
- test fixtures;
- test mocks;
- backend seed data;
- explicit development-only fixtures when required.

---

## 10. Excel Import Rules

Excel import is P0.

Required flow:

```text
Choose File
  ↓
Column Mapping
  ↓
Validation Preview
  ↓
Confirm Import
```

At minimum validate:

```text
required fields
valid date
age >= 18 on examination date
duplicate identity number
leading zero preservation
```

Invalid rows must not silently enter bulk print.

Keep parsing/validation logic outside page components.

---

## 11. Mẫu số 03 Rules

Use one shared Mẫu số 03 renderer for:

```text
individual health check
enterprise bulk print
reprint
```

Do not duplicate print implementations.

Never fabricate or prefill clinical findings from assumptions.

Printing must support:
- A4;
- deterministic page breaks;
- preview;
- bulk count;
- reprint;
- clear per-employee error handling.

---

## 12. Security / Privacy

Healthcare data is sensitive.

Never:
- log complete patient payloads;
- expose secrets in frontend code;
- store passwords/private keys;
- place sensitive clinical data in localStorage without an explicit reviewed design;
- bypass authorization because a button is hidden.

Frontend RBAC is UX only; backend authorization is authoritative.

For auth/security-sensitive changes, use:

```text
security-threat-model
security-best-practices
```

---

## 13. TypeScript

Use strict TypeScript.

Avoid:
- `any`;
- unsafe broad casts;
- duplicated enum/status strings;
- silent null assumptions.

Prefer:
- `unknown` at untrusted boundaries;
- Zod validation;
- discriminated unions;
- exhaustive state handling.

---

## 14. Required Screen States

Significant screens/components must account for applicable states:

```text
loading
empty
error
success
partial-data
permission-denied
```

Do not ship a screen that only works on the happy path.

---

## 15. Testing

Use:

```text
Vitest + Testing Library
Playwright
```

Critical business behavior should be tested, especially:

```text
company creation
batch creation
Excel mapping/validation
under-18 rejection
duplicate CCCD
bulk selection
Mẫu số 03 mapping
print-batch preparation
employee check-in
```

Use TDD for deterministic business rules when practical.

---

## 16. Before Implementing a Non-Trivial Feature

Follow this order when relevant:

```text
1. Read PROJECT_RULES.md
2. Read PROJECT_SKILLS.md
3. Inspect existing code
4. Understand domain model
5. Confirm API contract
6. Confirm UI/UX flow
7. Implement
8. Add/update tests
9. Review architecture/security
10. Run verification commands
```

Do not start by creating files blindly.

---

## 17. Skill Selection

Do not invoke every skill automatically.

Select relevant skills from `PROJECT_SKILLS.md`.

Typical production feature:

```text
domain-modeling
architecture-patterns
api-design-principles
ui-ux-pro-max
react-state-management
javascript-testing-patterns
code-review
run-tests
```

Add security skills when sensitive data/auth/permissions are involved.

---

## 18. Verification Before Completion

Before declaring a task complete, run all applicable checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

If a script does not exist yet, do not invent a successful result. State that it is not configured.

Do not claim tests/build passed unless they were actually run and passed.

---

## 19. Change Discipline

When editing:

- reuse existing components and utilities;
- avoid duplicate business rules;
- avoid premature abstraction;
- avoid unrelated refactors;
- keep changes scoped to the task;
- preserve public contracts unless intentionally changed;
- document long-lived architectural decisions with an ADR.

Do not silently redesign the repository.

---

## 20. Completion Report

At the end of implementation, report:

1. What changed.
2. Files added/modified.
3. Tests/checks actually run.
4. Any assumptions.
5. Missing backend/API contracts.
6. Remaining risks/TODOs.

---

## 21. Current Implementation Order

Unless explicitly changed:

```text
1. Frontend foundation
2. App shell / providers
3. HTTP client / API conventions
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

---

## Guiding Principle

Prefer:

```text
correct workflow
+
clear domain boundaries
+
simple maintainable code
+
real API contracts
+
safe patient-data handling
+
good clinic UX
+
testable behavior
```

over unnecessary complexity.
