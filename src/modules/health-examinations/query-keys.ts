import type {
  ExaminationDetailListFilterParams,
  ExaminationProgressFilterParams,
  HealthExaminationBatchFilterParams,
  ParticipantListFilterParams,
} from "./types"
import { normalizeBatchFilterParams } from "./utils/batch-list-params"

export const healthExaminationKeys = {
  all: ["health-examinations"] as const,
  clinicalServices: () => [...healthExaminationKeys.all, "clinical-services"] as const,
  batches: (organizationId: string) =>
    [...healthExaminationKeys.all, "batches", organizationId] as const,
  batchList: (organizationId: string, params?: HealthExaminationBatchFilterParams) =>
    [
      ...healthExaminationKeys.batches(organizationId),
      "list",
      normalizeBatchFilterParams(params),
    ] as const,
  batch: (organizationId: string, batchId: string) =>
    [...healthExaminationKeys.batches(organizationId), "detail", batchId] as const,
  batchReport: (batchId: string) =>
    [...healthExaminationKeys.all, "batch-report", batchId] as const,
  batchMatrix: (batchId: string, params?: ExaminationProgressFilterParams) =>
    [...healthExaminationKeys.all, "batch-matrix", batchId, params] as const,
  participantsRoot: (organizationId: string, batchId: string) =>
    [...healthExaminationKeys.batch(organizationId, batchId), "participants"] as const,
  participantDetail: (organizationId: string, batchId: string, participantId: string) =>
    [
      ...healthExaminationKeys.participantsRoot(organizationId, batchId),
      "detail",
      participantId,
    ] as const,
  participants: (
    organizationId: string,
    batchId: string,
    params: ParticipantListFilterParams
  ) =>
    [...healthExaminationKeys.participantsRoot(organizationId, batchId), params] as const,
  examinationDetailsRoot: (organizationId: string, batchId: string) =>
    [...healthExaminationKeys.batch(organizationId, batchId), "examination-details"] as const,
  examinationDetails: (
    organizationId: string,
    batchId: string,
    params: ExaminationDetailListFilterParams
  ) =>
    [
      ...healthExaminationKeys.examinationDetailsRoot(organizationId, batchId),
      "list",
      params,
    ] as const,
  examinationSummary: (organizationId: string, batchId: string) =>
    [...healthExaminationKeys.examinationDetailsRoot(organizationId, batchId), "summary"] as const,
  paymentReport: (organizationId: string, batchId: string) =>
    [...healthExaminationKeys.batch(organizationId, batchId), "payment-report"] as const,
}
