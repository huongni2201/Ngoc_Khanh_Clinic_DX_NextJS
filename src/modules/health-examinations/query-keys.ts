import type {
  ExaminationProgressFilterParams,
  HealthExaminationBatchFilterParams,
  ParticipantListFilterParams,
} from "./types"

export const healthExaminationKeys = {
  all: ["health-examinations"] as const,
  batchList: (organizationId: string, params?: HealthExaminationBatchFilterParams) =>
    [...healthExaminationKeys.all, "batches", organizationId, "list", params] as const,
  batchLists: () => [...healthExaminationKeys.all, "batches"] as const,
  batchById: (batchId: string) =>
    [...healthExaminationKeys.all, "batches", "detail", batchId] as const,
  batchReport: (batchId: string) =>
    [...healthExaminationKeys.batchById(batchId), "report"] as const,
  batchMatrix: (batchId: string, params?: ExaminationProgressFilterParams) =>
    [...healthExaminationKeys.batchById(batchId), "matrix", params] as const,
  clinicalServices: () => [...healthExaminationKeys.all, "clinical-services"] as const,
  batches: (organizationId: string) =>
    [...healthExaminationKeys.all, "batches", organizationId] as const,
  batch: (organizationId: string, batchId: string) =>
    [...healthExaminationKeys.batches(organizationId), batchId] as const,
  participantsRoot: (organizationId: string, batchId: string) =>
    [...healthExaminationKeys.batch(organizationId, batchId), "participants"] as const,
  participants: (
    organizationId: string,
    batchId: string,
    params: ParticipantListFilterParams
  ) =>
    [...healthExaminationKeys.participantsRoot(organizationId, batchId), params] as const,
  participantImport: (organizationId: string, batchId: string, importId: string) =>
    [...healthExaminationKeys.participantsRoot(organizationId, batchId), "import", importId] as const,
  participantImportRows: (
    organizationId: string,
    batchId: string,
    importId: string,
    params: { page: number; size: number; status?: string }
  ) =>
    [...healthExaminationKeys.participantImportRowsRoot(organizationId, batchId, importId), params] as const,
  participantImportRowsRoot: (organizationId: string, batchId: string, importId: string) =>
    [...healthExaminationKeys.participantImport(organizationId, batchId, importId), "rows"] as const,
}
