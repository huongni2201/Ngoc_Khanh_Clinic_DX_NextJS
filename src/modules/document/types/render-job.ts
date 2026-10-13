import { z } from "zod"

/** Lifecycle of a background print job (`document_render_jobs.status`). */
export const RENDER_JOB_STATUSES = ["QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "EXPIRED"] as const
export type RenderJobStatus = (typeof RENDER_JOB_STATUSES)[number]

/**
 * Why one record was left out of the output. Kept as a string so a reason the backend adds later
 * still parses; the known values are `NOT_FOUND`, `CANCELLED`, `TOO_LONG` and `RENDER_FAILED`.
 */
export type RenderJobSkipReason = string

/**
 * Why a job failed, for example `NO_TEMPLATE` or `RENDERER_UNAVAILABLE`. Kept as a string for the
 * same reason as the skip reason.
 */
export type RenderJobErrorCode = string

export const renderJobResponseSchema = z.object({
  id: z.string().min(1),
  documentType: z.string(),
  status: z.enum(RENDER_JOB_STATUSES),
  totalCount: z.number().int().nonnegative(),
  processedCount: z.number().int().nonnegative(),
  errorCode: z.string().nullable().optional(),
  skipped: z.array(z.object({ id: z.string().min(1), reason: z.string() })),
  parts: z.array(
    z.object({
      partNo: z.number().int().positive(),
      recordCount: z.number().int().nonnegative(),
      sizeBytes: z.number().nonnegative(),
    })
  ),
  createdAt: z.string(),
  finishedAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
})

export type RenderJobResponseDto = z.infer<typeof renderJobResponseSchema>

export interface RenderJobSkippedRecord {
  /** Identifier of the source record (for a Participant print job, the Participant id). */
  id: string
  reason: RenderJobSkipReason
}

export interface RenderJobPart {
  partNo: number
  /** Records printed in this part. */
  recordCount: number
  sizeBytes: number
}

/** A print job as its creator sees it. Only identifiers and reasons, never personal data. */
export interface RenderJob {
  id: string
  documentType: string
  status: RenderJobStatus
  totalCount: number
  /** Records handled so far, printed or skipped. */
  processedCount: number
  errorCode?: RenderJobErrorCode
  skipped: RenderJobSkippedRecord[]
  /** PDF parts in print order; present once the job succeeded. */
  parts: RenderJobPart[]
  /** ISO instants. */
  createdAt: string
  finishedAt?: string
  /** When the files are deleted (24 hours after the job ended). */
  expiresAt?: string
}

/** A merged PDF part ready to be saved or opened. */
export interface RenderJobPartFile {
  blob: Blob
  fileName: string
}
