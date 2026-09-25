# Ngọc Khánh Clinic UI Consistency Redesign

**Date:** 2026-09-25  
**Status:** Approved design  
**Scope:** All currently implemented frontend screens

## 1. Purpose

Standardize the current Ngọc Khánh Clinic frontend so every implemented screen reads as one production healthcare operations system. The redesign must improve consistency, scanability, information density, accessibility, and long-session usability without changing existing business workflows or inventing product capabilities.

The target experience is calm, professional, slightly warm, desktop-first, and workflow-led. Visual hierarchy must come primarily from typography, alignment, spacing, density, and semantic color—not decorative cards, shadows, gradients, oversized headings, or excessive badges.

## 2. Authoritative Constraints

This design is subordinate to `AGENTS.md`, `PROJECT_RULES.md`, accepted ADRs, and `docs/architecture/FRONTEND_ARCHITECTURE.md`.

Implementation must:

- Treat the current uncommitted working tree as the authoritative baseline.
- Preserve all user-owned changes and avoid unrelated refactoring.
- Preserve routes, API contracts, DTOs, query keys, validation rules, and business calculations.
- Keep `src/app` limited to routing and composition.
- Keep domain behavior in `src/modules`.
- Reuse existing module components, shared components, and shadcn primitives before creating new UI.
- Use semantic colors from `src/app/globals.css`; component code must not introduce arbitrary colors.
- Use Inter for typography and Hugeicons as the single product icon family. Primitive-internal icons may remain only where replacing them would conflict with the maintained shadcn implementation.
- Avoid adding production mock data, fake statistics, charts, actions, or backend behavior.

## 3. Delivery Strategy

The approved delivery is a single repository-wide synchronization rather than a screen-by-screen release. Internally, implementation proceeds in dependency order so shared foundations are stable before module screens migrate:

1. Design tokens, typography, and primitive defaults.
2. Application shell, sidebar, and header.
3. Shared page, table, form, dialog, and state patterns.
4. Enterprise and health-examination workflows.
5. Patient and encounter workflows.
6. Reception and appointment workflows.
7. Authentication screens.
8. Repository-wide consistency and accessibility audit.
9. Automated and visual verification.

The result is delivered as one cohesive change set, while each internal phase remains independently verifiable.

## 4. Global Visual Foundation

### 4.1 Application Shell

Authenticated operational screens use one shell:

- Expanded sidebar width: 248px.
- Header height: 64px.
- Main content padding: 24px at standard desktop widths and 32px where wider screens permit it.
- The content region may use its full available width for operational tables.
- Reading-heavy forms or prose may use a readable maximum width.
- The shell must remain usable when secondary areas stack at tablet widths.

The login screen remains outside the authenticated shell but consumes the same tokens, typography, form conventions, and button hierarchy.

### 4.2 Page Hierarchy

Operational pages follow this sequence where applicable:

1. Breadcrumb.
2. Page or entity title with a short optional description.
3. Contextual actions aligned to the right.
4. Tabs for views of the same entity.
5. Search, filters, and secondary toolbar actions.
6. Main content.
7. Pagination or secondary information.

Pages must not be wrapped in an additional decorative card. Entity detail pages use the same structural pattern across enterprises, examination batches, patients, and encounters.

### 4.3 Typography

- Page title: 24px / 30px, semibold.
- Section title: 16–18px, semibold.
- Body and table text: 14px.
- Secondary text: 13–14px.
- Metadata: 12–13px only where density requires it.
- Font size variations are minimized; hierarchy should prefer weight, spacing, and alignment.
- Uppercase labels and excessive bold text are avoided.

### 4.4 Spacing and Density

Use a 4px-based spacing vocabulary centered on 4, 8, 12, 16, 20, 24, and 32px. Operational tables and compact toolbars may use tighter spacing. Empty space must separate meaningful groups rather than reduce available information.

### 4.5 Radius, Borders, and Shadows

- Inputs and buttons: 6–8px radius.
- Panels and cards with a functional boundary: 8–10px radius.
- Dialogs: 10–12px radius.
- Borders are the default separation mechanism.
- Shadows are reserved for dialogs, popovers, dropdowns, and other floating layers.
- Normal page sections, table containers, and summary strips must not use decorative shadows.
- Large rounded rectangles, nested cards, and card-per-field layouts are removed.

### 4.6 Color and Status

`src/app/globals.css` remains the single color source of truth. Existing semantic status tokens are retained and may be corrected for accessibility, but components consume semantic utilities only.

Status color is always paired with text and, when safety or urgency warrants it, an icon. Metadata such as gender, age, phone, department, doctor, and dates remains plain text rather than badge content.

## 5. Shared Component Architecture

### 5.1 Primitive Layer

`src/components/ui` continues to contain maintained shadcn primitives. Existing primitives are standardized through their base styles and variants rather than wrapped one-to-one. Priority primitives include:

- Button
- Input and Textarea
- Select and RadioGroup
- Checkbox
- Table
- Tabs
- Dialog and Sheet
- Badge and Alert
- DropdownMenu, Popover, and Tooltip
- Pagination
- Skeleton

Changes at this layer must remain domain-neutral.

### 5.2 Shared Application Layer

`src/shared` may gain a reusable component only when multiple modules need a meaningful application-level contract. Expected shared patterns include:

- Consistent page header and breadcrumb composition.
- Search/filter toolbar layout.
- Loading, empty, and error presentation.
- Operational table framing and pagination composition.
- Standard dialog footer alignment.

Existing `DataTablePagination` remains the canonical pagination component. New wrappers that merely forward primitive props are prohibited.

### 5.3 Domain Layer

Business-specific components remain within their modules, including appointment status, reception state, employee validation, enterprise summaries, examination-batch state, clinical warnings, and encounter content. Domain components may compose shared patterns and primitives but must not copy them for styling differences.

## 6. Component Interaction Patterns

### 6.1 Buttons

- Each page or dialog normally has one dominant primary action.
- Supporting actions use outline or secondary variants.
- Low-priority actions use ghost variants.
- Destructive styling is reserved for destructive operations.
- Icon-only controls require an accessible name and tooltip when the icon is not universally understood.
- Operational button height remains between 36 and 40px.

### 6.2 Tables

Tables remain information-dense and optimized for scanning:

- Text is left-aligned; numeric values are right-aligned when appropriate.
- Identity columns remain visible where practical.
- Headers, row heights, separators, hover states, selection, and actions are consistent.
- Row actions are compact and right-aligned.
- Rows are not converted into individual cards.
- Sticky headers are used only where viewport or dataset length makes them useful.
- Existing pagination behavior and URL ownership remain unchanged.

### 6.3 Forms

- Labels sit above controls.
- Required fields use a consistent `*` indicator.
- Validation messages appear immediately below the associated control and are programmatically linked.
- Narrow dialogs use one column; suitable desktop forms may use two.
- Long clinical or administrative forms use section headings and dividers, not cards around every few fields.
- Submission state prevents duplicate actions and preserves existing error behavior.

### 6.4 Dialogs

Dialogs follow one structure:

1. Title.
2. Optional concise description.
3. Content.
4. Right-aligned footer with secondary action followed by the primary action.

Dialogs remain bounded actions. Existing complex page workflows are not moved into full-screen dialogs for visual convenience.

### 6.5 Tabs

Tabs represent views of the same entity and sit near entity context. The default operational style uses a restrained underline or border indicator rather than decorative pill tabs. Compact pills are allowed only for true filter controls.

### 6.6 Search and Filters

Search, primary filters, and optional sort controls share one toolbar where practical. Existing debounced and URL-backed behavior remains unchanged. Large search cards are removed.

## 7. Screen Scope

The synchronization covers every currently implemented route and its reachable dialogs or panels:

- Application shell, sidebar, and header.
- Authentication and login.
- Enterprise list and detail.
- Health-examination batch creation, detail, employee roster, import, examination detail, and reports.
- Patient list, patient detail, patient search, and patient forms.
- Encounter detail, diagnosis, orders, results, prescriptions, documents, and print dialogs.
- Reception list, patient intake, room assignment, payment, encounter inspection, and print actions.
- Appointment list, creation, editing, and detail.
- All implemented loading, empty, error, and partial-data states.

Summary strips remain only when they help users filter, compare, or make a workflow decision. They are restyled as compact information bands rather than decorative statistic cards.

## 8. Data and State Boundaries

The redesign does not move state ownership:

- TanStack Query remains responsible for server state.
- React Hook Form remains responsible for form state.
- Zod remains responsible for validation boundaries.
- URL search parameters remain responsible for shareable search, filters, pagination, and selected views.
- React state remains responsible for local transient interaction state.
- Zustand is not introduced unless an existing cross-component client-only requirement proves it necessary.

Presentation components continue to consume hooks rather than calling HTTP directly. Missing permissions, statuses, or API fields are not invented to complete a visual state.

## 9. Healthcare Safety and Privacy

- Clinical warnings, allergies, abnormal results, and unresolved services must be distinguishable through label, icon, and semantic color.
- Patient detail retains the hierarchy Patient → Encounter History → Selected Encounter → Encounter-owned clinical information.
- Prescriptions, results, diagnoses, and documents remain attached to their existing encounter.
- Sensitive patient payloads must not be logged or added to browser storage.
- Frontend visibility remains a UX affordance, not an authorization boundary.

## 10. Responsive Behavior

Primary visual verification targets:

- 1366×768
- 1440×900
- 1920×1080

Desktop screens must not look like stretched mobile layouts. At narrower widths, secondary action groups and detail metadata may wrap or stack without changing the workflow. Operational tables may scroll horizontally when preserving columns is safer than hiding information.

## 11. Accessibility Requirements

- Visible keyboard focus is retained across all controls.
- Icon-only buttons have accessible names.
- Dialog focus handling remains accessible through the maintained primitive.
- Inputs have visible labels and programmatic error associations.
- Status and clinical meaning never rely on color alone.
- Text and interactive states meet accessible contrast requirements.
- Table selection remains keyboard-operable.
- Hover is never the only way to discover an essential action.

## 12. Verification

Implementation is complete only after running the applicable configured checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Visual verification must cover representative screens from every module at the three desktop target sizes, plus a narrower responsive check. The final audit must search for:

- Arbitrary or unmapped component colors.
- Mixed product icon families.
- Excessive `rounded-xl`, `rounded-2xl`, and larger radii.
- Shadows on non-floating content.
- Card nesting and decorative summary cards.
- Metadata rendered as unnecessary badges.
- Inconsistent page headings, toolbar placement, table framing, dialog footers, and pagination.
- Missing loading, empty, and error states.
- Icon-only controls without accessible names.

Existing tests are updated only where visual structure or accessible queries legitimately change. New tests focus on shared contracts and important interactions rather than implementation details.

## 13. Success Criteria

The redesign succeeds when:

- All implemented screens visibly belong to one clinic management product.
- The same shell, page hierarchy, spacing, typography, controls, tables, dialogs, and state treatments recur predictably.
- Staff can scan operational data without decorative clutter or excessive whitespace.
- Existing workflows and backend boundaries behave as before.
- No new arbitrary colors, redundant primitives, fake data, or invented functionality are introduced.
- Healthcare warnings remain explicit and accessible.
- Automated checks pass, or any pre-existing failure is isolated and documented with evidence.

## 14. Explicit Non-Goals

This redesign does not:

- Add or redesign backend APIs.
- Change domain terminology or workflow sequencing.
- Add dashboards, analytics, charts, or metrics.
- Replace the current architecture or state-management decisions.
- Introduce a new UI framework or styling dependency.
- Convert operational desktop screens into mobile-first card layouts.
- Resolve unrelated authentication, security, or data-contract debt unless a visual change directly exposes a regression.
