# AGENTS.md

## Ngọc Khánh Clinic Frontend

This repository contains the **production frontend** for Ngọc Khánh Clinic.

This is not a demo/prototype repository.

Before making any change, read:

1. `PROJECT_RULES.md`
2. `PROJECT_SKILLS.md`
3. Relevant ADRs in `docs/adr/`
4. `docs/architecture/FRONTEND_ARCHITECTURE.md` when the task affects structure, dependencies, state ownership, reusable UI, or API flow

Repository rules and accepted ADRs override generic skill examples.

---

## 1. Current Product Priority

The current priority is **enterprise / corporate health checks first**.

```text
Organization
  ↓
Health Examination Batch
  ↓
Participant Roster
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
Participant Check-in
  ↓
Patient Link/Create
  ↓
Encounter
```

Do not prioritize unrelated workflows unless the current task explicitly requires them.

---

## 2. Frontend Architecture

Use:

```text
Next.js App Router
+
Domain / Module-Based Architecture
```

Canonical structure:

```text
src/
├── app/                 # routes, layouts, metadata, boundaries
├── components/
│   └── ui/              # shadcn/ui primitives
├── modules/             # business/domain modules
├── shared/              # reusable application-level FE code
├── widgets/             # large reusable app compositions
├── providers/           # global React providers
└── lib/                 # small framework/shadcn utilities
```

Rules:

- `src/app` is routing/composition only.
- Business logic belongs in `src/modules`.
- shadcn primitives belong in `src/components/ui`.
- Shared cross-module application components belong in `src/shared`.
- Large reusable shell/workflow compositions belong in `src/widgets`.
- Do not turn `src/lib` or `src/shared` into dumping grounds.

---

## 3. UI Reuse Is Mandatory

Before creating **any new UI component**, search for an existing reusable solution.

Required priority:

```text
1. Existing component in the current module
2. Existing reusable component in src/shared
3. Existing shadcn primitive in src/components/ui
4. Suitable component from the configured shadcn registry
5. Compose existing primitives
6. Create a new component only if 1–5 cannot satisfy the requirement
```

Before UI implementation, inspect:

```text
src/modules/<current-module>
src/shared
src/components/ui
components.json
```

Do not create redundant wrappers such as:

```text
CustomButton
BaseButton
AppButton
CustomModal
AppModal
CustomSelect
BaseCheckbox
```

when they only duplicate an existing primitive.

A domain component is valid when it adds **meaningful business semantics or business behavior**.

A component reused across multiple modules belongs in `src/shared`.

Do not copy/paste an existing component just to change styles. Prefer:

```text
props
variants
composition
shared abstraction
```

See ADR-0002.

---

## 4. State Ownership

Use:

```text
TanStack Query   → server/API state
React Hook Form  → form state
Zod              → validation/schema boundaries
URL params       → shareable search/filter/navigation state
React state      → local transient UI state
Zustand          → true cross-component client-only state
```

Do not mirror TanStack Query data into Zustand without a documented reason.

See ADR-0003.

---

## 5. API Boundary

Presentation components must not call HTTP directly.

Preferred flow:

```text
Component
  ↓
Query / Mutation Hook
  ↓
Module API
  ↓
Shared HTTP Client
  ↓
Backend
```

Do not invent endpoint, DTO fields, statuses, permission behavior, or backend calculations.

If a backend contract is missing, state the assumption instead of fabricating it.

See ADR-0004.

---

## 6. Domain Rules

Corporate hierarchy:

```text
Organization
  └── HealthExaminationBatch
        └── HealthExaminationParticipant
```

`HealthExaminationParticipant` is not automatically a `Patient`.

Correct flow:

```text
HealthExaminationParticipant arrives
  ↓
Search Patient by identity
  ├── found     → link
  └── not found → create
  ↓
Create Encounter
```

Do not create Patient records for every imported employee.

---

## 7. UI Direction

Current design baseline:

```text
shadcn/ui preset: Mira
Typography: Inter
Icons: Hugeicons
```

Product style:

```text
healthcare enterprise
professional
calm
clean
desktop-first
workflow-first
low cognitive load
accessible
progressive disclosure
```

Avoid excessive gradients, decorative dashboards, fake analytics, unnecessary cards, one-off custom primitives, and overly AI-looking layouts.

Mandatory Color Token Policy:

- **No custom / arbitrary colors**: Do NOT use arbitrary values (`bg-[#...]`, `text-[#...]`, `border-[#...]`), inline `style={{ color }}`, or arbitrary unmapped Tailwind palette classes (`bg-blue-500`, `text-slate-600`, etc.).
- **Single source of truth (`src/app/globals.css`)**: ALL colors MUST come from semantic design tokens defined in `src/app/globals.css` (`bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `bg-primary`, `text-primary-foreground`, `bg-muted`, `text-muted-foreground`, `bg-accent`, `text-accent-foreground`, `bg-destructive`, `border-border`, etc.).
- **Extending tokens**: If a new semantic color is required, define it formally as a design token in `src/app/globals.css` (for both `:root` and `.dark` under `@theme inline`). Never create one-off colors in components.
- **Accessibility**: Never communicate status by color alone.

Interaction pattern:

```text
Page   → primary workflow
Drawer → contextual inspection
Modal  → short focused action
Page   → complex multi-step workflow
```

---

## 8. Approved Project Skills

Local skills live in:

```text
.agents/skills/
```

Approved frontend skills and general coding guidance:

```text
architecture-decision-records
code-review
diagnosing-bugs
error-handling-patterns
frontend-design
javascript-testing-patterns
karpathy-guidelines
react-state-management
security-best-practices
setup-pre-commit
tailwind-design-system
tdd
ui-styling
ui-ux-pro-max
web-design-guidelines
```

Use only relevant skills.

Use `karpathy-guidelines` for implementation, review, or refactoring work when its guidance applies. Repository rules and accepted ADRs take precedence.

Do not add backend/Java/Spring/Gradle/database/Python backend skills to this frontend repository unless the repository scope changes.

Before applying a skill, read its `SKILL.md`.

---

## 9. Security / Privacy

Healthcare information is sensitive.

Never:

- expose secrets in frontend source;
- log complete patient payloads;
- store passwords/private keys;
- place sensitive clinical data in `localStorage` without explicit review;
- treat hidden UI as authorization.

Backend authorization is authoritative. Frontend permission checks are UX only.

---

## 10. TypeScript

Use strict TypeScript.

Avoid `any`, unsafe broad casts, duplicated status literals, and silent null assumptions.

Prefer `unknown` at untrusted boundaries, Zod parsing, discriminated unions, and exhaustive handling where useful.

---

## 11. Required Screen States

Significant screens must handle applicable states:

```text
loading
empty
error
success
partial-data
permission-denied
```

Do not implement only the happy path.

---

## 12. Testing

Use:

```text
Vitest + Testing Library
Playwright for critical E2E flows
```

Critical business behavior includes Excel mapping/validation, under-18 rejection, duplicate CCCD handling, bulk selection, Mẫu số 03 mapping, print-batch preparation, and participant check-in.

---

## 13. Before Implementing a Non-Trivial Feature

Follow this sequence:

```text
1. Read PROJECT_RULES.md
2. Read relevant ADRs
3. Inspect existing code
4. Search for reusable UI/components
5. Select only relevant FE skills
6. Confirm domain behavior
7. Confirm API contract
8. Confirm UI flow
9. Implement the smallest cohesive change
10. Add/update tests
11. Review duplication/accessibility/error/security concerns
12. Run verification
```

Do not start by creating files blindly.

## 13.1 Medical terminology contract

Use the canonical vocabulary in `src/config/medical-terminology.ts` and the
medical terminology migration plan. New domain code must use `Organization`,
`Encounter`, `HealthExaminationBatch`, `ClinicalService`, and `ServiceRequest`.
`Enterprise` is a legacy alias and must not be added to new code. Preserve
Vietnamese user-facing copy unless the owning feature explicitly changes it.

---

## 14. Verification

Before claiming completion, run all configured applicable checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run Playwright when a critical E2E flow is affected and E2E is configured.

Never claim a check passed unless it was actually executed successfully.

---

## 15. Completion Report

At the end of a task, report:

1. What changed.
2. Files added/modified.
3. Existing components reused.
4. Any new reusable component created and why existing options were insufficient.
5. Checks actually run.
6. Assumptions / missing API contracts.
7. Remaining risks / TODOs.

---

## Guiding Principle

Prefer:

```text
reuse existing UI
+
clear domain boundaries
+
simple state ownership
+
real API contracts
+
safe healthcare data handling
+
testable behavior
```

over unnecessary custom code or abstraction.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
