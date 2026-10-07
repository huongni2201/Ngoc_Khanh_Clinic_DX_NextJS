# ADR-0008: Restore sessions only after a successful login

## Status

Accepted — 2026-10-06. Complements [ADR-0007](0007-session-login-backend-adr-0014.md),
which owns the backend login contract, session schema and staff-workspace access rule.

## Context

New visitors were blocked by `/me` network failures before they could see the
login form. Repeated mounts and focus/reconnect events repeated the probe. After
login, the backend session cookie remains HttpOnly while React Query's verified
session is in memory, so a reload needs to revalidate through `/me`.

## Decision

- Authentication endpoints, the cookie contract and workspace access follow ADR-0007.
- Store only `nkc-session-present=1` in localStorage after a verified session or
  successful login. This is a restore hint, never proof of identity or access.
  Credentials, tokens, session IDs and principal data are never persisted there.
- Without the hint, the shared session query returns anonymous locally and
  protected routes redirect to `/auth/login` without contacting `/me`.
- With the hint, a new page/tab verifies the HttpOnly session through `/me`.
  Successful session data stays fresh for 30 seconds across mounted consumers,
  avoiding duplicate probes immediately after login or navigation. No periodic
  keepalive is added. Focus/reconnect revalidate stale sessions.
- `/me` 401, protected-query 401 and successful logout clear the hint and business
  cache. Network/503 failures preserve it and expose an explicit retry action.
  Cross-tab change signals include a sender ID; the originating tab ignores its
  own signal so login preserves its fresh cache. Other tabs reset the query and
  use the shared hint to restore or clear it. Pending requests cannot resurrect
  a logged-out session.

## Consequences

A fresh browser can display login even with the backend offline. A cookie from
before this change without a hint requires signing in once again. A stale hint
after the browser session ends causes one `/me` check, then clears on 401.
If browser storage is disabled, the hint survives only within the current tab's
runtime; reload requires login again. Backend authorization remains authoritative.
No authentication dependency or backend public API/schema change is introduced.
