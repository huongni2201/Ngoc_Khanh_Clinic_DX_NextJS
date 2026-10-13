export const documentKeys = {
  all: ["documents"] as const,
  renderJobs: () => [...documentKeys.all, "render-jobs"] as const,
  renderJob: (jobId: string) => [...documentKeys.renderJobs(), jobId] as const,
}
