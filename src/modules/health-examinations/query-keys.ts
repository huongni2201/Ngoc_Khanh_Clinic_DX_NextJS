export const healthExaminationKeys = {
  all: ["health-examinations"] as const,
  batches: (organizationId: string) =>
    [...healthExaminationKeys.all, "batches", organizationId] as const,
  batch: (organizationId: string, batchId: string) =>
    [...healthExaminationKeys.batches(organizationId), batchId] as const,
  participantsRoot: (organizationId: string, batchId: string) =>
    [...healthExaminationKeys.batch(organizationId, batchId), "participants"] as const,
  participants: (organizationId: string, batchId: string, params: unknown) =>
    [...healthExaminationKeys.participantsRoot(organizationId, batchId), params] as const,
}
