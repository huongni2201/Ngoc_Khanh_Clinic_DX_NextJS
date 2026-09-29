import { afterEach, describe, expect, it, vi } from "vitest"
import { fetchOrganizations } from "../api"

describe("organizations API", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
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
                address: "Address",
                contactName: "Contact",
                contactPhone: "0900000000",
                contactJobTitle: null,
                note: null,
                status: "ACTIVE",
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
      status: "ACTIVE",
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/v1/organizations?page=2&size=5&searchKey=Clinic&status=ACTIVE&sortKey=id&sortBy=ASC"
      ),
      expect.objectContaining({ method: "GET", cache: "no-store" })
    )
    expect(response).toEqual({
      data: [
        {
          id: "organization-1",
          name: "Clinic North",
          taxCode: "TAX-01",
          address: "Address",
          contactName: "Contact",
          contactPhone: "0900000000",
          contactJobTitle: undefined,
          note: undefined,
          status: "ACTIVE",
        },
      ],
      total: 11,
      page: 2,
      pageSize: 5,
      totalPages: 3,
    })
  })
})
