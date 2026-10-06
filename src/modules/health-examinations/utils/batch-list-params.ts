import type { HealthExaminationBatchFilterParams } from "../types"

export const BATCH_SORT_KEYS = [
  "id",
  "batchCode",
  "batchName",
  "startDate",
  "status",
  "createdAt",
] as const
export const BATCH_MAX_SEARCH_LENGTH = 100
export const BATCH_DEFAULT_PAGE_SIZE = 10

export type NormalizedBatchFilterParams = Required<HealthExaminationBatchFilterParams>

/** One canonical form of the list parameters: it builds both the query key and the request URL. */
export function normalizeBatchFilterParams(
  params?: HealthExaminationBatchFilterParams
): NormalizedBatchFilterParams {
  const sortKey = params?.sortKey
  return {
    search: (params?.search ?? "").trim().slice(0, BATCH_MAX_SEARCH_LENGTH),
    page: Number.isSafeInteger(params?.page) && (params?.page ?? 0) > 0 ? params!.page! : 1,
    pageSize:
      Number.isSafeInteger(params?.pageSize) && (params?.pageSize ?? 0) > 0
        ? Math.min(params!.pageSize!, 100)
        : BATCH_DEFAULT_PAGE_SIZE,
    sortKey: BATCH_SORT_KEYS.includes(sortKey as (typeof BATCH_SORT_KEYS)[number])
      ? sortKey!
      : "id",
    sortBy: params?.sortBy === "DESC" ? "DESC" : "ASC",
  }
}
