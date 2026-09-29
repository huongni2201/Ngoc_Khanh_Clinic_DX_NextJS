# ADR-0005: Staff authentication with backend-managed cookie sessions

## Status

Accepted — implements the approved staff login/logout plan.

## Context

The previous frontend simulated authentication and trusted a fabricated token and
user in localStorage. The identity backend now owns staff credentials, JWTs in Redis,
session expiry, revocation, CSRF and authorization. Its public browser credential
is an opaque HttpOnly session cookie; it never exposes a JWT to frontend code.

## Decision

- Browser requests go directly to the configured backend using the shared fetch
  client with credentials included, no-store caching and a 15-second timeout.
- Auth API adapters validate the backend response with Zod. Login and logout first
  fetch a fresh masked CSRF token from JSON and submit it in the returned header.
  JavaScript does not read CSRF/session cookies and does not persist tokens.
- TanStack Query owns the session view under `["auth", "session"]`. `/me` restores
  it on mount and focus/reconnect; there is no periodic keepalive. A 401 means no
  valid session; an outage means verification failed, not successful logout.
- AuthBoundary prevents protected client screens from mounting before verification.
  It is a UX boundary, not server-side authorization. Future sensitive Server
  Component data access must enforce its own backend authentication boundary.
- AppShell uses the real username and role codes. Backend fields do not include a
  display name or email; the UI does not fabricate them. Business RBAC remains
  authoritative on the backend.
- Login/logout mutations are not retried automatically. Only successful logout
  clears the session; 503, network errors and timeouts leave revocation unconfirmed.
- Account transitions cancel pending queries and clear business data. Cross-tab
  BroadcastChannel messages contain only a change signal and cause `/me` revalidation.
- Presentation uses hooks and module API contracts. Shared transport never imports
  auth or performs navigation. Protected query metadata opts into provider-level
  handling of 401; 403 does not trigger logout.

## Consequences

Production requires HTTPS, same-site frontend/backend hosts and an explicit CORS
allowlist because backend cookies are SameSite=Lax. Authentication is checked in
the browser; no BFF, server-side cookie forwarding, bearer-token fallback or new
dependency is introduced. Cross-tab synchronization falls back to focus/mount
revalidation if BroadcastChannel is unavailable.

The existing UI remains in place. Remember-me, password reset, logout-all and
frontend RBAC are outside this feature. Non-auth business mocks are not converted
by this decision. Real browser/backend testing remains necessary in addition to
fixture-based UI tests to verify cookie and CORS configuration.

Related decisions: [ADR-0003](0003-frontend-state-management.md),
[ADR-0004](0004-api-client-error-contract.md).
