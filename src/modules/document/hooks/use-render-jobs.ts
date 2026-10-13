"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { downloadRenderJobPart, fetchRenderJob } from "../api/render-jobs"
import { documentKeys } from "../query-keys"
import type { RenderJob, RenderJobPartFile } from "../types/render-job"
import { isRenderJobActive } from "../utils/render-job-labels"

/** How often an unfinished job is read again. The backend saves progress every 25 records. */
export const RENDER_JOB_POLL_INTERVAL_MS = 2_000

/**
 * Follows one print job. It is read again every two seconds while queued or running and only while
 * the browser tab is visible; polling stops once the job finished, failed or cannot be read.
 */
export function useRenderJob(jobId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery<RenderJob>({
    queryKey: documentKeys.renderJob(jobId ?? ""),
    queryFn: ({ signal }) => fetchRenderJob(jobId as string, signal),
    meta: { requiresAuth: true },
    enabled: Boolean(jobId) && (options?.enabled ?? true),
    retry: false,
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.status !== "error" && isRenderJobActive(query.state.data?.status)
        ? RENDER_JOB_POLL_INTERVAL_MS
        : false,
    refetchIntervalInBackground: false,
  })
}

/** Downloads one PDF part. The caller decides whether to save or open it. It never retries. */
export function useDownloadRenderJobPart() {
  return useMutation<RenderJobPartFile, Error, { jobId: string; partNo: number }>({
    mutationFn: ({ jobId, partNo }) => downloadRenderJobPart(jobId, partNo),
    retry: false,
  })
}
