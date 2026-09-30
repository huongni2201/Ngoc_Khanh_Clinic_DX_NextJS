# ADR-0006: Shared login and staff workspace access

## Status

Accepted — 2026-09-30. Supersedes the staff-only session shape, login route and
redirect in [ADR-0005](0005-staff-cookie-session.md). Its cookie, CSRF, query-state
and logout decisions remain in force.

## Context

The identity backend now authenticates both STAFF and PATIENT users, including
users without effective role assignments. The frontend currently exposes staff
business screens and has no patient portal.

## Decision

- The auth client uses `POST /api/v1/auth/login` and validates a discriminated
  STAFF/PATIENT session response. It retains the masked CSRF exchange and does not
  read the session cookie.
- Only STAFF with an effective role assignment enter the existing staff workspace.
  PATIENT and roleless STAFF remain signed in on the login route, see an access
  notice and can log out. Direct staff route visits show the same notice without
  mounting business content or the staff shell.
- On `/me` revalidation, losing staff workspace access clears cached business data
  even when the user ID is unchanged. A 403 does not clear the authentication
  session; backend authorization remains authoritative.

## Consequences

The frontend can display authenticated patients without granting access to staff
screens. Patient self-registration, clinical-record UI and RBAC remain separate
work. The old staff login URL is no longer supported.
