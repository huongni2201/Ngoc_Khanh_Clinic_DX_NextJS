# ADR-0007: Align login with the backend session-cookie contract

## Status

Accepted — 2026-10-06. Supersedes the CSRF exchange of
[ADR-0005](0005-staff-cookie-session.md) and the "effective role assignment"
access rule of [ADR-0006](0006-shared-user-login.md). Their cookie transport,
query-state, cross-tab and logout decisions remain in force.

## Context

The backend `identity` module was replaced by `accesscontrol`
(backend [ADR-0014](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/adr/0014-session-cookie-redis-login.md),
[login operations](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/login.md)).
It no longer offers `/api/v1/auth/csrf`, rejects cross-site writes by `Origin`,
returns a different principal shape and lets every signed-in STAFF account use
staff routes until per-endpoint RBAC exists. The frontend still fetched a CSRF
token before every write and validated the retired session shape, so sign-in,
`/me` and all mutations failed against the real backend.

## Decision

- The auth API uses `POST /api/v1/auth/login`, `GET /api/v1/auth/me` and
  `POST /api/v1/auth/logout`. No request fetches or sends a CSRF token; the
  browser's `Origin` header and backend CORS for the configured frontend
  origin protect writes. `apiClient` sends writes directly.
- The session schema mirrors the backend `UserPrincipal`: `userId`, `staffId`
  or `patientId`, `username`, `principalType`, `roleAssignments[]` of
  `{roleId, roleCode, permissions}`, `idleExpiresAt`, `absoluteExpiresAt`. The
  envelope `message` is optional because `/me` omits it.
- The login form sends the username and password exactly as typed (no trimming;
  username at most 150 characters) and blocks passwords above 72 UTF-8 bytes
  after NFKC normalization, matching the backend hash.
- Every STAFF session enters the staff workspace; PATIENT sessions see the
  access notice and can log out. Role codes are only displayed.
- A 403 on sign-in/sign-out explains an origin rejection; a 503 explains that
  sign-in is temporarily unavailable.

## Consequences

The frontend works against the current backend without a proxy. Production
needs the frontend and backend on the same site (the cookie is SameSite=Lax),
HTTPS, and `NKC_AUTH_ALLOWED_ORIGINS` set to the frontend origin. Frontend role
checks are not authorization; per-endpoint RBAC, rate limiting and revocation
remain backend go-live work.
