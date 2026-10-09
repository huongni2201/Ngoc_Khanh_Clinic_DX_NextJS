# Frontend code follow-ups

Updated 2026-10-09 against the current checkout and backend contracts. This list
owns remaining implementation work. Current integrations are described in the
frontend architecture; documentation updates do not imply a runtime fix.
[The backend inventory](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md)
owns HTTP availability.

| Priority | Evidence | Required follow-up and acceptance evidence |
|---|---|---|
| High | [Participant permission constants](../../src/modules/healthexamination/batches/utils/participant-permissions.ts) still use `HEALTH_EXAMINATION_PARTICIPANT_READ/IMPORT/MANAGE`. The [current list/import contract](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/participant-import-and-list.md#permissions) and [manual contract](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/participant-manual-crud.md#permission) supersede those grants. Template/import share one FE gate; manual actions share another. | Align list/detail with `PARTICIPANT_VIEW`, template with `PARTICIPANT_TEMPLATE_DOWNLOAD`, import with `PARTICIPANT_IMPORT`, and create/update/cancel/reactivate with `PARTICIPANT_CREATE/UPDATE/REMOVE/REACTIVATE` respectively. Test sessions granted each permission separately, permission-denied states and a real-backend STAFF session; keep backend authorization authoritative. Signing in again alone does not fix legacy FE constants. |
| High (backend dependency) | Organization DELETE, Batch DELETE and catalog lookup have handlers but no explicit production permission rules, according to the backend inventory. | Resolve backend authorization policy before declaring these operations production-ready; verify actual STAFF requests after the backend change. Local TEST bypass and browser mock E2E do not prove production access. |
| Medium | Legacy progress/report components and unavailable adapters remain as roadmap code. The published examination-details/import/export and payment-summary contracts are integrated by the batch feature. | Keep the supported integrations separate from legacy fixture shapes; visit preparation and clinical/official print features need explicit HTTP contracts. |
| Medium | The appointment dialog (`create-appointment-dialog.tsx`) used to link a Participant to a Patient by full CCCD. The Participant list now returns only a masked CCCD, so the dialog asks the user to choose the patient record instead. | When the backend exposes a Participant-to-Patient link (or a server-side lookup), restore automatic linking through it; never request or store the full CCCD in the list. |
| Low | Participant list is a local-state table (search, two status filters, sort, paging). The reconciliation status filter and the `batchDayId`/CCCD filters of the backend are not exposed in the UI. | Add them when a workflow needs them. |
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
