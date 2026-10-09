# ADR-0009: Backend-aligned frontend module ownership

## Status

Accepted on 2026-10-09 by the project owner. Extends
[ADR-0001](0001-frontend-module-architecture.md); the App Router and domain/module
architecture remain in effect.

## Context

Frontend folders mixed backend domains and staff workspaces. Organization and
Batch lived in separate modules although backend `healthexamination` owns both.
Catalog lookup lived inside the batch feature. Encounter detail mixed encounter,
clinical, diagnostics, prescription and document data. Patient and appointment
pages composed reception functionality, creating cycles when reception moved.

The owner approved matching frontend module names and ownership to the
[backend contexts](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/architecture/02-module-contracts.md).

## Decision

- Use `accesscontrol`, `appointment`, `patient`, `encounter`, `clinical`,
  `diagnostics`, `prescription`, `document`, `billing`, `catalog` and
  `healthexamination` for existing domain code. Do not scaffold unused contexts.
- Keep Organization and Batch/Participant features under
  `healthexamination/organizations` and `healthexamination/batches`.
- Put reception, doctor, patient/appointment workspaces and encounter detail
  composition in `widgets`. Domain modules must not depend on widgets or app.
- Use public context exports across modules; use direct internal imports within
  a context to avoid cycles through its barrel.
- Domain components accept their own data slices. The combined
  `EncounterDetailData` is a widget view model, not a transport DTO.
- Catalog owns its API/schema/type/hook/query factory. Preserve the existing
  cache tuple during this refactor; folder names do not rename cache entries.
- Keep current routes, Vietnamese copy, HTTP contracts, session handling,
  validation and error behavior. Unsupported encounter actions reject through
  the existing unavailable adapter; no new endpoint or successful response
  contract is inferred from schema tables.

## Alternatives

Keeping old folders with an ownership table was smaller but left the domain and
workspace distinction unclear. Copying every backend context and Java layer
would create unused structure and frontend forwarding layers. The selected
approach preserves the frontend's existing technical layers while clarifying
business ownership.

## Consequences

Backend/frontend navigation uses the same context vocabulary. Composition can
evolve without making domain modules depend on a staff role's screen. Moving
files requires updating tests, fixtures and public exports together. Legacy
presentation types remain presentation types until real HTTP contracts exist;
this decision does not authorize new clinical or payment integrations.
