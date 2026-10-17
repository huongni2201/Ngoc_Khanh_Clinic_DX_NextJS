import type { HealthExaminationAgreementFilterParams } from "../types"

export const AGREEMENT_SORT_KEYS = [
  "id",
  "agreementCode",
  "agreementName",
  "validFrom",
  "status",
  "createdAt",
] as const
export const AGREEMENT_MAX_SEARCH_LENGTH = 100
export const AGREEMENT_DEFAULT_PAGE_SIZE = 10

export type NormalizedAgreementFilterParams = Required<HealthExaminationAgreementFilterParams>

/** One canonical form of the list parameters: it builds both the query key and the request URL. */
export function normalizeAgreementFilterParams(
  params?: HealthExaminationAgreementFilterParams
): NormalizedAgreementFilterParams {
  const sortKey = params?.sortKey
  return {
    search: (params?.search ?? "").trim().slice(0, AGREEMENT_MAX_SEARCH_LENGTH),
    page: Number.isSafeInteger(params?.page) && (params?.page ?? 0) > 0 ? params!.page! : 1,
    pageSize:
      Number.isSafeInteger(params?.pageSize) && (params?.pageSize ?? 0) > 0
        ? Math.min(params!.pageSize!, 100)
        : AGREEMENT_DEFAULT_PAGE_SIZE,
    sortKey: AGREEMENT_SORT_KEYS.includes(sortKey as (typeof AGREEMENT_SORT_KEYS)[number])
      ? sortKey!
      : "id",
    sortBy: params?.sortBy === "DESC" ? "DESC" : "ASC",
  }
}
