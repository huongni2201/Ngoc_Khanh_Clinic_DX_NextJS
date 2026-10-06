# ADR-0003: Frontend State Ownership

## Status

Accepted

## Context

The frontend uses TanStack Query, React Hook Form, Zod, Next.js routing, Zustand and React local state.

Without clear ownership, the same information can be duplicated between query cache, Zustand store, form state, URL and component state.

This creates synchronization bugs and unnecessary complexity.

## Decision

Assign state by responsibility:

```text
TanStack Query    → remote/server state
React Hook Form   → form state
Zod               → validation/schema boundaries
URL/search params → shareable filters/search/navigation
React local state → local transient UI state
Zustand           → true cross-component client-only state
```

Rules:

- Do not copy TanStack Query results into Zustand.
- Do not put form state into Zustand when React Hook Form is appropriate.
- Do not create a global store for local component state.
- Prefer URL state when users should be able to refresh/share/bookmark the current filter/search state.

## Examples

### Company List Data

Use TanStack Query.

### Company Search Query

Prefer URL search params when the search/filter should survive refresh and be shareable.

Terminology clarification — 2026-10-06: “Company List Data” and “Company Search
Query” are the historical example names. Read them as organization list data and
organization search query (`Organization`, UI “Đơn vị”). The state decisions are unchanged.

### Excel Import Form State

Use React Hook Form with Zod validation.

Applicability note — 2026-10-05: this is a historical state-ownership example.
The owner removed Excel roster import under
[backend ADR-0013](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/adr/0013-clean-slate-application-contract.md#roster-import-scope).
The state decision remains accepted; the example does not authorize restoring import.

### Sidebar Collapsed State

May use Zustand if shared across shell components.

### Dialog Open State

Use local React state unless multiple unrelated components truly need to control it.

## Consequences

### Positive

- Clear source of truth.
- Less synchronization code.
- Smaller global stores.
- Easier testing.
- Easier debugging.

### Negative

- A workflow may legitimately use multiple state mechanisms.
- Developers must classify state before implementing it.

## Guardrails

Any new Zustand store must answer:

```text
Why is local React state insufficient?
Why is URL state insufficient?
Why is React Hook Form insufficient?
Why is TanStack Query insufficient?
Which unrelated components need this client-only state?
```
