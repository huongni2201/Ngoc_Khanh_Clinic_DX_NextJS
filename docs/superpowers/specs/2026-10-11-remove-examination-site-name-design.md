# Remove the examination-site name field

**Status:** Approved by owner on 2026-10-11  
**Date:** 2026-10-11

## Owner request

Remove the separate `Tên địa điểm` field completely. Keep the examination-site type and the conditional address: clinic batches do not need an address; organization-site batches do.

## Current behavior

The batch form collects the site type, a site name and an address. `examinationSiteName` is required in create and update requests, stored in `health_examination_batches.examination_site_name`, returned in batch details, and shown in the batch overview and summary strip. The payment-summary Word document also carries and prints a site name alongside the address.

The address contract is already conditional in the frontend and backend: `CLINIC` accepts an empty address, while `ORGANIZATION_SITE` requires a non-blank address. The database currently stores an empty string for clinic addresses because the column is `NOT NULL`.

## Decision

Make site type and address the complete batch-site model. Remove `examinationSiteName` / `examination_site_name` from all runtime layers:

- Frontend form values, validation, transport schema, API mapping, response types, batch detail views and fixtures.
- Backend create/update request DTOs, `BatchConfiguration`, `ExaminationSite`, use cases, detail response, persistence record, repository and MyBatis SQL.
- Payment-report document model and Word output, so it no longer receives or prints a site name.
- The final database schema.

Keep `examinationSiteType` (`CLINIC` or `ORGANIZATION_SITE`) and `examinationSiteAddress`. For `CLINIC`, the address is empty. For `ORGANIZATION_SITE`, the address remains required. The form continues to show only the location type and the address field when applicable. Batch detail shows the type and, for organization-site batches, the address. The summary strip shows “Tại phòng khám” for clinic batches and the address for organization-site batches. The Word report displays the site type for clinic batches and the address for organization-site batches.

## Database migration and data effect

The column is defined in `V001__create_schema.sql`. Do not rewrite that migration because it may already be applied. Add a forward migration, provisionally `V008__drop_health_exam_batch_site_name.sql`, that drops `public.health_examination_batches.examination_site_name` from databases using the current V001–V003 baseline. The migration permanently removes values stored in that column. The latest schema and all runtime queries must work without it.

The backend deployment policy says databases with older V004–V007 migration histories require a separately reviewed conversion. This change must not be deployed directly against those historical databases without that conversion. Production migration execution remains an explicit deployment step; this implementation prepares the migration but does not apply it to a live database.

Because the request and response bodies change, deploy the frontend and backend as a coordinated contract change, with the database migration applied before backend code that omits the column is deployed.

## Alternatives considered

1. **Remove the field and storage column (selected).** This matches the request and removes the redundant concept from every contract and presentation. Existing site-name values are deleted by the forward migration.
2. **Remove the UI field but retain the API and column.** This leaves stale runtime/storage state and does not satisfy complete removal.
3. **Auto-fill a site name from the organization or clinic type.** This removes manual entry but preserves the redundant field across API, domain and database.

## Acceptance criteria

- Create and update API contracts contain no site-name field; batch-detail responses contain no site-name field.
- Domain, command, persistence record and MyBatis statements contain no site-name value or column reference.
- The final migrated database has no `examination_site_name` column; the forward migration removes its existing values.
- Frontend creation/edit forms contain no site-name field. Clinic address remains empty and hidden; organization-site address remains visible and required.
- Batch detail and payment-summary Word output show location type/address without a site name.
- Documentation describes the latest migration state and the legacy migration-history limitation.
