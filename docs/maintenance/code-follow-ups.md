# Frontend code follow-ups

Recorded 2026-10-05, updated 2026-10-06 after the frontend cleanup. The original
documentation/skill/hygiene repair did not change runtime source, package
dependencies or CSS. This list tracks the remaining implementation work; it does not restore removed features or invent backend endpoints.
[The backend inventory](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md)
owns HTTP availability.

| Priority | Evidence | Required follow-up and acceptance evidence |
|---|---|---|
| Medium | Participant list, examination matrix, report and export callers (`ParticipantsTab`, `OrganizationExaminationDetailTab`, `OrganizationReportsTab`, `utils/export-excel.ts`) are kept as roadmap code but are not mounted; the batch detail page shows "Chưa hỗ trợ" for those tabs and sends no request. | When the backend publishes those contracts, rebuild each caller on the real DTOs (legacy components still use the old fixture shapes), mount the tab and add tests/E2E. Until then do not add mock success. |
| Medium | The batch form selects dates with a native date input plus an "add day" list, and the catalog picker reads only the first page (size 100) of `GET /api/v1/catalog/services`. | Replace with a calendar multi-select if UX needs it; add catalog search/paging if the catalog exceeds 100 active services. |
| Low | `pnpm build` could not be verified on Linux: the `@hugeicons/core-free-icons` barrel references `Grid2x2*Icon.js` while the package ships `Grid2X2*Icon.js`, so webpack fails on case-sensitive file systems (the same import exists on `main`). Next dev/Playwright and Vitest are unaffected. | Verify `pnpm build` on Windows/macOS (case-insensitive) or import icons from direct paths; track upstream fix. |

## Resolved on 2026-10-06 (FE ↔ BE integration)

- Batch transport now matches the backend (`DRAFT|READY|FINALIZED|CLOSED`, `days`, `examinationDates`,
  `rowVersion`, `services[{serviceId, negotiatedPrice}]`); batch list/detail/create/update/delete and the
  service catalog call real endpoints with Zod parsing. Unknown statuses fail parsing.
- API error messages are Vietnamese per HTTP status; 409 keeps the form and offers an explicit reload
  (never an automatic resend); mutations never retry.
- Playwright: mock-backend specs (`e2e/batch-flow.spec.ts`, `e2e/unsupported-routes.spec.ts`) and
  real-backend smoke specs (`e2e/organization-flow.backend.spec.ts`, `e2e/batch-flow.backend.spec.ts`).

## Resolved on 2026-10-06

Details and evidence per finding are in
[the cleanup inventory](frontend-cleanup-inventory.md#kết-quả-triển-khai-2026-10-06).

- Roster import chain (API, hooks, dialog, template/upload/mapping/preview/confirm/cancel
  callers, import-preview types and fixtures) removed. No age-eligibility rejection remains.
- `cn` evaluated and kept: it matched clsx + tailwind-merge on 28 conflict cases.
  `shadcn` moved to devDependencies; `lucide-react` removed after the six billing callers
  moved to the Hugeicons adapter; lockfile updated.
- `axios` removed. It had no import in `src/`, `scripts/`, any root config file, `.env.example`
  or `docs` (only a guardrail example in ADR 0004); `src/shared/api/http-client.ts` uses
  `fetch`. `pnpm remove axios --lockfile-only` also dropped its transitive packages
  (`follow-redirects`, `form-data`, `https-proxy-agent`, `proxy-from-env` and others) from the lockfile.
- Colour contrast fixed in [globals.css](../../src/app/globals.css) for text pairs in light and dark
  (muted, status, info, destructive, primary/brand/sidebar foregrounds) plus the form `--input`
  border (3:1), `text-destructive-foreground` now maps to a real token, and low-opacity text
  (`text-primary/80`, `text-muted-foreground/30|40`, `text-destructive/90`) replaced by full-strength
  tokens. Guarded by `src/config/__tests__/color-contrast.test.ts`. Not done: inspecting hover/focus
  states in a real browser.

## Verification for the implementation phase

Run configured lint, typecheck, tests and build; run real browser/backend checks
for affected auth/cookie/CSRF flows and Playwright for critical UI paths.
Doc/link checks alone prove no runtime fix. Backend profile/actor and collaborator
placement work is tracked in
[backend code follow-ups](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/maintenance/code-follow-ups.md).

## Hygiene applied separately

Ignore pnpm cache, auth-test.log and superpowers state. Stop tracking the cache/log
while preserving local copies. Git attributes prefer LF with Windows script
exceptions; repository-wide renormalization is a separate change.
