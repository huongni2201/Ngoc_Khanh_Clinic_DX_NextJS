import type { OrganizationFilterParams } from "./types"
import { normalizeOrganizationFilterParams } from "./utils/organization-list-params"

export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  list: (params?: OrganizationFilterParams) =>
    [...organizationKeys.lists(), normalizeOrganizationFilterParams(params)] as const,
  details: () => [...organizationKeys.all, "detail"] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
}
