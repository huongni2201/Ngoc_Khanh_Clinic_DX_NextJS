# Backend-aligned modules: verification

Completed 2026-10-09 on `codex/backend-aligned-modules`.
[ADR-0009](../adr/0009-backend-aligned-module-ownership.md) records ownership;
[frontend architecture](../architecture/FRONTEND_ARCHITECTURE.md) describes the result.

This is a dated execution report. Results below apply to that module refactor,
not subsequent changes in the checkout. Current contract drift and remaining
work are tracked in [code follow-ups](code-follow-ups.md).

## Result

Frontend domain folders now match existing backend contexts: accesscontrol,
appointment, billing, catalog, clinical, diagnostics, document, encounter,
healthexamination, patient and prescription. Organization and Batch/Participant
remain features of healthexamination. Reception, doctor, patient/appointment
workspaces and encounter detail are widget compositions.

Routes, Vietnamese copy, component markup, request payloads, session handling,
validation and query invalidation behavior were preserved. Existing shadcn,
shared UI and domain components were reused; no new UI primitive was introduced.
Unsupported actions remain unavailable and do not send HTTP requests.

## Checks actually run

| Check | Result |
| --- | --- |
| Baseline unit/component tests | 72 suites / 590 tests passed |
| Baseline typecheck and Windows production build | Passed |
| Final lint | Passed, no errors or warnings |
| Final typecheck | Passed |
| Final unit/component tests | 76 suites / 598 tests passed |
| Final Windows production build | Passed; existing route list preserved |
| Terminology guard | Passed, 365 source files scanned |
| Production import graph | 278 files; no domain-to-widget/app dependencies, runtime file cycles or context cycles |
| Chrome E2E with mock backend | 22 passed: auth, batch CRUD/conflicts, Participant permissions/import/manual lifecycle, reconciliation/export/payment report, unsupported workspaces |
| Document links and diff whitespace | Verified |
| Real-backend E2E | Not run: localhost:8080 was unreachable |

Local commands used installed pnpm with `--pm-on-fail=ignore` and
`--config.verifyDepsBeforeRun=false` to avoid bootstrap/dependency installation
during checks. Node was 24.19.0 and local pnpm 11.24.0, below the documented
patch baselines; this is not verification under the exact pinned toolchain.
Bundled Playwright Chromium was absent, so E2E used installed Chrome through
`PLAYWRIGHT_CHANNEL=chrome`. No browser or dependency upgrade was added by the
refactor.

## Review and corrections

A fresh read-only review found no production migration regression. Its P2
finding was a missing organization-list handler in the new unsupported-route
test's mock. The supported lookup fixture was added and the full 22-case E2E
run passed. The Participant E2E selector was narrowed to the CCCD number label
because the existing form also has issue-date and issue-place labels.

A session test now asserts that the cache clears immediately, then waits for
the asynchronous React Query observer notification. All existing session
assertions remain; production session code was not changed.

## Execution decisions and limits

- Used the current checkout on a new branch to preserve dirty/untracked work;
  no automatic commit, push or merge. Concurrent UI cleanup and dependency
  removals were preserved and are outside this refactor.
- Used Windows/Node bookkeeping instead of Bash helpers. Source transfers
  verified hashes before rewriting imports. Windows denied individual-file
  deletion/rename, so originals were archived intact in ignored task scratch
  and remaining source files restored; backups/logs remain while work is uncommitted.
- Kept patient/appointment composition in widgets to avoid reverse domain
  dependencies, rather than adding forwarding or render-prop layers.
- Kept the catalog cache tuple unchanged. Local presentation types and fixture
  success shapes do not constitute new backend response contracts.
- Review set aside concurrent cleanup, real-backend authorization and the
  Participant test failure until executor verification. Concurrent work was
  preserved; the selector failure was fixed; production build was confirmed;
  real-backend authorization remains unverified.

No review minor findings were deferred. Backend permission gaps for mapped
Organization/Batch DELETE and catalog lookup remain as documented in the
[backend API inventory](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md).
