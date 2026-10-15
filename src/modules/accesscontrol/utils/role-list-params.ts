import { DEFAULT_PAGE_SIZE } from "@/shared/ui/page-size"
import { ROLE_SORT_KEYS, type RoleFilterParams } from "../types/role"

const ROLE_MAX_SEARCH_LENGTH = 100

export type NormalizedRoleFilterParams = Required<Omit<RoleFilterParams, "status">> &
  Pick<RoleFilterParams, "status">

/**
 * One canonical form of the list parameters. The same value builds the query key and the request,
 * so two callers that mean the same list share one cache entry and send one URL.
 */
export function normalizeRoleFilterParams(params?: RoleFilterParams): NormalizedRoleFilterParams {
  const page = params?.page
  const pageSize = params?.pageSize
  return {
    search: (params?.search ?? "").trim().slice(0, ROLE_MAX_SEARCH_LENGTH),
    status: params?.status === "ACTIVE" || params?.status === "INACTIVE" ? params.status : undefined,
    page: page !== undefined && Number.isSafeInteger(page) && page > 0 ? page : 1,
    pageSize:
      pageSize !== undefined && Number.isSafeInteger(pageSize) && pageSize > 0
        ? Math.min(pageSize, 100)
        : DEFAULT_PAGE_SIZE,
    // Roles read best in code order, the order of the SRS Role List.
    sortKey: params?.sortKey && ROLE_SORT_KEYS.includes(params.sortKey) ? params.sortKey : "code",
    sortBy: params?.sortBy === "DESC" ? "DESC" : "ASC",
  }
}
