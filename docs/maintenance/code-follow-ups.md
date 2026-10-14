# Frontend code follow-ups

Updated 2026-10-13 against the current checkout and backend contracts. This list
owns remaining implementation work. Current integrations are described in the
frontend architecture; documentation updates do not imply a runtime fix.
[The backend inventory](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md)
owns HTTP availability.

| Priority | Evidence | Required follow-up and acceptance evidence |
|---|---|---|
| High | The [participant UI](../../src/modules/healthexamination/batches/utils/participant-permissions.ts) now matches backend codes for list, template download, import and manual create. Edit/cancel/reactivate still share the legacy `HEALTH_EXAMINATION_PARTICIPANT_MANAGE` gate. The [current list/import contract](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/participant-import-and-list.md#permissions) and [manual contract](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/participant-manual-crud.md#permission) define the endpoint grants. | Gate edit with `PARTICIPANT_DETAIL_VIEW` and `PARTICIPANT_UPDATE`, cancel with `PARTICIPANT_REMOVE`, and reactivate with `PARTICIPANT_REACTIVATE`. Verify each permission and denied state with a real-backend STAFF session; keep backend authorization authoritative. |
| High (backend dependency) | Organization DELETE, Batch DELETE and catalog lookup have handlers but no explicit production permission rules, according to the backend inventory. | Resolve backend authorization policy before declaring these operations production-ready; verify actual STAFF requests after the backend change. Local TEST bypass and browser mock E2E do not prove production access. |
| Medium | Legacy progress/report components and unavailable adapters remain as roadmap code. The published examination-details/import/export and payment-summary contracts are integrated by the batch feature. | Keep the supported integrations separate from legacy fixture shapes; visit preparation and clinical/official print features need explicit HTTP contracts. |
| Medium | The appointment dialog (`create-appointment-dialog.tsx`) used to link a Participant to a Patient by full CCCD. The Participant list now returns only a masked CCCD, so the dialog asks the user to choose the patient record instead. | When the backend exposes a Participant-to-Patient link (or a server-side lookup), restore automatic linking through it; never request or store the full CCCD in the list. |
| Low | Participant list is a local-state table (search, roster/attendance/examination-day filters, sort, paging). The reconciliation status and CCCD filters of the backend are not exposed in the UI. | Add them when a workflow needs them. |
| Medium | Examination form printing ([ADR-0010](../adr/0010-backend-rendered-examination-form-printing.md)) keeps the last print job only in tab state: a reload loses the link to a running job (the backend keeps it 24 hours). Print by examination day reuses "select all matching" (≤ 1,000, client-side order). Not verified against a real backend, Gotenberg or a printer. | Add a "my print jobs" list when the backend exposes it (own permission, ADR-0015); move ordering/grouping to the backend scope request when plan E1–E4 is built. Run Playwright against the backend with Gotenberg and print one A3 duplex form on the clinic printer. |
| Medium | The batch form selects dates with a native date input plus an "add day" list, and the catalog picker reads only the first page (size 100) of `GET /api/v1/catalog/services`. | Replace with a calendar multi-select if UX needs it; add catalog search/paging if the catalog exceeds 100 active services. |
| Low | Earlier Linux verification reported a case mismatch in the `@hugeicons/core-free-icons` barrel (`Grid2x2*Icon.js` versus `Grid2X2*Icon.js`). The [2026-10-09 report](backend-aligned-modules-verification.md#checks-actually-run) records a passing Windows build, under toolchain patches below the pinned baseline. | Verify the exact pinned Node/pnpm toolchain and a case-sensitive build before claiming portability. The Windows result does not close the Linux finding. |

## Current integration and verification

- Corporate integration: real batch CRUD/catalog transport, exact `DRAFT|READY|FINALIZED|CLOSED` parsing, Vietnamese errors and explicit 409 reload. Current Participant/manual/import, examination-details and payment-report integrations are described in [frontend architecture](../architecture/FRONTEND_ARCHITECTURE.md#corporate-health-examination-flow).
- [Module verification, 2026-10-09](backend-aligned-modules-verification.md): backend-aligned contexts, workflow widgets, Windows build and mock E2E evidence. Real-backend E2E was not run; legacy Participant permission gates remain an open item above.

## Verification for the implementation phase

Run configured lint, typecheck, tests and build; run real browser/backend checks
for affected auth/cookie/CSRF flows and Playwright for critical UI paths.
Doc/link checks alone prove no runtime fix. Backend authorization and go-live
dependencies are tracked in
[backend open items](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/architecture/07-open-items.md).
