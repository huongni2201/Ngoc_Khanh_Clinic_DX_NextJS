"use client"

import * as React from "react"
import { PERMISSION, usePermissions } from "@/modules/accesscontrol"

/**
 * What the account may see or use on the agreement screens (the list of an Organization, the
 * agreement detail and the sessions), one flag per feature. Display only: the backend checks every
 * request. A flag that needs several endpoints holds only when the account may call all of them, so a
 * shown action never fails half-way on a missing permission.
 */
export function useAgreementPermissions() {
  const { isKnown, can, canAll } = usePermissions()

  return React.useMemo(
    () => ({
      participants: {
        // An unknown session still tries to read; a known one without the permission loses the tab.
        canRead: !isKnown || can(PERMISSION.PARTICIPANT_VIEW),
        canDownloadTemplate: can(PERMISSION.PARTICIPANT_TEMPLATE_DOWNLOAD),
        canImport: can(PERMISSION.PARTICIPANT_IMPORT),
        canCreate: can(PERMISSION.PARTICIPANT_CREATE),
        // Editing loads the Participant detail first, so it needs both.
        canEdit: canAll(PERMISSION.PARTICIPANT_DETAIL_VIEW, PERMISSION.PARTICIPANT_UPDATE),
        // The backend DELETE cancels the Participant; the row stays, with status CANCELLED.
        canRemove: can(PERMISSION.PARTICIPANT_REMOVE),
        canReactivate: can(PERMISSION.PARTICIPANT_REACTIVATE),
        canPrintForm: can(PERMISSION.PARTICIPANT_EXAMINATION_FORM_PRINT),
        // A bulk job is only useful when the account can also follow it and download its files.
        canBulkPrintForms: canAll(
          PERMISSION.PARTICIPANT_EXAMINATION_FORM_BULK_PRINT,
          PERMISSION.DOCUMENT_RENDER_JOB_READ,
          PERMISSION.DOCUMENT_RENDER_JOB_DOWNLOAD
        ),
      },
      agreement: {
        canCreate: can(PERMISSION.HEALTH_EXAMINATION_AGREEMENT_CREATE),
        canEdit: can(PERMISSION.HEALTH_EXAMINATION_AGREEMENT_UPDATE),
        canDelete: can(PERMISSION.HEALTH_EXAMINATION_AGREEMENT_DELETE),
        canActivate: can(PERMISSION.HEALTH_EXAMINATION_AGREEMENT_ACTIVATE),
        canEnd: can(PERMISSION.HEALTH_EXAMINATION_AGREEMENT_END),
      },
      sessions: {
        // An unknown session still tries to read; a known one without the permission loses the tab.
        canRead: !isKnown || can(PERMISSION.HEALTH_EXAMINATION_SESSION_VIEW),
        canCreate: can(PERMISSION.HEALTH_EXAMINATION_SESSION_CREATE),
        // Editing and cancelling work from the detail sheet, so they need to read it first.
        canEdit: canAll(
          PERMISSION.HEALTH_EXAMINATION_SESSION_DETAIL_VIEW,
          PERMISSION.HEALTH_EXAMINATION_SESSION_UPDATE
        ),
        canCancel: can(PERMISSION.HEALTH_EXAMINATION_SESSION_CANCEL),
        canViewDetail: can(PERMISSION.HEALTH_EXAMINATION_SESSION_DETAIL_VIEW),
      },
      assignments: {
        canRead: can(PERMISSION.HEALTH_EXAMINATION_ASSIGNMENT_VIEW),
        // Picking the session to put people in needs the list of sessions.
        canAssign: canAll(
          PERMISSION.HEALTH_EXAMINATION_ASSIGNMENT_CREATE,
          PERMISSION.HEALTH_EXAMINATION_SESSION_VIEW
        ),
        canMove: canAll(
          PERMISSION.HEALTH_EXAMINATION_ASSIGNMENT_MOVE,
          PERMISSION.HEALTH_EXAMINATION_SESSION_VIEW
        ),
        canMoveAll: canAll(
          PERMISSION.HEALTH_EXAMINATION_ASSIGNMENT_MOVE_ALL,
          PERMISSION.HEALTH_EXAMINATION_SESSION_VIEW
        ),
        canCancel: can(PERMISSION.HEALTH_EXAMINATION_ASSIGNMENT_CANCEL),
        canRecordAttendance: can(PERMISSION.HEALTH_EXAMINATION_ASSIGNMENT_ATTENDANCE_RECORD),
      },
      examination: {
        canRead: !isKnown || can(PERMISSION.HEALTH_EXAMINATION_SERVICE_READ),
        canReconcile: can(PERMISSION.HEALTH_EXAMINATION_SERVICE_RECONCILE),
        canDownloadTemplate: can(PERMISSION.HEALTH_EXAMINATION_SERVICE_TEMPLATE_DOWNLOAD),
        canRecord: can(PERMISSION.HEALTH_EXAMINATION_SERVICE_RECORD),
      },
      report: {
        canRead: !isKnown || can(PERMISSION.HEALTH_EXAMINATION_REPORT_READ),
        canExport: can(PERMISSION.HEALTH_EXAMINATION_REPORT_EXPORT),
      },
    }),
    [isKnown, can, canAll]
  )
}
