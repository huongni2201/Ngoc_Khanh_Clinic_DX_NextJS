# ADR-0001: Frontend Module Architecture

## Status

Accepted

## Context

Ngọc Khánh Clinic contains multiple business workflows with different ownership:

```text
corporate health checks
employees
patient registry
encounters
clinical workflow
diagnostics
billing
```

A purely technical folder structure such as global `components/`, `services/`, `hooks/` for all business code would spread one feature across unrelated folders.

A very heavy architecture framework would add unnecessary ceremony for a new frontend.

The project also uses Next.js App Router and shadcn/ui.

## Decision

Use:

```text
Next.js App Router
+
Domain / Module-Based Architecture
```

Canonical structure:

```text
src/
├── app/
├── components/
│   └── ui/
├── modules/
├── shared/
├── widgets/
├── providers/
└── lib/
```

Responsibilities:

```text
app            routing/composition
components/ui  shadcn primitives
modules        business/domain ownership
shared         cross-module reusable frontend capabilities
widgets        large reusable application compositions
providers      global React providers
lib            small framework/shadcn utilities
```

Modules expose cross-module public contracts through `index.ts`.

Empty folder structures are not created speculatively.

## Alternatives Considered

### Technical-Layer Structure

```text
components/
services/
hooks/
types/
utils/
```

Rejected because business features become fragmented across the repository.

### Full Feature-Sliced Design

Not selected because it introduces more layers/conventions than currently needed.

### Flat App-Router-Only Structure

Rejected because domain ownership becomes unclear as the product grows.

## Consequences

### Positive

- Clear business ownership.
- Strong feature locality.
- Easier onboarding.
- Easier AI-agent navigation.
- shadcn stays in a conventional primitive layer.
- Shared and domain code remain distinct.

### Negative

- Developers must decide whether a component is primitive, shared or domain-owned.
- Some module structures will differ because folders are created only when needed.

## Guardrails

- Do not put domain business logic in `app`.
- Do not turn `shared` or `lib` into dumping grounds.
- Avoid deep cross-module imports.
- `components/ui` must remain business-neutral.
- Do not introduce another architecture scheme without a superseding ADR.
