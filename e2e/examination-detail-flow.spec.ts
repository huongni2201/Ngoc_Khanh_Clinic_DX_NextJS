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
  read: "HEALTH_EXAMINATION_SERVICE_READ",
  reconcile: "HEALTH_EXAMINATION_SERVICE_RECONCILE",
  report: "HEALTH_EXAMINATION_REPORT_READ",
}

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

interface ExaminationMock {
  /** Every request path (with query) the examination and report endpoints received. */
  requests: string[]
  imports: { key: string | undefined; contentType: string | undefined }[]
  failNextImport: (status: number, message: string) => void
}

/**
 * Registered after `mockBackend`, so these routes win for the examination detail and report
 * endpoints only. The first row has one performed service; an import marks both rows reconciled.
 */
async function mockExamination(page: Page, batchId: string, permissions: string[]) {
  const mock: ExaminationMock = { requests: [], imports: [], failNextImport: () => undefined }
  const base = `/api/v1/organizations/${ORGANIZATION_ID}/health-examination-batches/${batchId}`
  const serviceId = `${batchId}-s0`
  let reconciled = false
  let failure: { status: number; message: string } | null = null
  mock.failNextImport = (status, message) => { failure = { status, message } }

  const envelope = (route: Route, status: number, data?: unknown, message = "OK") =>
    route.fulfill({
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ result: status < 400 ? "OK" : "NG", code: status, message, data: data ?? null }),
    })

  const row = (index: number) => ({
    id: `0199dddd-0000-7000-8000-${String(index).padStart(12, "0")}`,
    participantCode: `NV00${index}`,
    fullName: `Người khám ${index}`,
    identificationNumberMasked: "********8901",
    departmentName: "Phòng Kế toán",
    positionName: "Kế toán viên",
    examinationDate: "2026-10-20",
    attendanceStatus: reconciled || index === 1 ? "ATTENDED" : "UNCONFIRMED",
    actualExaminationDate: reconciled || index === 1 ? "2026-10-20" : null,
    reconciliationStatus: reconciled ? "RECONCILED" : "PENDING",
    performedBatchServiceIds: reconciled || index === 1 ? [serviceId] : [],
    rowVersion: reconciled ? 1 : 0,
  })

  await page.route(`${API}/api/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname

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
    if (!path.startsWith(`${base}/examination-details`) && !path.startsWith(`${base}/reports`)) {
      return route.fallback()
    }

    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS })
    mock.requests.push(`${path}${url.search}`)

    if (path === `${base}/examination-details/summary`) {
      return envelope(route, 200, {
        registered: 2,
        unconfirmed: reconciled ? 0 : 1,
        attended: reconciled ? 2 : 1,
        absent: 0,
        reconciled: reconciled ? 2 : 0,
        pendingReconciliation: reconciled ? 0 : 1,
      })
    }
    if (path === `${base}/examination-details/export`) {
      return route.fulfill({
        status: 200,
        headers: {
          ...CORS,
          "Content-Type": XLSX,
          "Content-Disposition": 'attachment; filename="chi-tiet-kham-SEED-1.xlsx"',
        },
        body: Buffer.from("PK-fake-xlsx"),
      })
    }
    if (path === `${base}/examination-details/imports` && request.method() === "POST") {
      mock.imports.push({
        key: request.headers()["idempotency-key"],
        contentType: request.headers()["content-type"],
      })
      if (failure) {
        const rejected = failure
        failure = null
        return envelope(route, rejected.status, undefined, rejected.message)
      }
      reconciled = true
      return envelope(route, 201, {
        importJobId: "0199ffff-0000-7000-8000-000000000001",
        batchId,
        totalRows: 2,
        updatedParticipants: 2,
        unchangedParticipants: 0,
        performedItems: 2,
        completedAt: new Date().toISOString(),
      })
    }
    if (path === `${base}/examination-details`) {
      return envelope(route, 200, {
        items: [row(1), row(2)],
        page: 1,
        size: 10,
        totalElements: 2,
        totalPages: 1,
      })
    }
    if (path === `${base}/reports/payment-summary/docx`) {
      return route.fulfill({
        status: 200,
        headers: {
          ...CORS,
          "Content-Type": DOCX,
          "Content-Disposition": 'attachment; filename="bao-cao-thanh-toan-SEED-1.docx"',
        },
        body: Buffer.from("PK-fake-docx"),
      })
    }
    if (path === `${base}/reports/payment-summary`) {
      return envelope(route, 200, {
        batchId,
        batchCode: "SEED-1",
        batchName: "Đợt khám có sẵn 1",
        batchStatus: "DRAFT",
        provisional: true,
        registeredCount: 2,
        attendedCount: reconciled ? 2 : 1,
        reconciledCount: reconciled ? 2 : 0,
        items: [{
          batchServiceId: serviceId,
          serviceCode: "LOCAL_SVC_CONSULT",
          serviceName: "Khám tổng quát",
          displayOrder: 1,
          unitPrice: 150000,
          examinedCount: reconciled ? 2 : 1,
          amount: reconciled ? 300000 : 150000,
        }],
        totalAmount: reconciled ? 300000 : 150000,
        generatedAt: new Date().toISOString(),
      })
    }
    return route.fallback()
  })

  return mock
}

const batchUrl = (batchId: string, tab: string) =>
  `/organizations/${ORGANIZATION_ID}/health-examination-batches/${batchId}?tab=${tab}`

async function chooseWorkbook(page: Page) {
  await page.getByRole("button", { name: "Nhập Excel" }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel(/Tệp Excel/).setInputFiles({
    name: "chi-tiet-kham.xlsx",
    mimeType: XLSX,
    buffer: Buffer.from("PK-fake-xlsx"),
  })
  await dialog.getByRole("button", { name: "Nhập chi tiết khám" }).click()
  return dialog
}

test("shows the matrix, exports the workbook and imports a reconciliation file", async ({ page }) => {
  const backend = await mockBackend(page)
  const batch = backend.seedBatch()
  const examination = await mockExamination(page, batch.id, [PERMISSIONS.read, PERMISSIONS.reconcile])
  await page.goto(batchUrl(batch.id, "examination"))

  await expect(page.getByText("Người khám 1")).toBeVisible()
  await expect(page.getByText("Khám tổng quát").first()).toBeVisible()
  await expect(page.getByTitle("Đã khám")).toHaveCount(1)
  await expect(page.getByText("Đã đến – chờ đối soát")).toBeVisible()
  await expect(page.getByText("Chưa đến").first()).toBeVisible()

  const download = page.waitForEvent("download")
  await page.getByRole("button", { name: "Xuất Excel" }).click()
  expect((await download).suggestedFilename()).toBe("chi-tiet-kham-SEED-1.xlsx")

  const dialog = await chooseWorkbook(page)
  await expect(dialog.getByText(/Đã cập nhật 2 người khám/)).toBeVisible()
  await dialog.locator("form").getByRole("button", { name: "Đóng" }).click()

  await expect(page.getByTitle("Đã khám")).toHaveCount(2)
  await expect(page.getByText("Đã đối soát").first()).toBeVisible()
  expect(examination.imports).toHaveLength(1)
  expect(examination.imports[0].key).toMatch(/^[0-9a-f-]{36}$/)
  expect(examination.imports[0].contentType).toMatch(/^multipart\/form-data/)
  expect(backend.unexpected).toEqual([])
})

test("shows a Vietnamese message when a Participant changed after the export", async ({ page }) => {
  const backend = await mockBackend(page)
  const batch = backend.seedBatch()
  const examination = await mockExamination(page, batch.id, [PERMISSIONS.read, PERMISSIONS.reconcile])
  examination.failNextImport(409, "Row 9: participant was changed after export; export again")
  await page.goto(batchUrl(batch.id, "examination"))
  await expect(page.getByText("Người khám 1")).toBeVisible()

  const dialog = await chooseWorkbook(page)

  await expect(dialog.getByText(/Dòng 9: người khám đã được thay đổi sau khi xuất file/)).toBeVisible()
  await expect(dialog.getByText("Chưa có thay đổi nào được ghi vào đợt khám.")).toBeVisible()
  await expect(dialog.getByRole("button", { name: "Xuất lại file" })).toBeVisible()
  await expect(dialog.getByText(/participant was changed/)).toHaveCount(0)
})

test("a session with only the read permission cannot import and sees no report tab", async ({ page }) => {
  const backend = await mockBackend(page)
  const batch = backend.seedBatch()
  const examination = await mockExamination(page, batch.id, [PERMISSIONS.read])
  await page.goto(batchUrl(batch.id, "examination"))

  await expect(page.getByText("Người khám 1")).toBeVisible()
  await expect(page.getByRole("button", { name: "Xuất Excel" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Nhập Excel" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Báo cáo" })).toHaveCount(0)
  expect(examination.requests.filter((path) => path.includes("/reports/"))).toEqual([])
})

test("shows the provisional payment summary and downloads the Word file", async ({ page }) => {
  const backend = await mockBackend(page)
  const batch = backend.seedBatch()
  await mockExamination(page, batch.id, [PERMISSIONS.report])
  await page.goto(batchUrl(batch.id, "report"))

  await expect(page.getByText("Tạm tính").first()).toBeVisible()
  await expect(page.getByRole("table").getByText("Khám tổng quát")).toBeVisible()
  await expect(page.getByText("Khám tổng quát: 150.000 đ x 1 = 150.000 đ")).toBeVisible()
  await expect(page.getByRole("button", { name: "Xuất Excel chi tiết" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: /tổng hợp \(dọc\)/ })).toHaveCount(0)

  const download = page.waitForEvent("download")
  await page.getByRole("button", { name: "Xuất Word" }).click()
  expect((await download).suggestedFilename()).toBe("bao-cao-thanh-toan-SEED-1.docx")
})

test("a session without either permission sees neither tab and requests nothing for them", async ({ page }) => {
  const backend = await mockBackend(page)
  const batch = backend.seedBatch()
  const examination = await mockExamination(page, batch.id, [])
  await page.goto(batchUrl(batch.id, "report"))

  await expect(page.getByRole("heading", { name: batch.batchName })).toBeVisible()
  await expect(page.getByRole("button", { name: "Chi tiết khám" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Báo cáo" })).toHaveCount(0)
  await page.waitForTimeout(500)
  expect(examination.requests).toEqual([])
  expect(backend.unexpected).toEqual([])
})
