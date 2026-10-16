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
  HEALTH_EXAMINATION_AGREEMENT_VIEW: "HEALTH_EXAMINATION_AGREEMENT_VIEW", // GET /organizations/{organizationId}/agreements
  HEALTH_EXAMINATION_AGREEMENT_CREATE: "HEALTH_EXAMINATION_AGREEMENT_CREATE", // POST /organizations/{organizationId}/agreements
  HEALTH_EXAMINATION_AGREEMENT_UPDATE: "HEALTH_EXAMINATION_AGREEMENT_UPDATE", // PUT /organizations/{organizationId}/agreements/{agreementId}
  HEALTH_EXAMINATION_AGREEMENT_ACTIVATE: "HEALTH_EXAMINATION_AGREEMENT_ACTIVATE", // POST /organizations/{organizationId}/agreements/{agreementId}/activate
  PARTICIPANT_VIEW: "PARTICIPANT_VIEW", // GET /organizations/{organizationId}/agreements/{agreementId}/participants
  PARTICIPANT_TEMPLATE_DOWNLOAD: "PARTICIPANT_TEMPLATE_DOWNLOAD", // GET /organizations/{organizationId}/agreements/{agreementId}/participants/import-template
  PARTICIPANT_IMPORT: "PARTICIPANT_IMPORT", // POST /organizations/{organizationId}/agreements/{agreementId}/participants/imports
  PARTICIPANT_UPDATE: "PARTICIPANT_UPDATE", // PUT /organizations/{organizationId}/agreements/{agreementId}/participants/{participantId}
  PARTICIPANT_REMOVE: "PARTICIPANT_REMOVE", // DELETE /organizations/{organizationId}/agreements/{agreementId}/participants/{participantId}
  PARTICIPANT_EXAMINATION_FORM_PRINT: "PARTICIPANT_EXAMINATION_FORM_PRINT", // GET /organizations/{organizationId}/agreements/{agreementId}/participants/{participantId}/examination-form
  PARTICIPANT_EXAMINATION_FORM_BULK_PRINT: "PARTICIPANT_EXAMINATION_FORM_BULK_PRINT", // POST /organizations/{organizationId}/agreements/{agreementId}/participants/examination-form-print-jobs
  DOCUMENT_RENDER_JOB_READ: "DOCUMENT_RENDER_JOB_READ", // GET /document-render-jobs/{jobId}
  DOCUMENT_RENDER_JOB_DOWNLOAD: "DOCUMENT_RENDER_JOB_DOWNLOAD", // GET /document-render-jobs/{jobId}/parts/{partNo}
  PARTICIPANT_CREATE: "PARTICIPANT_CREATE", // POST /organizations/{organizationId}/agreements/{agreementId}/participants
  PARTICIPANT_REACTIVATE: "PARTICIPANT_REACTIVATE", // POST /organizations/{organizationId}/agreements/{agreementId}/participants/{participantId}/reactivate
  HEALTH_EXAMINATION_SERVICE_READ: "HEALTH_EXAMINATION_SERVICE_READ", // GET /organizations/{organizationId}/agreements/{agreementId}/examination-details
  HEALTH_EXAMINATION_SERVICE_RECONCILE: "HEALTH_EXAMINATION_SERVICE_RECONCILE", // POST /organizations/{organizationId}/agreements/{agreementId}/examination-details/imports
  HEALTH_EXAMINATION_SERVICE_TEMPLATE_DOWNLOAD: "HEALTH_EXAMINATION_SERVICE_TEMPLATE_DOWNLOAD", // GET /organizations/{organizationId}/agreements/{agreementId}/examination-details/import-template
  HEALTH_EXAMINATION_SERVICE_RECORD: "HEALTH_EXAMINATION_SERVICE_RECORD", // PUT /organizations/{organizationId}/agreements/{agreementId}/examination-details/{participantId}
  HEALTH_EXAMINATION_REPORT_READ: "HEALTH_EXAMINATION_REPORT_READ", // GET /organizations/{organizationId}/agreements/{agreementId}/reports/payment-summary
  HEALTH_EXAMINATION_AGREEMENT_END: "HEALTH_EXAMINATION_AGREEMENT_END", // POST /organizations/{organizationId}/agreements/{agreementId}/end
  HEALTH_EXAMINATION_SESSION_VIEW: "HEALTH_EXAMINATION_SESSION_VIEW", // GET /organizations/{organizationId}/sessions
  HEALTH_EXAMINATION_SESSION_DETAIL_VIEW: "HEALTH_EXAMINATION_SESSION_DETAIL_VIEW", // GET /organizations/{organizationId}/sessions/{sessionId}
  HEALTH_EXAMINATION_SESSION_CREATE: "HEALTH_EXAMINATION_SESSION_CREATE", // POST /organizations/{organizationId}/sessions
  HEALTH_EXAMINATION_SESSION_UPDATE: "HEALTH_EXAMINATION_SESSION_UPDATE", // PUT /organizations/{organizationId}/sessions/{sessionId}
  HEALTH_EXAMINATION_SESSION_CANCEL: "HEALTH_EXAMINATION_SESSION_CANCEL", // POST /organizations/{organizationId}/sessions/{sessionId}/cancel
  HEALTH_EXAMINATION_ASSIGNMENT_VIEW: "HEALTH_EXAMINATION_ASSIGNMENT_VIEW", // GET /organizations/{organizationId}/sessions/{sessionId}/assignments
  HEALTH_EXAMINATION_ASSIGNMENT_CREATE: "HEALTH_EXAMINATION_ASSIGNMENT_CREATE", // POST /organizations/{organizationId}/sessions/{sessionId}/assignments
  HEALTH_EXAMINATION_ASSIGNMENT_MOVE_ALL: "HEALTH_EXAMINATION_ASSIGNMENT_MOVE_ALL", // POST /organizations/{organizationId}/sessions/{sessionId}/assignments/move
  HEALTH_EXAMINATION_ASSIGNMENT_MOVE: "HEALTH_EXAMINATION_ASSIGNMENT_MOVE", // POST /organizations/{organizationId}/sessions/{sessionId}/assignments/{assignmentId}/move
  HEALTH_EXAMINATION_ASSIGNMENT_CANCEL: "HEALTH_EXAMINATION_ASSIGNMENT_CANCEL", // POST /organizations/{organizationId}/sessions/{sessionId}/assignments/{assignmentId}/cancel
  HEALTH_EXAMINATION_ASSIGNMENT_ATTENDANCE_RECORD: "HEALTH_EXAMINATION_ASSIGNMENT_ATTENDANCE_RECORD", // POST /organizations/{organizationId}/sessions/{sessionId}/assignments/{assignmentId}/attendance
  ORGANIZATION_DELETE: "ORGANIZATION_DELETE", // DELETE /organizations/{organizationId}
  HEALTH_EXAMINATION_AGREEMENT_DETAIL_VIEW: "HEALTH_EXAMINATION_AGREEMENT_DETAIL_VIEW", // GET /organizations/{organizationId}/agreements/{agreementId}
  HEALTH_EXAMINATION_AGREEMENT_DELETE: "HEALTH_EXAMINATION_AGREEMENT_DELETE", // DELETE /organizations/{organizationId}/agreements/{agreementId}
  PARTICIPANT_DETAIL_VIEW: "PARTICIPANT_DETAIL_VIEW", // GET /organizations/{organizationId}/agreements/{agreementId}/participants/{participantId}
  HEALTH_EXAMINATION_SERVICE_SUMMARY_READ: "HEALTH_EXAMINATION_SERVICE_SUMMARY_READ", // GET /organizations/{organizationId}/agreements/{agreementId}/examination-details/summary
  HEALTH_EXAMINATION_SERVICE_EXPORT: "HEALTH_EXAMINATION_SERVICE_EXPORT", // GET /organizations/{organizationId}/agreements/{agreementId}/examination-details/export
  HEALTH_EXAMINATION_REPORT_EXPORT: "HEALTH_EXAMINATION_REPORT_EXPORT", // GET /organizations/{organizationId}/agreements/{agreementId}/reports/payment-summary/docx
  SERVICE_CATALOG_VIEW: "SERVICE_CATALOG_VIEW", // GET /catalog/services
  STAFF_MEMBER_VIEW: "STAFF_MEMBER_VIEW", // GET /staff-members (V004)
  USER_ACCOUNT_CREATE: "USER_ACCOUNT_CREATE", // POST /staff-members (V004)
  ROLE_VIEW: "ROLE_VIEW", // GET /roles (V004)
  // No endpoint of its own: POST /staff-members also requires it because it grants the role.
  USER_ROLE_ASSIGN: "USER_ROLE_ASSIGN",
  ROLE_MANAGE: "ROLE_MANAGE", // GET /admin/roles (V005)
  ROLE_CREATE: "ROLE_CREATE", // POST /admin/roles (V005)
  ROLE_UPDATE: "ROLE_UPDATE", // PUT /admin/roles/{roleId} (V005)
  PERMISSION_VIEW: "PERMISSION_VIEW", // GET /admin/permissions (V005)
  ROLE_PERMISSION_VIEW: "ROLE_PERMISSION_VIEW", // GET /admin/roles/{roleId}/permissions (V005)
  ROLE_PERMISSION_ASSIGN: "ROLE_PERMISSION_ASSIGN", // PUT /admin/roles/{roleId}/permissions (V005)
  CATALOG_DEPARTMENT_VIEW: "CATALOG_DEPARTMENT_VIEW",
  CATALOG_DEPARTMENT_DETAIL_VIEW: "CATALOG_DEPARTMENT_DETAIL_VIEW",
  CATALOG_DEPARTMENT_CREATE: "CATALOG_DEPARTMENT_CREATE",
  CATALOG_DEPARTMENT_UPDATE: "CATALOG_DEPARTMENT_UPDATE",
  CATALOG_DEPARTMENT_DEACTIVATE: "CATALOG_DEPARTMENT_DEACTIVATE",
  CATALOG_DEPARTMENT_REACTIVATE: "CATALOG_DEPARTMENT_REACTIVATE",
  CATALOG_ROOM_VIEW: "CATALOG_ROOM_VIEW",
  CATALOG_ROOM_DETAIL_VIEW: "CATALOG_ROOM_DETAIL_VIEW",
  CATALOG_ROOM_CREATE: "CATALOG_ROOM_CREATE",
  CATALOG_ROOM_UPDATE: "CATALOG_ROOM_UPDATE",
  CATALOG_ROOM_DEACTIVATE: "CATALOG_ROOM_DEACTIVATE",
  CATALOG_ROOM_REACTIVATE: "CATALOG_ROOM_REACTIVATE",
  CATALOG_SPECIALTY_VIEW: "CATALOG_SPECIALTY_VIEW",
  CATALOG_SPECIALTY_DETAIL_VIEW: "CATALOG_SPECIALTY_DETAIL_VIEW",
  CATALOG_SPECIALTY_CREATE: "CATALOG_SPECIALTY_CREATE",
  CATALOG_SPECIALTY_UPDATE: "CATALOG_SPECIALTY_UPDATE",
  CATALOG_SPECIALTY_DEACTIVATE: "CATALOG_SPECIALTY_DEACTIVATE",
  CATALOG_SPECIALTY_REACTIVATE: "CATALOG_SPECIALTY_REACTIVATE",
  CATALOG_SERVICE_VIEW: "CATALOG_SERVICE_VIEW",
  CATALOG_SERVICE_DETAIL_VIEW: "CATALOG_SERVICE_DETAIL_VIEW",
  CATALOG_SERVICE_CREATE: "CATALOG_SERVICE_CREATE",
  CATALOG_SERVICE_UPDATE: "CATALOG_SERVICE_UPDATE",
  CATALOG_SERVICE_DEACTIVATE: "CATALOG_SERVICE_DEACTIVATE",
  CATALOG_SERVICE_REACTIVATE: "CATALOG_SERVICE_REACTIVATE",
  CATALOG_MEDICINE_VIEW: "CATALOG_MEDICINE_VIEW",
  CATALOG_MEDICINE_DETAIL_VIEW: "CATALOG_MEDICINE_DETAIL_VIEW",
  CATALOG_MEDICINE_CREATE: "CATALOG_MEDICINE_CREATE",
  CATALOG_MEDICINE_UPDATE: "CATALOG_MEDICINE_UPDATE",
  CATALOG_MEDICINE_DEACTIVATE: "CATALOG_MEDICINE_DEACTIVATE",
  CATALOG_MEDICINE_REACTIVATE: "CATALOG_MEDICINE_REACTIVATE",
} as const

export type PermissionCode = (typeof PERMISSION)[keyof typeof PERMISSION]

/**
 * Everything the Role Permissions screen reads: the grants of a role, the permission catalogue and
 * the role list of its selector. A link to the screen is shown only with all three.
 */
export const ROLE_PERMISSIONS_SCREEN_PERMISSIONS: readonly PermissionCode[] = [
  PERMISSION.ROLE_PERMISSION_VIEW,
  PERMISSION.PERMISSION_VIEW,
  PERMISSION.ROLE_MANAGE,
]
