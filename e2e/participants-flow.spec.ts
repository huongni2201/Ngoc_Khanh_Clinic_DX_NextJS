import { expect, test, type Page, type Route } from "@playwright/test"
import { API, mockBackend, ORGANIZATION_ID } from "./support/mock-backend"

const CORS = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Idempotency-Key",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Expose-Headers": "Content-Disposition, Retry-After",
}

const PERMISSIONS = {
  read: "HEALTH_EXAMINATION_PARTICIPANT_READ",
  import: "HEALTH_EXAMINATION_PARTICIPANT_IMPORT",
}

function participant(index: number, batchId: string) {
  return {
    id: `0199dddd-0000-7000-8000-${String(index).padStart(12, "0")}`,
    batchId,
    batchDayId: "0199eeee-0000-7000-8000-000000000001",
    examinationDate: "2026-10-20",
    participantCode: `NV00${index}`,
    fullName: `Người khám ${index}`,
    dateOfBirth: "1990-03-14",
    sex: "FEMALE",
    identificationNumberMasked: "********8901",
    departmentName: "Phòng Kế toán",
    positionName: "Kế toán viên",
    rosterStatus: "ACTIVE",
    attendanceStatus: "UNCONFIRMED",
    reconciliationStatus: "PENDING",
    actualExaminationDate: null,
    preparedAt: null,
    rowVersion: 0,
  }
}

interface ParticipantMock {
  imports: { key: string | undefined; contentType: string | undefined; bodyText: string }[]
  listRequests: string[]
  failNextImport: (status: number, message: string) => void
}

/** Registered after `mockBackend`, so these routes win for the Participant endpoints only. */
async function mockParticipants(page: Page, batchId: string, permissions: string[]) {
  const mock: ParticipantMock = {
    imports: [],
    listRequests: [],
    failNextImport: () => undefined,
  }
  let rows: ReturnType<typeof participant>[] = []
  let importFailure: { status: number; message: string } | null = null
  mock.failNextImport = (status, message) => { importFailure = { status, message } }

  const envelope = (route: Route, status: number, data?: unknown, message = "OK") =>
    route.fulfill({
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ result: status < 400 ? "OK" : "NG", code: status, message, data: data ?? null }),
    })

  await page.route(`${API}/api/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const base = `/api/v1/organizations/${ORGANIZATION_ID}/health-examination-batches/${batchId}/participants`

    if (path === "/api/v1/auth/me") {
      const now = Date.now()
      return envelope(route, 200, {
        principalType: "STAFF",
        userId: "11111111-1111-4111-8111-111111111111",
        staffId: "22222222-2222-4222-8222-222222222222",
        patientId: null,
        username: "staff.test",
        roleAssignments: [{
          roleId: "33333333-3333-4333-8333-333333333333",
          roleCode: "CLINIC_MANAGER",
          permissions: ["ORGANIZATION_READ", "HEALTH_EXAMINATION_BATCH_READ", ...permissions],
        }],
        idleExpiresAt: new Date(now + 30 * 60_000).toISOString(),
        absoluteExpiresAt: new Date(now + 8 * 3600_000).toISOString(),
      })
    }
    if (!path.startsWith(base)) return route.fallback()

    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS })
    if (path === `${base}/import-template`) {
      return route.fulfill({
        status: 200,
        headers: {
          ...CORS,
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="participants-template.xlsx"',
        },
        body: Buffer.from("PK-fake-xlsx"),
      })
    }
    if (path === `${base}/imports` && request.method() === "POST") {
      mock.imports.push({
        key: request.headers()["idempotency-key"],
        contentType: request.headers()["content-type"],
        bodyText: request.postDataBuffer()?.toString("latin1") ?? "",
      })
      if (importFailure) {
        const failure = importFailure
        importFailure = null
        return envelope(route, failure.status, undefined, failure.message)
      }
      rows = [participant(1, batchId), participant(2, batchId)]
      return envelope(route, 201, {
        importJobId: "0199ffff-0000-7000-8000-000000000001",
        batchId,
        totalRows: 2,
        createdCount: 2,
        completedAt: new Date().toISOString(),
      })
    }
    if (path === base && request.method() === "GET") {
      mock.listRequests.push(url.search)
      return envelope(route, 200, {
        items: rows,
        page: 1,
        size: 10,
        totalElements: rows.length,
        totalPages: rows.length ? 1 : 0,
      })
    }
    return route.fallback()
  })

  return mock
}

test("imports a roster from Excel and refreshes the Participant list", async ({ page }) => {
  const backend = await mockBackend(page)
  const batch = backend.seedBatch()
  const participants = await mockParticipants(page, batch.id, [PERMISSIONS.read, PERMISSIONS.import])
  await page.goto(`/organizations/${ORGANIZATION_ID}/health-examination-batches/${batch.id}?tab=participants`)

  await expect(page.getByText("Chưa có người khám trong đợt khám")).toBeVisible()
  const download = page.waitForEvent("download")
  await page.getByRole("button", { name: "Tải file mẫu" }).click()
  expect((await download).suggestedFilename()).toMatch(/^mau-nhap-nguoi-kham-.*\.xlsx$/)

  await page.getByRole("button", { name: "Nhập từ Excel" }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel(/Tệp Excel/).setInputFiles({
    name: "nguoi-kham.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from("PK-fake-xlsx"),
  })
  await dialog.getByRole("button", { name: "Nhập danh sách" }).click()

  await expect(dialog.getByText(/Đã thêm 2 người khám/)).toBeVisible()
  await dialog.locator("form").getByRole("button", { name: "Đóng" }).click()
  await expect(page.getByText("Người khám 1")).toBeVisible()
  await expect(page.getByText("Người khám 2")).toBeVisible()
  await expect(page.getByText("********8901").first()).toBeVisible()

  expect(participants.imports).toHaveLength(1)
  expect(participants.imports[0].key).toMatch(/^[0-9a-f-]{36}$/)
  expect(participants.imports[0].contentType).toMatch(/^multipart\/form-data/)
  expect(participants.imports[0].bodyText).toContain('name="rowVersion"')
  expect(backend.unexpected).toEqual([])
})

test("shows a Vietnamese row error and keeps the same file retryable", async ({ page }) => {
  const backend = await mockBackend(page)
  const batch = backend.seedBatch()
  const participants = await mockParticipants(page, batch.id, [PERMISSIONS.read, PERMISSIONS.import])
  participants.failNextImport(400, "Row 3: full_name is required")
  await page.goto(`/organizations/${ORGANIZATION_ID}/health-examination-batches/${batch.id}?tab=participants`)

  await page.getByRole("button", { name: "Nhập từ Excel" }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel(/Tệp Excel/).setInputFiles({
    name: "nguoi-kham.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from("PK-fake-xlsx"),
  })
  await dialog.getByRole("button", { name: "Nhập danh sách" }).click()

  await expect(dialog.getByText(/Dòng 3: thiếu giá trị ở cột Họ và tên/)).toBeVisible()
  await expect(dialog.getByText("Chưa có người khám nào được thêm vào đợt khám.")).toBeVisible()
  await expect(dialog.getByText(/full_name is required/)).toHaveCount(0)
})

test("a session without the import permission sees the list but no import action", async ({ page }) => {
  const backend = await mockBackend(page)
  const batch = backend.seedBatch()
  await mockParticipants(page, batch.id, [PERMISSIONS.read])
  await page.goto(`/organizations/${ORGANIZATION_ID}/health-examination-batches/${batch.id}?tab=participants`)

  await expect(page.getByText("Chưa có người khám trong đợt khám")).toBeVisible()
  await expect(page.getByRole("button", { name: "Nhập từ Excel" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Tải file mẫu" })).toHaveCount(0)
})

test("a session without the read permission never requests the list", async ({ page }) => {
  const backend = await mockBackend(page)
  const batch = backend.seedBatch()
  const participants = await mockParticipants(page, batch.id, [])
  await page.goto(`/organizations/${ORGANIZATION_ID}/health-examination-batches/${batch.id}?tab=participants`)

  await expect(page.getByText("Không có quyền xem")).toBeVisible()
  expect(participants.listRequests).toEqual([])
})
