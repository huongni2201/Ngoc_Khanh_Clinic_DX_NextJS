import { vi } from "vitest"
import type { OrganizationResponseDto } from "../types/transport"

export const organizationFixture: OrganizationResponseDto = {
  id: "org-1",
  name: "Công ty Cổ phần FPT",
  taxCode: "0101243150",
  phone: "0900000001",
  email: "office@example.invalid",
  address: "Tòa nhà FPT, Cầu Giấy, Hà Nội",
  contactFullName: "Nguyễn Văn Hùng",
  contactPhone: "0912345678",
  contactEmail: "person@example.invalid",
  status: "ACTIVE",
  rowVersion: 3,
}

export function mockOrganizationFetch() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl = new URL(String(input))
    const method = init?.method ?? "GET"
    const organizationId = requestUrl.pathname.split("/").at(-1)

    if (method === "DELETE") return new Response(null, { status: 204 })

    if (method === "PUT") {
      return jsonResponse({ result: "OK", code: 200, data: { ...organizationFixture, rowVersion: 4 } })
    }

    if (method === "POST") {
      return jsonResponse({
        result: "OK",
        code: 201,
        data: { ...organizationFixture, id: "org-created" },
      })
    }

    if (organizationId === "nonexistent-999") {
      return jsonResponse(
        { result: "NG", code: 404, message: "Không tìm thấy đơn vị." },
        404
      )
    }

    if (organizationId && organizationId !== "organizations") {
      return jsonResponse({ result: "OK", code: 200, data: organizationFixture })
    }

    return jsonResponse({
      result: "OK",
      code: 200,
      data: {
        items: [organizationFixture],
        page: Number(requestUrl.searchParams.get("page") ?? 1),
        size: Number(requestUrl.searchParams.get("size") ?? 10),
        totalElements: 1,
        totalPages: 1,
      },
    })
  })

  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}
