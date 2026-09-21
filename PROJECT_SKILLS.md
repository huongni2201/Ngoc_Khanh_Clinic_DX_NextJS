# Ngọc Khánh Clinic Frontend — Local Skills Guide

This repository intentionally keeps a **small frontend-only skill set**.

Skills live in:

```text
.agents/skills/
```

Before applying a skill, read its `SKILL.md`.

Repository rules and accepted ADRs override generic skill examples.

---

## Approved Frontend Skills

```text
architecture-decision-records
code-review
diagnosing-bugs
error-handling-patterns
frontend-design
javascript-testing-patterns
react-state-management
security-best-practices
setup-pre-commit
tailwind-design-system
tdd
ui-styling
ui-ux-pro-max
web-design-guidelines
```

Do not load every skill for every task. Use only skills that materially help the current work.

---

## UI / UX

### `ui-ux-pro-max`
Use for new screens, information architecture, workflow UX, accessibility, responsive behavior, density, tables/forms and design-system review.

### `frontend-design`
Use for page/component composition and visual hierarchy. Repository rules override generic marketing-style guidance; this is an operational healthcare system.

### `ui-styling`
Use for shadcn/Tailwind implementation, variants and visual refinement.

### `tailwind-design-system`
Use for Tailwind v4 tokens, semantic tokens, CVA variants and consistent styling. **Reuse existing shadcn components before following skill examples that create primitives.**

### `web-design-guidelines`
Use for accessibility, layout, responsiveness, forms, tables and keyboard usability.

---

## React / State

### `react-state-management`
Use for TanStack Query vs Zustand, URL/local state, form state ownership and cache invalidation.

Repository default:

```text
TanStack Query   → server state
React Hook Form  → form state
URL params       → shareable state
React state      → local state
Zustand          → true cross-component client-only state
```

---

## Error Handling

### `error-handling-patterns`
Use for HTTP errors, mutation failures, async failures, form submission errors, retries and normalized frontend errors.

---

## Testing / Reliability

### `javascript-testing-patterns`
Use for Vitest, Testing Library, hooks/components, mocks and fixtures.

### `tdd`
Use for deterministic business rules such as age eligibility, Excel validation, duplicate CCCD, bulk selection, Mẫu số 03 mapping and status transitions.

### `diagnosing-bugs`
Use when behavior differs from requirements or tests/build/state fail. Find root cause before patching symptoms.

---

## Review / Security / Tooling

### `code-review`
Use after a meaningful feature/refactor and before merging important changes.

### `security-best-practices`
Use for auth/session handling, token storage, XSS-sensitive rendering, browser storage, healthcare data exposure and frontend permission behavior.

### `setup-pre-commit`
Use for commit-time tooling. Adapt examples to pnpm and actual package scripts.

### `architecture-decision-records`
Use only for long-lived decisions such as architecture, reuse strategy, state ownership, API/error strategy, auth/session strategy and print architecture.

---

## Skills by Task

### New Operational Screen

```text
ui-ux-pro-max
frontend-design
ui-styling
web-design-guidelines
tailwind-design-system
```

Add `react-state-management` only when state ownership is non-trivial.

### Data / State Feature

```text
react-state-management
error-handling-patterns
javascript-testing-patterns
```

### Form Workflow

```text
react-state-management
error-handling-patterns
javascript-testing-patterns
web-design-guidelines
```

### Excel Import

```text
tdd
javascript-testing-patterns
error-handling-patterns
react-state-management
ui-ux-pro-max
```

### Mẫu số 03 / Print

```text
javascript-testing-patterns
ui-ux-pro-max
web-design-guidelines
```

### Bug Fix

```text
diagnosing-bugs
javascript-testing-patterns
```

### Security-Sensitive Frontend Work

```text
security-best-practices
javascript-testing-patterns
```

### UI Code Review

```text
code-review
web-design-guidelines
ui-styling
```

### Long-Lived Architecture Change

```text
architecture-decision-records
code-review
```

---

## Mandatory Reuse Check for UI Tasks

Before creating a component:

1. Search current module.
2. Search `src/shared`.
3. Search `src/components/ui`.
4. Check the configured shadcn registry.
5. Compose existing primitives.
6. Create new UI only if none of the above works.

Do not use a skill's sample code as justification to duplicate an existing project/shadcn component.

---

## Skills Intentionally Not Kept in This FE Repo

Do not add backend-oriented skills such as Spring/Java/MapStruct, Gradle/JaCoCo, SQL optimization, Python backend/testing, async Python workers or backend CRUD generators.

---

## Suggested Agent Prompt

```text
Read AGENTS.md, PROJECT_RULES.md, PROJECT_SKILLS.md and relevant ADRs first.

Inspect existing reusable components before creating new UI.
Use only the relevant local frontend skills from .agents/skills/.
Do not invent backend APIs.
Do not add demo data to production paths.
Reuse shadcn and existing project components before writing new primitives.

Run applicable lint, typecheck, tests and build before completion.
Report reused components, changed files, assumptions and remaining risks.
```
