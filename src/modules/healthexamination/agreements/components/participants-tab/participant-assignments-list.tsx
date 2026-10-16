"use client"

import { StatusPill } from "@/shared/ui"
import type { ParticipantAssignment } from "../../types"
import { formatHealthExaminationDate } from "../../utils/format-health-examination-date"
import {
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_TONES,
  SESSION_ACTIVITY_LABELS,
  formatSessionSite,
} from "../../utils/session-labels"

/** The schedule of one Participant, newest session first. Read only: it changes in the sessions. */
export function ParticipantAssignmentsList({
  assignments,
}: {
  assignments: ParticipantAssignment[]
}) {
  return (
    <section aria-labelledby="participant-assignments-heading" className="mb-4 space-y-2">
      <h3 id="participant-assignments-heading" className="text-sm font-semibold text-foreground">
        Lịch khám của người này
      </h3>
      {assignments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
          Chưa được xếp lịch khám nào.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border text-xs">
          {assignments.map((assignment) => (
            <li
              key={assignment.assignmentId}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
            >
              <span className="text-foreground">
                <span className="font-medium tabular-nums">
                  {formatHealthExaminationDate(assignment.sessionDate)}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  · {SESSION_ACTIVITY_LABELS[assignment.activity]} · {formatSessionSite(assignment)}
                </span>
              </span>
              <StatusPill tone={ASSIGNMENT_STATUS_TONES[assignment.status]}>
                {ASSIGNMENT_STATUS_LABELS[assignment.status]}
              </StatusPill>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
