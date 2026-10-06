import { expect, type Page, type Route } from "@playwright/test"

/**
 * In-browser stand-in for the backend contract, used only by the `chromium` Playwright project.
 * It is stateful (create/update/delete behave like the real endpoints, including 409 on a stale
 * rowVersion) and records every request, so a spec can assert what the UI did NOT send.
 */
export const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
export const ORGANIZATION_ID = "0199aaaa-0000-7000-8000-000000000001"

const CORS = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type, X-XSRF-TOKEN",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
}

const CATALOG = [
  { id: "0199bbbb-0000-7000-8000-000000000001", code: "LOCAL_SVC_CONSULT", name: "Khám tổng quát", serviceType: "CONSULTATION", unitPrice: 150000, active: true },
  { id: "0199bbbb-0000-7000-8000-000000000002", code: "LOCAL_SVC_LAB_BLOOD", name: "Xét nghiệm công thức máu", serviceType: "LAB", unitPrice: 90000, active: true },
]

interface StoredBatch {
  id: string
  batchCode: string
  batchName: string
  dates: string[]
  siteType: string
  siteName: string
  siteAddress: string
  status: "DRAFT" | "READY"
  rowVersion: number
  services: { serviceId: string; negotiatedPrice: number }[]
}

export interface RecordedRequest {
  method: string
  path: string
  search: string
}

export interface MockBackend {
  requests: RecordedRequest[]
  /** Requests no handler recognized; a spec can assert it stays empty. */
  unexpected: RecordedRequest[]
  batches: StoredBatch[]
  /** Makes every list call fail with this status until `clearListFailure` (dev mode may repeat a request). */
  failList: (status: number) => void
  clearListFailure: () => void
  /** Makes the next update fail with 409, as if someone else saved first. */
  conflictNextUpdate: () => void
  /** Makes the next delete fail with 409. */
  conflictNextDelete: () => void
  seedBatch: (partial?: Partial<StoredBatch>) => StoredBatch
}

function session() {
  const now = Date.now()
  return {
    principalType: "STAFF",
    userId: "11111111-1111-4111-8111-111111111111",
    staffId: "22222222-2222-4222-8222-222222222222",
    patientId: null,
    username: "staff.test",
    roleAssignments: [{
      assignmentId: "33333333-3333-4333-8333-333333333333",
      roleCode: "STAFF",
      permissions: ["encounter.read"],
      departmentId: null,
      roomId: null,
      validFrom: "2026-01-01T00:00:00Z",
      validTo: null,
    }],
    idleExpiresAt: new Date(now + 30 * 60_000).toISOString(),
    absoluteExpiresAt: new Date(now + 8 * 3600_000).toISOString(),
  }
}

function organization() {
  return {
    id: ORGANIZATION_ID,
    name: "Đơn vị kiểm thử E2E",
    taxCode: null,
    phone: "0900000001",
    email: "org@example.invalid",
    address: "1 Đường Kiểm Thử, Hà Nội",
    contactFullName: "Người liên hệ",
    contactPhone: "0900000002",
    contactEmail: "contact@example.invalid",
    status: "ACTIVE",
    rowVersion: 1,
  }
}

function detail(batch: StoredBatch) {
  const sorted = [...batch.dates].sort()
  return {
    id: batch.id,
    organizationId: ORGANIZATION_ID,
    batchCode: batch.batchCode,
    batchName: batch.batchName,
    days: sorted.map((examinationDate, index) => ({ id: `${batch.id}-d${index}`, examinationDate })),
    startDate: sorted[0] ?? null,
    endDate: sorted.at(-1) ?? null,
    examinationSiteType: batch.siteType,
    examinationSiteName: batch.siteName,
    examinationSiteAddress: batch.siteAddress,
    status: batch.status,
    createdBy: "22222222-2222-4222-8222-222222222222",
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
    rowVersion: batch.rowVersion,
    services: batch.services.map((service, index) => {
      const item = CATALOG.find((entry) => entry.id === service.serviceId)
      return {
        id: `${batch.id}-s${index}`,
        serviceId: service.serviceId,
        serviceCode: item?.code ?? null,
        serviceName: item?.name ?? null,
        referencePriceSnapshot: item?.unitPrice ?? 0,
        negotiatedPrice: service.negotiatedPrice,
        displayOrder: index + 1,
        active: true,
        rowVersion: 0,
      }
    }),
  }
}

function summary(batch: StoredBatch) {
  const { id, batchCode, batchName, startDate, endDate, status, createdAt, updatedAt, rowVersion } = detail(batch)
  return { id, batchCode, batchName, startDate, endDate, status, createdAt, updatedAt, rowVersion }
}

function envelope(route: Route, status: number, data?: unknown, message = "Test response") {
  return route.fulfill({
    status,
    headers: CORS,
    contentType: "application/json",
    body: status === 204 ? undefined : JSON.stringify({ result: status < 300 ? "OK" : "NG", code: status, message, data }),
  })
}

export async function mockBackend(page: Page): Promise<MockBackend> {
  const state: MockBackend = {
    requests: [],
    unexpected: [],
    batches: [],
    failList: () => undefined,
    clearListFailure: () => undefined,
    conflictNextUpdate: () => undefined,
    conflictNextDelete: () => undefined,
    seedBatch: () => {
      throw new Error("not initialised")
    },
  }
  let listFailure: number | null = null
  let updateConflict = false
  let deleteConflict = false
  let sequence = 0

  state.failList = (status) => { listFailure = status }
  state.clearListFailure = () => { listFailure = null }
  state.conflictNextUpdate = () => { updateConflict = true }
  state.conflictNextDelete = () => { deleteConflict = true }
  state.seedBatch = (partial = {}) => {
    sequence += 1
    const batch: StoredBatch = {
      id: `0199cccc-0000-7000-8000-${String(sequence).padStart(12, "0")}`,
      batchCode: `SEED-${sequence}`,
      batchName: `Đợt khám có sẵn ${sequence}`,
      dates: ["2026-10-20"],
      siteType: "CLINIC",
      siteName: "Phòng khám Ngọc Khánh",
      siteAddress: "1 Đường A",
      status: "DRAFT",
      rowVersion: 0,
      services: [{ serviceId: CATALOG[0].id, negotiatedPrice: 150000 }],
      ...partial,
    }
    state.batches.push(batch)
    return batch
  }

  await page.route(`${API}/api/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    const path = url.pathname
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers: CORS })
    state.requests.push({ method, path, search: url.search })

    if (path === "/api/v1/auth/csrf") return envelope(route, 200, { token: "masked-test-token", headerName: "X-XSRF-TOKEN" })
    if (path === "/api/v1/auth/me") return envelope(route, 200, session())
    if (path === "/api/v1/catalog/services") {
      return envelope(route, 200, { items: CATALOG, page: 1, size: 100, totalElements: CATALOG.length, totalPages: 1 })
    }
    if (path === `/api/v1/organizations/${ORGANIZATION_ID}` && method === "GET") return envelope(route, 200, organization())

    const batchesPath = `/api/v1/organizations/${ORGANIZATION_ID}/health-examination-batches`
    if (path === batchesPath && method === "GET") {
      if (listFailure !== null) return envelope(route, listFailure, undefined, "Forbidden by test")
      const keyword = (url.searchParams.get("searchKey") ?? "").toLowerCase()
      const items = state.batches
        .filter((batch) => !keyword || batch.batchCode.toLowerCase().includes(keyword) || batch.batchName.toLowerCase().includes(keyword))
        .map(summary)
      return envelope(route, 200, { items, page: 1, size: 10, totalElements: items.length, totalPages: items.length ? 1 : 0 })
    }
    if (path === batchesPath && method === "POST") {
      expect(request.headers()["x-xsrf-token"]).toBe("masked-test-token")
      const body = request.postDataJSON() as Record<string, unknown>
      if (state.batches.some((batch) => batch.batchCode === body.batchCode)) {
        return envelope(route, 409, undefined, "Batch code already exists")
      }
      const batch = state.seedBatch({
        batchCode: String(body.batchCode),
        batchName: String(body.batchName),
        dates: body.examinationDates as string[],
        siteType: String(body.examinationSiteType),
        siteName: String(body.examinationSiteName),
        siteAddress: String(body.examinationSiteAddress),
        services: body.services as StoredBatch["services"],
      })
      return envelope(route, 201, detail(batch))
    }

    const itemMatch = path.match(new RegExp(`^${batchesPath}/([^/]+)$`))
    if (itemMatch) {
      const batch = state.batches.find((entry) => entry.id === itemMatch[1])
      if (!batch) return envelope(route, 404, undefined, "Batch not found")
      if (method === "GET") return envelope(route, 200, detail(batch))
      expect(request.headers()["x-xsrf-token"]).toBe("masked-test-token")
      if (method === "PUT") {
        const body = request.postDataJSON() as Record<string, unknown>
        if (updateConflict || body.rowVersion !== batch.rowVersion) {
          updateConflict = false
          // The "other user" saved first: the stored version moves on.
          batch.rowVersion += 1
          batch.batchName = `${batch.batchName} (đã sửa bởi người khác)`
          return envelope(route, 409, undefined, "Stale row version")
        }
        Object.assign(batch, {
          batchName: String(body.batchName),
          dates: body.examinationDates as string[],
          siteType: String(body.examinationSiteType),
          siteName: String(body.examinationSiteName),
          siteAddress: String(body.examinationSiteAddress),
          services: body.services as StoredBatch["services"],
          rowVersion: batch.rowVersion + 1,
        })
        return envelope(route, 200, detail(batch))
      }
      if (method === "DELETE") {
        if (deleteConflict || url.searchParams.get("rowVersion") !== String(batch.rowVersion)) {
          deleteConflict = false
          batch.status = "READY"
          batch.rowVersion += 1
          return envelope(route, 409, undefined, "Batch is not deletable")
        }
        state.batches = state.batches.filter((entry) => entry.id !== batch.id)
        return envelope(route, 204)
      }
    }

    state.unexpected.push({ method, path, search: url.search })
    return envelope(route, 404, undefined, "Unexpected request in mock backend")
  })

  return state
}
