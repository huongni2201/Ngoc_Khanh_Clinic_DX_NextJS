import type { OrganizationFilterParams } from "../types"

export const ORGANIZATION_SORT_KEYS = ["id", "taxCode", "name"] as const
export const ORGANIZATION_MAX_SEARCH_LENGTH = 100

export type NormalizedOrganizationFilterParams = Required<OrganizationFilterParams>

/**
 * One canonical form of the list parameters. The same value builds the query key and the request,
 * so two callers that mean the same list share one cache entry and send one URL.
 */
export function normalizeOrganizationFilterParams(
  params?: OrganizationFilterParams
): NormalizedOrganizationFilterParams {
  const sortKey = params?.sortKey
  return {
    search: (params?.search ?? "").trim().slice(0, ORGANIZATION_MAX_SEARCH_LENGTH),
    page: Number.isSafeInteger(params?.page) && (params?.page ?? 0) > 0 ? params!.page! : 1,
    pageSize: Number.isSafeInteger(params?.pageSize) && (params?.pageSize ?? 0) > 0
      ? Math.min(params!.pageSize!, 100)
      : 10,
    sortKey: ORGANIZATION_SORT_KEYS.includes(sortKey as (typeof ORGANIZATION_SORT_KEYS)[number])
      ? sortKey!
      : "id",
    sortBy: params?.sortBy === "DESC" ? "DESC" : "ASC",
  }
}
