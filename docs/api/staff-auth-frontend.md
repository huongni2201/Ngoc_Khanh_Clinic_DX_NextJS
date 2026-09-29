# Staff login/logout frontend

## Setup

Use the project's pnpm scripts. Copy `.env.example` to `.env.local` and set
`NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`. Start the existing identity
backend and Redis, using the backend local profile and a provisioned active staff
account with credentials and at least one effective role. Start frontend with
`pnpm dev` and open `http://localhost:3000/auth/login`.

Use localhost consistently; do not mix it with 127.0.0.1. The backend must allow
the exact frontend origin. Production requires a configured API URL at build time,
HTTPS, same-site hosts and credentialed CORS. No JWT signing key belongs in frontend
configuration. NEXT_PUBLIC variables are public.

## Request lifecycle

1. `/me` checks for an existing session. A 401 presents login; network/503 failures
   show verification error and Retry, without pretending the session was revoked.
2. Submit obtains `/csrf`, then POSTs username/password to `/staff/login` with the
   masked JSON token in `X-XSRF-TOKEN`. Cookies are handled by the browser.
3. Success stores the response view in query memory and replaces the route with
   `/organizations`. AppShell verifies the session before mounting business screens.
4. The account menu shows the backend username and role codes. “Đăng xuất” fetches
   fresh CSRF and POSTs `/logout`. Only 204 clears cached data and returns to login.
5. Other tabs receive a change signal and recheck `/me`. Focus and reconnect also
   revalidate. There is no periodic heartbeat extending the 30-minute idle timeout.

Auth responses and cookies must never be logged. Legacy localStorage auth keys are
removed; credentials and tokens are not persisted. Session response permissions
retain assignment scope and are not a substitute for backend authorization.

## Errors

- Invalid credentials: generic Vietnamese error, with no account-existence detail.
- CSRF/403: show error; a manual retry obtains a new token. Do not replay mutations.
- Rate limit: show the Retry-After delay and disable login until it ends.
- Network/500/503: show a retryable error. Timeout does not prove the server did
  not execute the request; never report logout success without 204.
- Business API 401 clears the current view/cache; 403 shows access denied without
  redirecting to login. Production currently denies business endpoints without an
  explicit backend RBAC policy, even after successful login.

## Verification

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, then `pnpm test:e2e`.
The E2E suite uses Playwright Chromium with HTTP fixtures. It verifies navigation
and UI behavior but does not prove backend cookie/CORS behavior.

For the real backend smoke test, export `E2E_STAFF_USERNAME` and
`E2E_STAFF_PASSWORD` in the test process environment, then run
`pnpm test:e2e:backend`. These variables are not NEXT_PUBLIC and must not be
committed. The test uses a fresh browser context, logs in, checks HttpOnly cookie
attributes, reloads, logs out and verifies the protected route redirects. It does
not seed accounts or run migrations. The backend test is skipped without these
credentials; a skip is not a verified integration result.

Playwright uses localhost:3000 and starts Next dev if needed. If reusing an existing
server, ensure its API URL matches the test process configuration. Install the
Chromium test browser with `pnpm exec playwright install chromium` when absent.
Alternatively, set `PLAYWRIGHT_CHANNEL=chrome` to use an installed Chrome browser.
Traces, screenshots and videos are disabled to avoid capturing credentials in
the real-account smoke test.

## Boundaries

No remember-me, reset-password, logout-all UI or business RBAC is implemented.
Business mock data already present in other modules is outside this change. The
employee-roster API is the existing real request moved to shared transport so it
sends the authentication cookie and handles 401/403 correctly.
