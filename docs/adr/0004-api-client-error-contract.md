# ADR-0004: API Client and Frontend Error Contract

## Status

Accepted

## Context

Ngọc Khánh Clinic frontend will integrate with multiple backend domains:

```text
companies
health-check batches
employees
patients
encounters
clinical workflow
diagnostics
billing
```

If individual pages/components call Axios/fetch directly, the application will accumulate inconsistent base URL handling, timeouts, authentication/session behavior, error parsing, request IDs, validation errors, 401 handling and retry behavior.

Raw backend/transport errors should not leak into UI components.

## Decision

Use a layered API flow:

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

The shared HTTP client owns cross-cutting transport concerns.

Module API files own endpoint-specific request/response contracts.

Query/mutation hooks own TanStack Query behavior.

Presentation components consume domain-friendly data/errors.

## Shared HTTP Responsibilities

The shared HTTP layer may own:

```text
base URL
default timeout
credentials/session configuration
request ID propagation
transport-level error normalization
401/403 common behavior
safe logging policy
```

It should not own business-specific endpoint logic.

## Frontend Error Model

Normalize failures into a stable shape such as:

```ts
type AppError = {
  code: string
  message: string
  status?: number
  fieldErrors?: Record<string, string[]>
  requestId?: string
}
```

Rules:

- UI must not display raw stack traces.
- UI must not depend directly on Axios error internals.
- Validation errors should be mappable to form fields.
- Request IDs should be preserved when available for support/debugging.
- Sensitive response payloads must not be logged indiscriminately.

## API DTO vs UI Model

Do not assume:

```text
API DTO === UI model
```

When necessary:

```text
API DTO
↓
mapper
↓
frontend domain/view model
```

Mapping logic belongs close to the owning module.

## TanStack Query Ownership

Query hooks own query keys, fetch lifecycle, cache policy, invalidation, mutation state and retry behavior.

Components should not manually recreate these rules.

## Retry Policy

Do not automatically retry all failures.

Typical guidance:

```text
network/transient 5xx → may retry
validation 4xx       → do not retry automatically
401/403              → handle auth/permission flow
business conflict    → surface meaningful action
```

Actual backend contract wins.

## Consequences

### Positive

- Consistent API behavior.
- Consistent user-facing error handling.
- Easier backend changes.
- Easier testing/mocking.
- Better observability with request IDs.
- Less HTTP knowledge in UI components.

### Negative

- Adds a small abstraction layer.
- Requires discipline when adding endpoints.

## Guardrails

Forbidden in presentational components:

```ts
axios.get(...)
axios.post(...)
fetch(...)
```

unless the component is explicitly an infrastructure boundary.

Do not invent missing backend fields or endpoints. If a contract is uncertain, document the assumption and request confirmation.
