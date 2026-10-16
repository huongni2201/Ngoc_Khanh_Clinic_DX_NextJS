"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  assignParticipantsToSession,
  cancelExaminationSession,
  cancelSessionAssignment,
  createExaminationSession,
  fetchExaminationSession,
  fetchExaminationSessions,
  fetchSessionAssignments,
  moveSessionAssignment,
  moveSessionAssignments,
  recordSessionAttendance,
  updateExaminationSession,
} from "../api/sessions"
import { healthExaminationKeys } from "../query-keys"
import type {
  AssignParticipantsRequest,
  AssignParticipantsResult,
  CancelExaminationSessionRequest,
  CancelSessionAssignmentRequest,
  CreateExaminationSessionRequest,
  ExaminationSession,
  ExaminationSessionFilterParams,
  ExaminationSessionListResponse,
  MoveSessionAssignmentRequest,
  MoveSessionAssignmentsRequest,
  MoveSessionAssignmentsResult,
  RecordSessionAttendanceRequest,
  SessionAssignment,
  SessionAssignmentFilterParams,
  SessionAssignmentListResponse,
  UpdateExaminationSessionRequest,
} from "../types"

export function useExaminationSessions(
  organizationId: string,
  params: ExaminationSessionFilterParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery<ExaminationSessionListResponse>({
    queryKey: healthExaminationKeys.sessions(organizationId, params),
    queryFn: ({ signal }) => fetchExaminationSessions(organizationId, params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId) && (options?.enabled ?? true),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

export function useExaminationSession(
  organizationId: string,
  sessionId: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery<ExaminationSession>({
    queryKey: healthExaminationKeys.session(organizationId, sessionId ?? ""),
    queryFn: ({ signal }) => fetchExaminationSession(organizationId, sessionId ?? "", signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && sessionId) && (options?.enabled ?? true),
    staleTime: 0,
  })
}

export function useSessionAssignments(
  organizationId: string,
  sessionId: string | undefined,
  params: SessionAssignmentFilterParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery<SessionAssignmentListResponse>({
    queryKey: healthExaminationKeys.sessionAssignments(organizationId, sessionId ?? "", params),
    queryFn: ({ signal }) =>
      fetchSessionAssignments(organizationId, sessionId ?? "", params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled: Boolean(organizationId && sessionId) && (options?.enabled ?? true),
    staleTime: 0,
  })
}

/**
 * A session or assignment change touches the session lists and counts, and the Participants of the
 * agreements it serves (next session date, attendance, "unscheduled" filter). Everything under the
 * health examination keys of the organization is refreshed; none of the mutations retries.
 */
function useSchedulingMutation<TRequest extends { organizationId: string }, TResult>(
  mutationFn: (request: TRequest) => Promise<TResult>
) {
  const queryClient = useQueryClient()

  return useMutation<TResult, Error, TRequest>({
    mutationFn,
    retry: false,
    onSettled: (_result, _error, request) => {
      void queryClient.invalidateQueries({
        queryKey: healthExaminationKeys.sessionsRoot(request.organizationId),
      })
      void queryClient.invalidateQueries({
        queryKey: [...healthExaminationKeys.agreements(request.organizationId)],
      })
    },
  })
}

export function useCreateExaminationSession() {
  return useSchedulingMutation<CreateExaminationSessionRequest, ExaminationSession>(
    createExaminationSession
  )
}

export function useUpdateExaminationSession() {
  return useSchedulingMutation<UpdateExaminationSessionRequest, ExaminationSession>(
    updateExaminationSession
  )
}

export function useCancelExaminationSession() {
  return useSchedulingMutation<CancelExaminationSessionRequest, ExaminationSession>(
    cancelExaminationSession
  )
}

export function useAssignParticipantsToSession() {
  return useSchedulingMutation<AssignParticipantsRequest, AssignParticipantsResult>(
    assignParticipantsToSession
  )
}

export function useMoveSessionAssignment() {
  return useSchedulingMutation<MoveSessionAssignmentRequest, SessionAssignment>(
    moveSessionAssignment
  )
}

export function useMoveSessionAssignments() {
  return useSchedulingMutation<MoveSessionAssignmentsRequest, MoveSessionAssignmentsResult>(
    moveSessionAssignments
  )
}

export function useCancelSessionAssignment() {
  return useSchedulingMutation<CancelSessionAssignmentRequest, SessionAssignment>(
    cancelSessionAssignment
  )
}

export function useRecordSessionAttendance() {
  return useSchedulingMutation<RecordSessionAttendanceRequest, SessionAssignment>(
    recordSessionAttendance
  )
}
