import type {
  ExaminationDetailListFilterParams,
  ExaminationSessionFilterParams,
  PaymentSummaryReportRange,
  SessionAssignmentFilterParams,
  ExaminationProgressFilterParams,
  HealthExaminationAgreementFilterParams,
  ParticipantListFilterParams,
} from "./types"
import { normalizeAgreementFilterParams } from "./utils/agreement-list-params"

export const healthExaminationKeys = {
  all: ["health-examinations"] as const,
  agreements: (organizationId: string) =>
    [...healthExaminationKeys.all, "agreements", organizationId] as const,
  agreementList: (organizationId: string, params?: HealthExaminationAgreementFilterParams) =>
    [
      ...healthExaminationKeys.agreements(organizationId),
      "list",
      normalizeAgreementFilterParams(params),
    ] as const,
  agreement: (organizationId: string, agreementId: string) =>
    [...healthExaminationKeys.agreements(organizationId), "detail", agreementId] as const,
  agreementReport: (agreementId: string) =>
    [...healthExaminationKeys.all, "agreement-report", agreementId] as const,
  agreementMatrix: (agreementId: string, params?: ExaminationProgressFilterParams) =>
    [...healthExaminationKeys.all, "agreement-matrix", agreementId, params] as const,
  participantsRoot: (organizationId: string, agreementId: string) =>
    [...healthExaminationKeys.agreement(organizationId, agreementId), "participants"] as const,
  participantDetail: (organizationId: string, agreementId: string, participantId: string) =>
    [
      ...healthExaminationKeys.participantsRoot(organizationId, agreementId),
      "detail",
      participantId,
    ] as const,
  /** The PDF of one Participant's blank form; never kept after the preview closes. */
  examinationForm: (organizationId: string, agreementId: string, participantId: string) =>
    [
      ...healthExaminationKeys.participantsRoot(organizationId, agreementId),
      "examination-form",
      participantId,
    ] as const,
  participants: (
    organizationId: string,
    agreementId: string,
    params: ParticipantListFilterParams
  ) =>
    [...healthExaminationKeys.participantsRoot(organizationId, agreementId), params] as const,
  examinationDetailsRoot: (organizationId: string, agreementId: string) =>
    [...healthExaminationKeys.agreement(organizationId, agreementId), "examination-details"] as const,
  examinationDetails: (
    organizationId: string,
    agreementId: string,
    params: ExaminationDetailListFilterParams
  ) =>
    [
      ...healthExaminationKeys.examinationDetailsRoot(organizationId, agreementId),
      "list",
      params,
    ] as const,
  examinationSummary: (organizationId: string, agreementId: string) =>
    [...healthExaminationKeys.examinationDetailsRoot(organizationId, agreementId), "summary"] as const,
  paymentReport: (organizationId: string, agreementId: string, range?: PaymentSummaryReportRange) =>
    [
      ...healthExaminationKeys.agreement(organizationId, agreementId),
      "payment-report",
      range?.from ?? "",
      range?.to ?? "",
    ] as const,
  /** Every session query of one Organization; changing a session or an assignment drops them all. */
  sessionsRoot: (organizationId: string) =>
    [...healthExaminationKeys.all, "sessions", organizationId] as const,
  sessions: (organizationId: string, params: ExaminationSessionFilterParams) =>
    [...healthExaminationKeys.sessionsRoot(organizationId), "list", params] as const,
  session: (organizationId: string, sessionId: string) =>
    [...healthExaminationKeys.sessionsRoot(organizationId), "detail", sessionId] as const,
  sessionAssignments: (
    organizationId: string,
    sessionId: string,
    params: SessionAssignmentFilterParams
  ) =>
    [...healthExaminationKeys.session(organizationId, sessionId), "assignments", params] as const,
}
