/**
 * Permission codes the frontend may check to decide which features to show or enable. They are the
 * codes the backend ties to an HTTP endpoint (`public.permissions`, migration V002 and later); the
 * backend decides every request, so this list only names what the UI can ask about. It is not a
 * role matrix: roles and their grants live in the backend and arrive in the session.
 *
 * A code is added here when a screen needs it. `permission-codes.test.ts` fails when a code is not
 * a permission of the backend migrations, so a typo or a renamed code is caught before release.
 */
export const PERMISSION = {
  ORGANIZATION_SEARCH: "ORGANIZATION_SEARCH", // GET /organizations
  ORGANIZATION_VIEW: "ORGANIZATION_VIEW", // GET /organizations/{organizationId}
  ORGANIZATION_CREATE: "ORGANIZATION_CREATE", // POST /organizations
  ORGANIZATION_UPDATE: "ORGANIZATION_UPDATE", // PUT /organizations/{organizationId}
  HEALTH_EXAMINATION_BATCH_VIEW: "HEALTH_EXAMINATION_BATCH_VIEW", // GET /organizations/{organizationId}/health-examination-batches
  HEALTH_EXAMINATION_BATCH_CREATE: "HEALTH_EXAMINATION_BATCH_CREATE", // POST /organizations/{organizationId}/health-examination-batches
  HEALTH_EXAMINATION_BATCH_UPDATE: "HEALTH_EXAMINATION_BATCH_UPDATE", // PUT /organizations/{organizationId}/health-examination-batches/{batchId}
  HEALTH_EXAMINATION_BATCH_START: "HEALTH_EXAMINATION_BATCH_START", // POST /organizations/{organizationId}/health-examination-batches/{batchId}/start
  PARTICIPANT_VIEW: "PARTICIPANT_VIEW", // GET /organizations/{organizationId}/health-examination-batches/{batchId}/participants
  PARTICIPANT_TEMPLATE_DOWNLOAD: "PARTICIPANT_TEMPLATE_DOWNLOAD", // GET /organizations/{organizationId}/health-examination-batches/{batchId}/participants/import-template
  PARTICIPANT_IMPORT: "PARTICIPANT_IMPORT", // POST /organizations/{organizationId}/health-examination-batches/{batchId}/participants/imports
  PARTICIPANT_UPDATE: "PARTICIPANT_UPDATE", // PUT /organizations/{organizationId}/health-examination-batches/{batchId}/participants/{participantId}
  PARTICIPANT_REMOVE: "PARTICIPANT_REMOVE", // DELETE /organizations/{organizationId}/health-examination-batches/{batchId}/participants/{participantId}
  PARTICIPANT_EXAMINATION_FORM_PRINT: "PARTICIPANT_EXAMINATION_FORM_PRINT", // GET /organizations/{organizationId}/health-examination-batches/{batchId}/participants/{participantId}/examination-form
  PARTICIPANT_EXAMINATION_FORM_BULK_PRINT: "PARTICIPANT_EXAMINATION_FORM_BULK_PRINT", // POST /organizations/{organizationId}/health-examination-batches/{batchId}/participants/examination-form-print-jobs
  DOCUMENT_RENDER_JOB_READ: "DOCUMENT_RENDER_JOB_READ", // GET /document-render-jobs/{jobId}
  DOCUMENT_RENDER_JOB_DOWNLOAD: "DOCUMENT_RENDER_JOB_DOWNLOAD", // GET /document-render-jobs/{jobId}/parts/{partNo}
  PARTICIPANT_CREATE: "PARTICIPANT_CREATE", // POST /organizations/{organizationId}/health-examination-batches/{batchId}/participants
  PARTICIPANT_REACTIVATE: "PARTICIPANT_REACTIVATE", // POST /organizations/{organizationId}/health-examination-batches/{batchId}/participants/{participantId}/reactivate
  HEALTH_EXAMINATION_SERVICE_READ: "HEALTH_EXAMINATION_SERVICE_READ", // GET /organizations/{organizationId}/health-examination-batches/{batchId}/examination-details
  HEALTH_EXAMINATION_SERVICE_RECONCILE: "HEALTH_EXAMINATION_SERVICE_RECONCILE", // POST /organizations/{organizationId}/health-examination-batches/{batchId}/examination-details/imports
  HEALTH_EXAMINATION_SERVICE_TEMPLATE_DOWNLOAD: "HEALTH_EXAMINATION_SERVICE_TEMPLATE_DOWNLOAD", // GET /organizations/{organizationId}/health-examination-batches/{batchId}/examination-details/import-template
  HEALTH_EXAMINATION_SERVICE_RECORD: "HEALTH_EXAMINATION_SERVICE_RECORD", // PUT /organizations/{organizationId}/health-examination-batches/{batchId}/examination-details/{participantId}
  HEALTH_EXAMINATION_REPORT_READ: "HEALTH_EXAMINATION_REPORT_READ", // GET /organizations/{organizationId}/health-examination-batches/{batchId}/reports/payment-summary
  ORGANIZATION_DELETE: "ORGANIZATION_DELETE", // DELETE /organizations/{organizationId}
  HEALTH_EXAMINATION_BATCH_DETAIL_VIEW: "HEALTH_EXAMINATION_BATCH_DETAIL_VIEW", // GET /organizations/{organizationId}/health-examination-batches/{batchId}
  HEALTH_EXAMINATION_BATCH_DELETE: "HEALTH_EXAMINATION_BATCH_DELETE", // DELETE /organizations/{organizationId}/health-examination-batches/{batchId}
  PARTICIPANT_DETAIL_VIEW: "PARTICIPANT_DETAIL_VIEW", // GET /organizations/{organizationId}/health-examination-batches/{batchId}/participants/{participantId}
  HEALTH_EXAMINATION_SERVICE_SUMMARY_READ: "HEALTH_EXAMINATION_SERVICE_SUMMARY_READ", // GET /organizations/{organizationId}/health-examination-batches/{batchId}/examination-details/summary
  HEALTH_EXAMINATION_SERVICE_EXPORT: "HEALTH_EXAMINATION_SERVICE_EXPORT", // GET /organizations/{organizationId}/health-examination-batches/{batchId}/examination-details/export
  HEALTH_EXAMINATION_REPORT_EXPORT: "HEALTH_EXAMINATION_REPORT_EXPORT", // GET /organizations/{organizationId}/health-examination-batches/{batchId}/reports/payment-summary/docx
  SERVICE_CATALOG_VIEW: "SERVICE_CATALOG_VIEW", // GET /catalog/services
} as const

export type PermissionCode = (typeof PERMISSION)[keyof typeof PERMISSION]
