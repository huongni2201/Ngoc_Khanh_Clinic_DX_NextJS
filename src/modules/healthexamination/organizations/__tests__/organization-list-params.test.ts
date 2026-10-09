import { describe, expect, it } from "vitest"
import { normalizeOrganizationFilterParams } from "../utils/organization-list-params"

describe("normalizeOrganizationFilterParams", () => {
  it("fills defaults", () => {
    expect(normalizeOrganizationFilterParams()).toEqual({
      search: "",
      page: 1,
      pageSize: 10,
      sortKey: "id",
      sortBy: "ASC",
    })
  })

  it("trims the search and keeps only contract sort keys", () => {
    expect(normalizeOrganizationFilterParams({ search: "  fpt ", sortKey: "name", sortBy: "DESC" }))
      .toMatchObject({ search: "fpt", sortKey: "name", sortBy: "DESC" })
    expect(normalizeOrganizationFilterParams({ sortKey: "taxCode" }))
      .toMatchObject({ sortKey: "taxCode" })
    expect(normalizeOrganizationFilterParams({ sortKey: "code" }))
      .toMatchObject({ sortKey: "id" })
    expect(normalizeOrganizationFilterParams({ sortKey: "status; DROP", sortBy: "ASC" }))
      .toMatchObject({ sortKey: "id", sortBy: "ASC" })
  })

  it("bounds page, size and search length to what the backend accepts", () => {
    expect(normalizeOrganizationFilterParams({ page: 0, pageSize: 500 })).toMatchObject({ page: 1, pageSize: 100 })
    expect(normalizeOrganizationFilterParams({ page: -3, pageSize: -1 })).toMatchObject({ page: 1, pageSize: 10 })
    expect(normalizeOrganizationFilterParams({ search: "x".repeat(150) }).search).toHaveLength(100)
  })
})
