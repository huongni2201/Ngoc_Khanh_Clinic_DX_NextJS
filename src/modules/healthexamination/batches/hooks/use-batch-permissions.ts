"use client"

import * as React from "react"
import { PERMISSION, usePermissions } from "@/modules/accesscontrol"

/**
 * What the account may see or use on the batch screens (the list of an Organization and the batch
 * detail), one flag per feature. Display only:
 * the backend checks every request. A flag that needs several endpoints holds only when the account
 * may call all of them, so a shown action never fails half-way on a missing permission.
 */
export function useBatchPermissions() {
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
      batch: {
        canCreate: can(PERMISSION.HEALTH_EXAMINATION_BATCH_CREATE),
        canEdit: can(PERMISSION.HEALTH_EXAMINATION_BATCH_UPDATE),
        canDelete: can(PERMISSION.HEALTH_EXAMINATION_BATCH_DELETE),
        canStart: can(PERMISSION.HEALTH_EXAMINATION_BATCH_START),
      },
      examination: {
        canRead: !isKnown || can(PERMISSION.HEALTH_EXAMINATION_SERVICE_READ),
        canReconcile: can(PERMISSION.HEALTH_EXAMINATION_SERVICE_RECONCILE),
        canDownloadTemplate: can(PERMISSION.HEALTH_EXAMINATION_SERVICE_TEMPLATE_DOWNLOAD),
        canRecord: can(PERMISSION.HEALTH_EXAMINATION_SERVICE_RECORD),
      },
      report: {
        canRead: !isKnown || can(PERMISSION.HEALTH_EXAMINATION_REPORT_READ),
      },
    }),
    [isKnown, can, canAll]
  )
}
