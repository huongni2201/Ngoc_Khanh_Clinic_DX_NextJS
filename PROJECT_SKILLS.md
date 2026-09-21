# Ngọc Khánh Clinic Frontend — AI Skills Guide

> Skill usage guide for AI agents working on the production frontend. Use only skills relevant to the task.

## Core skills

### `architecture-patterns`
Use for module boundaries, dependency direction, provider architecture, shared-vs-domain decisions and major refactors.

Mandatory when changing high-level architecture.

### `api-design-principles`
Use for API contracts, DTO conventions, pagination/filtering, error responses and mutations.

Mandatory when designing backend-facing contracts.

### `react-state-management`
Use for TanStack Query vs Zustand, cache ownership, wizard state and mutation invalidation.

Do not introduce global state before using this skill.

### `ui-ux-pro-max`
Use for company list/detail, employee roster, Excel import, reception/doctor/billing screens, modal/drawer flows and information-density reduction.

Design direction:

```text
healthcare enterprise
professional
calm
clean
desktop-first
low cognitive load
progressive disclosure
not overly AI-looking
```

### `web-design-guidelines`
Use as a UI review skill for hierarchy, spacing, tables, forms, accessibility and responsive behavior.

### `error-handling-patterns`
Use for HTTP client, API errors, form errors, retries and import errors.

### `javascript-testing-patterns`
Use for Vitest, Testing Library, hooks/components, fixtures and API mocking.

### `security-best-practices`
Use for authentication, session/token handling, sensitive patient data, logging and permissions.

Mandatory for security-sensitive work.

## Architecture/code quality skills

### `code-review`
Use after a complete module, vertical slice or large refactor.

Review:
- duplication;
- coupling;
- hidden business rules;
- naming;
- dead code;
- test gaps.

### `codebase-design`
Use for major module/refactor/public API decisions.

### `architecture-decision-records`
Use for long-term architectural choices such as:
- HTTP client strategy;
- module architecture;
- auth strategy;
- Excel library;
- print strategy;
- RBAC;
- linter/formatter changes.

### `domain-modeling`
Use for:

```text
Company
HealthCheckBatch
CompanyEmployee
Patient
Encounter
Order
Payment
Result
```

Mandatory before major domain-model changes.

### `karpathy-guidelines`
Use to keep implementations simple and avoid speculative abstraction.

## Frontend design skills

### `frontend-design`
Use for production component/page composition and interaction polish.

Pair with:
- `ui-ux-pro-max`
- `web-design-guidelines`

### `design-system`
Use for tokens, typography, status colors, variants, spacing and reusable primitives.

Project baseline:

```text
shadcn preset: Mira
font: Inter
icons: Hugeicons
```

### `tailwind-design-system`
Use for consistent Tailwind tokens/utilities and avoiding magic values.

### `ui-styling`
Use for final visual refinement after workflow/IA is correct.

## Testing/reliability skills

### `tdd`
Strongly recommended for:
- age eligibility;
- Excel validation;
- duplicate CCCD;
- Mẫu số 03 mapping;
- state transitions;
- bulk-selection rules.

### `coverage`
Use after tests exist to find critical-path gaps. Do not chase 100% for presentation code.

### `run-tests`
Use before declaring work complete.

Minimum:
- lint;
- typecheck;
- unit tests;
- relevant E2E;
- build.

### `diagnosing-bugs`
Use when behavior differs from requirements.

### `debugging-strategies`
Use for difficult runtime/build/state bugs.

## API/data skills

### `dto-creator`
Use for strongly typed backend-facing request/response DTOs.

### `mapper-creator`
Use for transformations such as:
- Company DTO → Company model;
- Excel row → Employee import model;
- health-check data → Mẫu 03 print model.

### `sql-optimization-patterns`
Normally backend-only. Use only when FE requirements depend on backend pagination/query behavior.

## Security skills

### `security-threat-model`
Use for:
- authentication/session model;
- patient-data access;
- RBAC;
- result/document sharing;
- patient portal.

### `security-best-practices`
Use for implementation-level security reviews.

## Skills by module

### Company Management
```text
domain-modeling
architecture-patterns
api-design-principles
react-state-management
ui-ux-pro-max
web-design-guidelines
javascript-testing-patterns
```

### Health Check Batch
```text
domain-modeling
api-design-principles
ui-ux-pro-max
javascript-testing-patterns
```

### Employee Roster
```text
domain-modeling
react-state-management
ui-ux-pro-max
web-design-guidelines
javascript-testing-patterns
```

### Excel Import
Mandatory:
```text
architecture-patterns
error-handling-patterns
javascript-testing-patterns
tdd
security-best-practices
```

Recommended:
```text
ui-ux-pro-max
mapper-creator
```

Critical tests:
```text
column mapping
missing required field
invalid date
under 18
duplicate identity
leading-zero identity
valid/invalid separation
```

### Mẫu số 03 Printing
Mandatory:
```text
architecture-patterns
ui-ux-pro-max
javascript-testing-patterns
```

Recommended:
```text
mapper-creator
web-design-guidelines
```

### Reception
```text
domain-modeling
ui-ux-pro-max
react-state-management
api-design-principles
error-handling-patterns
javascript-testing-patterns
```

### Doctor Workspace
```text
domain-modeling
ui-ux-pro-max
web-design-guidelines
react-state-management
security-best-practices
javascript-testing-patterns
```

### Billing
Mandatory:
```text
domain-modeling
api-design-principles
error-handling-patterns
security-best-practices
javascript-testing-patterns
```

### Authentication/Authorization
Mandatory:
```text
security-threat-model
security-best-practices
architecture-patterns
api-design-principles
```

## Preferred skill order for a new feature

```text
1. domain-modeling
2. architecture-patterns
3. api-design-principles
4. ui-ux-pro-max
5. react-state-management
6. implementation
7. javascript-testing-patterns / tdd
8. security-best-practices when applicable
9. code-review
10. run-tests
```

Do not blindly invoke every skill.

## AI agent implementation prompt

```text
Read PROJECT_RULES.md and PROJECT_SKILLS.md first.

Task:
<describe task>

Relevant skills:
- <skill 1>
- <skill 2>
- <skill 3>

Requirements:
- Follow the existing domain/module architecture.
- Do not add mock/demo data to production code.
- Reuse existing components before creating new ones.
- Do not duplicate types/business rules.
- Keep API/server state in TanStack Query.
- Use Zustand only for true client/global state.
- Use React Hook Form + Zod for forms.
- Implement loading, empty, error and success states.
- Add/update tests for critical behavior.
- Run lint, typecheck, tests and build.
- Report changed files and unresolved backend-contract assumptions.
```

## Prompt for UI tasks

```text
Read PROJECT_RULES.md and PROJECT_SKILLS.md.

Use:
- ui-ux-pro-max
- frontend-design
- web-design-guidelines
- design-system
- tailwind-design-system

Design/implement the screen as a real healthcare enterprise application.
Prioritize workflow clarity, hierarchy and low cognitive load.
Use progressive disclosure: page for the main task, drawer for contextual details,
modal for short focused actions, dedicated page for complex workflows.
Keep the Mira + Inter + Hugeicons design direction.
Avoid flashy gradients, excessive cards, fake analytics and AI-looking layouts.
```

## Prompt for code review

```text
Read PROJECT_RULES.md and PROJECT_SKILLS.md.

Use:
- code-review
- architecture-patterns
- codebase-design
- react-state-management
- error-handling-patterns
- security-best-practices
- javascript-testing-patterns

Review for:
- architecture violations;
- duplication;
- state ownership problems;
- deep cross-module imports;
- unnecessary use client;
- API/error handling issues;
- missing UI states;
- accessibility problems;
- security/privacy risks;
- missing tests;
- maintainability/extensibility.

Do not rewrite code merely for style preference.
Prioritize concrete production risks.
```

## Recommended skill set for this repository

Core:

```text
api-design-principles
architecture-patterns
code-review
codebase-design
domain-modeling
error-handling-patterns
frontend-design
javascript-testing-patterns
react-state-management
security-best-practices
security-threat-model
tailwind-design-system
tdd
ui-styling
ui-ux-pro-max
web-design-guidelines
```

Supporting:

```text
architecture-decision-records
coverage
debugging-strategies
design-system
diagnosing-bugs
dto-creator
karpathy-guidelines
mapper-creator
run-tests
setup-pre-commit
```

Final principle:

```text
correct business workflow
+
clear domain boundaries
+
simple maintainable code
+
safe handling of patient data
+
good clinic UX
+
testable production behavior
```
