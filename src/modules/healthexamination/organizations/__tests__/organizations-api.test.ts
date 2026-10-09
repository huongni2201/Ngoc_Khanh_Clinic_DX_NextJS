import { afterEach, describe, expect, it, vi } from "vitest"
import { createOrganization, deactivateOrganization, fetchOrganizations, updateOrganization } from "../api"
import { apiClient } from "@/shared/api/api-client"
import { organizationFixture } from "./organization-api-fixtures"

describe("organizations API", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("sends exact create, update and deactivate contracts with the read row version", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({ result: "OK", code: 201, data: organizationFixture })
    const put = vi.spyOn(apiClient, "put").mockResolvedValue({ result: "OK", code: 200, data: organizationFixture })
    const remove = vi.spyOn(apiClient, "delete").mockResolvedValue({ result: "OK", code: 204 })
    const input = {
      name: "Clinic North",
      taxCode: "TAX-01", phone: "0900000001", email: "org@example.invalid",
      address: "Address", contactName: "Contact",
      contactPhone: "0900000000", contactEmail: "contact@example.invalid",
    }

    await createOrganization(input)
    await updateOrganization("org-1", { ...input, rowVersion: 3 })
    await deactivateOrganization("org-1", 3)

    const wire = {
      name: "Clinic North",
      taxCode: "TAX-01", phone: "0900000001", email: "org@example.invalid",
      address: "Address", contactFullName: "Contact",
      contactPhone: "0900000000", contactEmail: "contact@example.invalid",
    }
    expect(post).toHaveBeenCalledWith("/api/v1/organizations", wire)
    expect(put).toHaveBeenCalledWith("/api/v1/organizations/org-1", { ...wire, rowVersion: 3 })
    expect(remove).toHaveBeenCalledWith("/api/v1/organizations/org-1?rowVersion=3")
  })

  it("fetches a filtered organization page and maps the backend envelope", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          result: "OK",
          code: 200,
          data: {
            items: [
              {
                id: "organization-1",
                name: "Clinic North",
                taxCode: "TAX-01",
                phone: "0900000001",
                email: "office@example.invalid",
                address: "Address",
                contactFullName: "Contact",
                contactPhone: "0900000000",
                contactEmail: "person@example.invalid",
                status: "ACTIVE",
                rowVersion: 3,
              },
            ],
            page: 2,
            size: 5,
            totalElements: 11,
            totalPages: 3,
          },
        }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const response = await fetchOrganizations({
      search: "Clinic",
      page: 2,
      pageSize: 5,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/v1/organizations?page=2&size=5&searchKey=Clinic&sortKey=id&sortBy=ASC"
      ),
      expect.objectContaining({ method: "GET", cache: "no-store" })
    )
    expect(response).toEqual({
      data: [
        {
          id: "organization-1",
          name: "Clinic North",
          taxCode: "TAX-01",
          phone: "0900000001",
          email: "office@example.invalid",
          address: "Address",
          contactName: "Contact",
          contactPhone: "0900000000",
          contactEmail: "person@example.invalid",
          status: "ACTIVE",
          rowVersion: 3,
        },
      ],
      total: 11,
      page: 2,
      pageSize: 5,
      totalPages: 3,
    })
  })
})
