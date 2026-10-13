# ADR-0010: Backend-rendered examination form printing

## Status

Accepted on 2026-10-13 by the project owner (plan
`20261012-examination-form-printing`, option B level 2, and its v2 review).
Supersedes the print model of [PROJECT_RULES §13–14](../../PROJECT_RULES.md#13-examination-form-printing)
as written before this date (one React Mẫu 03 implementation, A4, browser print of HTML).
Backend counterpart: [ADR-0017](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/adr/0017-document-rendering-and-template-lifecycle.md).

## Context

The clinic prints a blank periodic examination form (Mẫu số 03) for every
Participant of an organization's batch. The layout changes with regulations and
belongs to the clinic, not to a deploy: the backend now fills a `.docx` template
the clinic manages, converts it to PDF (Gotenberg/LibreOffice) and exposes two
contracts:

- `GET …/participants/{participantId}/examination-form`: one PDF, on demand,
  `no-store` (`PARTICIPANT_EXAMINATION_FORM_PRINT`).
- `POST …/participants/examination-form-print-jobs` (202, `Idempotency-Key`),
  then `GET /api/v1/document-render-jobs/{jobId}` and
  `GET …/{jobId}/parts/{partNo}`: a background job that merges up to 200 forms
  per PDF part, kept 24 hours, visible only to its creator
  (`PARTICIPANT_EXAMINATION_FORM_BULK_PRINT`, `DOCUMENT_RENDER_JOB_READ`,
  `DOCUMENT_RENDER_JOB_DOWNLOAD`).

A second rendering of the same form in React would drift from the template the
clinic publishes, and the browser cannot paginate a 2-page A3 booklet reliably.

## Decision

- The frontend never lays out an examination form. It shows and prints the PDF
  the backend returns. There is no Mẫu 03 component, no print route and no
  `window.print()` of HTML.
- Paper size and orientation belong to the template. The UI reads the paper of
  the single-form PDF (MediaBox) to tell staff what to load, and always asks for
  100% scale. The current starter is A3 landscape, 2 pages per Participant,
  duplex flipped on the short edge.
- Ownership (ADR-0009): `document` owns the render-job transport, polling hook,
  status/skip/error labels and part download; `healthexamination` owns the
  Participant print endpoints, the selection and the dialogs in the Participants
  tab.
- Single print: a row action opens a dialog that requests the PDF, shows it in an
  iframe from a blob URL and offers Print, open in a new tab and download. The
  bytes live only while the dialog is open (`gcTime: 0`, URL revoked on close).
- Bulk print: rows are selected across pages (cancelled rows cannot be selected);
  "select all matching" reads the active roster for the current filter, including
  the examination day, and refuses more than 1,000 people (one job). The dialog
  orders the forms by department then code (default) or by code, creates one
  `Idempotency-Key` per body and reuses it on a manual retry. It then polls the
  job every 2 s while queued/running and only while the tab is visible, lists the
  PDF parts and the skipped people by name with a Vietnamese reason. Closing the
  dialog does not stop the job; the tab keeps the last job and can reopen it.
- Printing is offered only for READY and FINALIZED batches and only to accounts
  holding the permissions above (UX only; the backend decides). Backend English
  messages are never rendered.

## Alternatives

- React Mẫu 03 + browser print (former §13): rejected; two layouts to maintain and
  no control over page breaks or paper size.
- Synchronous bulk PDF: rejected by the backend contract; hundreds of forms exceed
  a request timeout.
- A "my print jobs" list across reloads: needs a backend list endpoint and its own
  permission (ADR-0015 of the backend); deferred.

## Consequences

- No print styles or print routes are needed in the frontend; `/health-check`
  print routes stay unplanned.
- The shared API client gained a per-request `timeoutMs` for on-demand rendering
  (45 s) and part downloads (180 s); the default stays 15 s.
- A page reload loses the reference to a running job (the job continues and its
  files expire after 24 hours). Template upload/publish screens, per-organization
  templates, barcodes and printing directly to a printer are separate work.
