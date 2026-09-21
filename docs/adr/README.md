# Architecture Decision Records

This directory contains long-lived **frontend architecture decisions**.

ADRs explain:

```text
Context
Decision
Consequences
```

Accepted ADRs should not be rewritten to change history. When a decision changes, create a new ADR that supersedes the old one.

## Index

| ADR | Decision | Status |
|---|---|---|
| [0001](0001-frontend-module-architecture.md) | Frontend module architecture | Accepted |
| [0002](0002-reuse-first-ui-components.md) | Reuse-first UI component strategy | Accepted |
| [0003](0003-frontend-state-management.md) | Frontend state ownership | Accepted |
| [0004](0004-api-client-error-contract.md) | API client and frontend error contract | Accepted |

## When to Create an ADR

Create an ADR for architecture structure, state-management strategy, UI reuse strategy, auth/session strategy, API client/error strategy, print architecture or major framework/tooling changes.

Do not create ADRs for routine bug fixes, small refactors, single-screen implementation details, minor dependency patch upgrades or cosmetic changes.
