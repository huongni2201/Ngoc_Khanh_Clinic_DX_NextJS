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
| [0009](0009-backend-aligned-module-ownership.md) | Backend context ownership and workflow composition in widgets | Accepted; extends 0001 |

For current paths and ownership, use [frontend architecture](../architecture/FRONTEND_ARCHITECTURE.md)
and ADR-0009. Earlier examples may retain former module names. The current
single-step Participant import follows [PROJECT_RULES §12](../../PROJECT_RULES.md#12-participant-excel-import);
old import examples do not restore the preview/confirm/cancel workflow.

## When to Create an ADR

Create an ADR for architecture structure, state-management strategy, UI reuse strategy, auth/session strategy, API client/error strategy, print architecture or major framework/tooling changes.

Do not create ADRs for routine bug fixes, small refactors, single-screen implementation details, minor dependency patch upgrades or cosmetic changes.
