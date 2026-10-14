import { STAFF_MEMBER_SORT_KEYS, type StaffMemberFilterParams } from "../types/staff-member"

const STAFF_MEMBER_MAX_SEARCH_LENGTH = 100

export type NormalizedStaffMemberFilterParams = Required<StaffMemberFilterParams>

/**
 * One canonical form of the list parameters. The same value builds the query key and the request,
 * so two callers that mean the same list share one cache entry and send one URL.
 */
export function normalizeStaffMemberFilterParams(
  params?: StaffMemberFilterParams
): NormalizedStaffMemberFilterParams {
  const page = params?.page
  const pageSize = params?.pageSize
  return {
    search: (params?.search ?? "").trim().slice(0, STAFF_MEMBER_MAX_SEARCH_LENGTH),
    page: page !== undefined && Number.isSafeInteger(page) && page > 0 ? page : 1,
    pageSize:
      pageSize !== undefined && Number.isSafeInteger(pageSize) && pageSize > 0
        ? Math.min(pageSize, 100)
        : 10,
    sortKey:
      params?.sortKey && STAFF_MEMBER_SORT_KEYS.includes(params.sortKey) ? params.sortKey : "id",
    sortBy: params?.sortBy === "DESC" ? "DESC" : "ASC",
  }
}
