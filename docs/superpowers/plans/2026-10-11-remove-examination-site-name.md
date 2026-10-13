# Remove the examination-site name field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `examinationSiteName` / `examination_site_name` from the frontend, backend, reports and final database schema while keeping site type and conditional address behavior.

**Architecture:** Keep `ExaminationSite` as a two-value domain object (`type`, `address`). Remove the name from transport, application, persistence and presentation models. Add a forward Flyway migration because V001 is immutable; update frontend and backend together as one breaking contract change.

**Tech Stack:** Next.js 16.3.5, React Hook Form, Zod, TypeScript; Java 25, Spring Boot 4, Jakarta Validation, MyBatis, PostgreSQL 18, Flyway.

**Spec:** `docs/superpowers/specs/2026-10-11-remove-examination-site-name-design.md`

## Global Constraints

- Keep `examinationSiteType` values `CLINIC` and `ORGANIZATION_SITE`.
- `CLINIC` accepts an empty address; `ORGANIZATION_SITE` requires a non-blank address.
- Do not rewrite applied V001; add a new forward migration and document the older V004–V007 history limitation.
- The migration removes `examination_site_name` from the SQL schema and its values from normal SQL access; it is not a physical secure-erasure procedure. Do not apply it to a live database as part of implementation.
- Preserve existing worktree edits; do not stage or commit unrelated frontend changes.
- Keep the frontend and backend request/response contracts aligned for coordinated deployment.

## Review Focus

- Clinic batch with an empty address: UI omits the address field, request sends an empty address, and presentation identifies “Tại phòng khám”.
- Organization-site batch with a blank address: frontend validation and backend request validation reject it.
- Batch detail response: contains site type/address and no site-name property.
- Payment-summary Word output: clinic output uses the clinic type label; organization-site output uses its address.
- V008 migration: removes the name column from the current V001–V003 baseline; PostgreSQL may not immediately reclaim old column bytes. Older V004–V007 histories remain subject to the documented conversion procedure.

---

### Task 1: Remove the name from backend contracts, persistence and reports

**Files:**
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/java/com/ngockhanh/clinic/healthexamination/domain/valueobject/ExaminationSite.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/java/com/ngockhanh/clinic/healthexamination/application/command/BatchConfiguration.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/java/com/ngockhanh/clinic/healthexamination/api/request/CreateHealthExaminationBatchRequest.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/java/com/ngockhanh/clinic/healthexamination/api/request/UpdateHealthExaminationBatchRequest.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/java/com/ngockhanh/clinic/healthexamination/application/usecase/CreateHealthExaminationBatchUseCase.java` and `UpdateHealthExaminationBatchUseCase.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/java/com/ngockhanh/clinic/healthexamination/application/response/BatchDetailResponse.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/java/com/ngockhanh/clinic/healthexamination/infrastructure/persistence/record/HealthExaminationBatchRecord.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/java/com/ngockhanh/clinic/healthexamination/infrastructure/persistence/repository/MyBatisHealthExaminationBatchRepository.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/resources/mapper/healthexamination/HealthExaminationBatchMyBatisMapper.xml`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/java/com/ngockhanh/clinic/healthexamination/application/query/PaymentReportDocument.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/java/com/ngockhanh/clinic/healthexamination/application/usecase/ExportPaymentSummaryReportUseCase.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/java/com/ngockhanh/clinic/healthexamination/infrastructure/word/PoiPaymentReportDocxWriter.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/test/java/com/ngockhanh/clinic/healthexamination/BatchFixtures.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/test/java/com/ngockhanh/clinic/healthexamination/api/controller/OrganizationBatchControllerTest.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/test/java/com/ngockhanh/clinic/healthexamination/application/usecase/BatchConfigurationUseCaseTest.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/test/java/com/ngockhanh/clinic/healthexamination/application/usecase/ExaminationDetailUseCasesTest.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/test/java/com/ngockhanh/clinic/healthexamination/infrastructure/persistence/HealthExaminationBatchMapperTest.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/test/java/com/ngockhanh/clinic/healthexamination/infrastructure/persistence/HealthExaminationBatchCrudIntegrationTest.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/test/java/com/ngockhanh/clinic/healthexamination/infrastructure/persistence/ExaminationDetailIntegrationTest.java`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/src/test/java/com/ngockhanh/clinic/infrastructure/migration/HealthExaminationDatabaseMigrationIntegrationTest.java`
- Create: `../Ngoc_Khanh_Clinic_DX_Springboot/src/main/resources/db/migration/V008__drop_health_exam_batch_site_name.sql`

**Interfaces:**
- Consumes: approved design in `docs/superpowers/specs/2026-10-11-remove-examination-site-name-design.md`.
- Produces: backend create/update requests and batch-detail responses with `examinationSiteType` and `examinationSiteAddress`, with no site-name property; `ExaminationSite(type, address)`; payment-report document carrying site type/address only.

- [ ] **Step 1: Remove the site name from the domain and command.** Change `ExaminationSite` to hold only type/address and remove the name parameter from `BatchConfiguration`, create/update use cases and their domain construction calls. Keep conditional address rules unchanged.
- [ ] **Step 2: Remove the site name from API and persistence.** Remove it from create/update request DTOs, `BatchDetailResponse`, `HealthExaminationBatchRecord`, repository mapping and all MyBatis header/select/insert/update SQL. Keep create/update request validation for the address by site type.
- [ ] **Step 3: Remove the site name from payment-report data.** Replace `PaymentReportDocument.siteName` with the site type needed for display; render “Tại phòng khám” for clinic batches and the address for organization-site batches.
- [ ] **Step 4: Add the forward database migration.** `V008__drop_health_exam_batch_site_name.sql` drops `public.health_examination_batches.examination_site_name`. Leave V001 unchanged.
- [ ] **Step 5: Adapt existing backend fixtures.** Remove the deleted property from existing request JSON, builders, SQL inserts and report assertions. Adapt existing fixture/test source only to the new contract; do not add test cases or execute test suites in this work.
- [ ] **Step 6: Verify compilation without executing tests.** Run `mvnw.cmd -DskipTests test-compile` from the backend root so changed production and existing test sources compile, then run `git diff --check` for the backend files.

### Task 2: Remove the name from the frontend contract and UI

**Files:**
- Modify: `src/modules/healthexamination/batches/schemas/health-examination-batch.schema.ts`
- Modify: `src/modules/healthexamination/batches/components/batch-form/health-examination-batch-basic-info-section.tsx`
- Modify: `src/modules/healthexamination/batches/components/batch-form/health-examination-batch-form-dialog.tsx`
- Modify: `src/modules/healthexamination/batches/utils/batch-form-values.ts`
- Modify: `src/modules/healthexamination/batches/types/transport.ts`, `types/index.ts`, and `api/index.ts`
- Modify: `src/modules/healthexamination/batches/components/health-examination-batch-overview.tsx`
- Modify: `src/modules/healthexamination/batches/components/health-examination-batch-summary-strip.tsx`
- Modify: `src/modules/healthexamination/batches/__tests__/fixtures/api-fixtures.ts`
- Modify: `src/modules/healthexamination/batches/__tests__/health-examination-batch-detail.test.tsx`
- Modify: `src/modules/healthexamination/batches/__tests__/health-examination-batch-schema.test.ts`
- Modify: `src/modules/healthexamination/organizations/__tests__/create-health-examination-batch.test.tsx`
- Modify: `e2e/batch-flow.spec.ts` and `e2e/batch-flow.backend.spec.ts`
- Modify: `e2e/support/mock-backend.ts`

**Interfaces:**
- Consumes: backend request/response contract from Task 1.
- Produces: frontend form values, create/update body and detail model with no `examinationSiteName`; clinic address remains hidden/empty; organization-site address remains visible/required.

- [ ] **Step 1: Remove the name from frontend schemas, types and mappers.** Delete the form value, transport field, response type property, and create/update mapping for `examinationSiteName`.
- [ ] **Step 2: Remove the name input and display.** Keep the site-type selector; keep the address input conditional on `ORGANIZATION_SITE`; show only site type/address in batch detail; use site type/address in the summary strip.
- [ ] **Step 3: Adapt existing frontend fixtures and assertions.** Remove the deleted property from API mocks, request expectations and batch-flow E2E locators; preserve the earlier code-field and conditional-address changes. Do not add test cases or execute test suites in this work.
- [ ] **Step 4: Run frontend static checks without running tests.** Run ESLint on changed frontend files, `tsc --noEmit`, and `git diff --check`. Report unrelated existing typecheck errors separately.

### Task 3: Update contract and migration documentation

**Files:**
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/organizations-and-batches.md`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/docs/architecture/04-persistence.md`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/docs/architecture/06-testing-and-operations.md`
- Modify: `../Ngoc_Khanh_Clinic_DX_Springboot/PROJECT_RULES.md` migration baseline text
- Modify: this design spec status only if the final implementation changes the approved migration approach

**Interfaces:**
- Consumes: final backend API shape and V008 migration from Task 1.
- Produces: documentation that describes the latest schema, request fields and historical migration limitation without changing accepted ADR history.

- [ ] **Step 1: Update the API contract documentation.** Document site type and conditional address only; remove site-name from request/response examples and required-field tables.
- [ ] **Step 2: Update persistence and deployment documentation.** Describe V008 as the forward drop for the current baseline, explain that stored name values are removed, and retain the separate conversion requirement for older V004–V007 migration histories.
- [ ] **Step 3: Review the scoped diff and final status.** Confirm no runtime/docs references to `examinationSiteName` or `examination_site_name` remain outside historical migration text, confirm only intended files changed, and report compile/static-check outcomes. Do not execute V008 against a live database.
