import { apiClient } from "@/shared/api/api-client"
import {
  renderJobResponseSchema,
  type RenderJob,
  type RenderJobPartFile,
  type RenderJobResponseDto,
} from "../types/render-job"

/** A part holds up to 200 forms (tens of MB), so the download gets more time than a JSON call. */
export const RENDER_JOB_PART_DOWNLOAD_TIMEOUT_MS = 180_000

export function buildRenderJobUrl(jobId: string) {
  return `/api/v1/document-render-jobs/${encodeURIComponent(jobId)}`
}

export function buildRenderJobPartUrl(jobId: string, partNo: number) {
  return `${buildRenderJobUrl(jobId)}/parts/${encodeURIComponent(String(partNo))}`
}

function mapRenderJob(job: RenderJobResponseDto): RenderJob {
  return {
    id: job.id,
    documentType: job.documentType,
    status: job.status,
    totalCount: job.totalCount,
    processedCount: job.processedCount,
    errorCode: job.errorCode ?? undefined,
    skipped: job.skipped,
    parts: [...job.parts].sort((left, right) => left.partNo - right.partNo),
    createdAt: job.createdAt,
    finishedAt: job.finishedAt ?? undefined,
    expiresAt: job.expiresAt ?? undefined,
  }
}

/** Progress of a job the caller created. Another account's job answers 404 like a missing one. */
export async function fetchRenderJob(jobId: string, signal?: AbortSignal): Promise<RenderJob> {
  const response = await apiClient.get<unknown>(buildRenderJobUrl(jobId), { signal })
  if (!response.data) {
    throw new Error(response.message || "Phản hồi lệnh in không có dữ liệu.")
  }
  return mapRenderJob(renderJobResponseSchema.parse(response.data))
}

/** One merged PDF part of a finished job; 404 once the job expired, 409 while it is not finished. */
export async function downloadRenderJobPart(
  jobId: string,
  partNo: number,
  signal?: AbortSignal
): Promise<RenderJobPartFile> {
  const { blob, filename } = await apiClient.getBlob(buildRenderJobPartUrl(jobId, partNo), {
    signal,
    timeoutMs: RENDER_JOB_PART_DOWNLOAD_TIMEOUT_MS,
  })
  return { blob, fileName: filename?.trim() || `lenh-in-phan-${partNo}.pdf` }
}
