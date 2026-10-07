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
| [0005](0005-staff-cookie-session.md) | Staff authentication with backend cookie sessions | Accepted; CSRF exchange superseded by 0007 |
| [0006](0006-shared-user-login.md) | Shared user login and staff workspace access | Accepted; access rule superseded by 0007 |
| [0007](0007-session-login-backend-adr-0014.md) | Align login with the backend session-cookie contract | Accepted |
| [0008](0008-login-session-restoration.md) | Conditional session restoration through backend verification | Accepted |

## When to Create an ADR

Create an ADR for architecture structure, state-management strategy, UI reuse strategy, auth/session strategy, API client/error strategy, print architecture or major framework/tooling changes.

Do not create ADRs for routine bug fixes, small refactors, single-screen implementation details, minor dependency patch upgrades or cosmetic changes.
