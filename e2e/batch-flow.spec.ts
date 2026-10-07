import { expect, test, type Page } from "@playwright/test"
import { mockBackend, ORGANIZATION_ID } from "./support/mock-backend"

const ORGANIZATION_URL = `/organizations/${ORGANIZATION_ID}`

async function fillBatchForm(page: Page, code: string, name: string) {
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByRole("checkbox", { name: "Khám tổng quát" })).toBeVisible()
  await dialog.getByLabel(/Mã đợt khám/).fill(code)
  await dialog.getByLabel(/Tên đợt khám/).fill(name)
  await dialog.getByLabel(/^Ngày khám/).fill("2026-10-21")
  await dialog.getByRole("button", { name: "Thêm ngày" }).click()
  await dialog.getByLabel(/Loại địa điểm/).selectOption("ORGANIZATION_SITE")
  await dialog.getByLabel(/Tên địa điểm/).fill("Trụ sở đơn vị")
  await dialog.getByRole("checkbox", { name: "Khám tổng quát" }).check()
}

test("create, view, edit and delete a batch through the real UI flow", async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto(ORGANIZATION_URL)
  await expect(page.getByText("Chưa có đợt khám nào cho đơn vị này")).toBeVisible()

  await page.getByRole("button", { name: "Tạo đợt khám" }).first().click()
  await fillBatchForm(page, "E2E-001", "Khám định kỳ E2E")
  await page.getByRole("dialog").getByRole("button", { name: "Tạo đợt khám" }).click()

  await expect(page).toHaveURL(new RegExp(`/organizations/${ORGANIZATION_ID}/health-examination-batches/[^/]+$`))
  await expect(page.getByRole("heading", { name: "Khám định kỳ E2E" })).toBeVisible()
  await expect(page.getByText("Nháp").first()).toBeVisible()
  await expect(page.getByRole("list", { name: "Ngày khám" }).getByText("21/10/2026")).toBeVisible()
  await expect(page.getByText("Khám tổng quát").first()).toBeVisible()
  expect(backend.batches[0].services).toEqual([{ serviceId: expect.any(String), negotiatedPrice: 150000 }])

  await page.getByRole("button", { name: "Chỉnh sửa" }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByRole("checkbox", { name: "Khám tổng quát" })).toBeChecked()
  await expect(dialog.getByLabel(/Mã đợt khám/)).toHaveAttribute("readonly", "")
  await dialog.getByLabel(/Tên đợt khám/).fill("Khám định kỳ E2E (đã sửa)")
  await dialog.getByRole("button", { name: "Lưu thay đổi" }).click()
  await expect(page.getByRole("heading", { name: "Khám định kỳ E2E (đã sửa)" })).toBeVisible()
  expect(backend.batches[0].rowVersion).toBe(1)

  await page.getByRole("button", { name: "Xóa đợt khám" }).click()
  await page.getByRole("button", { name: "Xác nhận xóa" }).click()
  await expect(page).toHaveURL(new RegExp(`/organizations/${ORGANIZATION_ID}$`))
  await expect(page.getByText("Chưa có đợt khám nào cho đơn vị này")).toBeVisible()
  expect(backend.batches).toHaveLength(0)
  expect(backend.unexpected).toEqual([])
})

test("an update conflict keeps the form and only reloads when asked", async ({ page }) => {
  const backend = await mockBackend(page)
  const batch = backend.seedBatch({ batchName: "Đợt khám gốc" })
  await page.goto(`/organizations/${ORGANIZATION_ID}/health-examination-batches/${batch.id}`)

  await page.getByRole("button", { name: "Chỉnh sửa" }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByRole("checkbox", { name: "Khám tổng quát" })).toBeChecked()
  await dialog.getByLabel(/Tên đợt khám/).fill("Tên tôi vừa nhập")
  backend.conflictNextUpdate()
  await dialog.getByRole("button", { name: "Lưu thay đổi" }).click()

  await expect(dialog.getByText(/Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ/)).toBeVisible()
  await expect(dialog.getByLabel(/Tên đợt khám/)).toHaveValue("Tên tôi vừa nhập")
  expect(backend.requests.filter((request) => request.method === "PUT")).toHaveLength(1)

  await dialog.getByRole("button", { name: "Tải lại dữ liệu mới nhất" }).click()
  await expect(dialog.getByLabel(/Tên đợt khám/)).toHaveValue("Đợt khám gốc (đã sửa bởi người khác)")
  expect(backend.requests.filter((request) => request.method === "PUT")).toHaveLength(1)
})

test("a delete conflict explains why and offers a reload instead of resending", async ({ page }) => {
  const backend = await mockBackend(page)
  const batch = backend.seedBatch()
  await page.goto(`/organizations/${ORGANIZATION_ID}/health-examination-batches/${batch.id}`)

  backend.conflictNextDelete()
  await page.getByRole("button", { name: "Xóa đợt khám" }).click()
  await page.getByRole("button", { name: "Xác nhận xóa" }).click()
  await expect(page.getByRole("alert").filter({ hasText: "đã có người khám" })).toBeVisible()
  expect(backend.requests.filter((request) => request.method === "DELETE")).toHaveLength(1)

  await page.getByRole("button", { name: "Tải lại dữ liệu mới nhất" }).click()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Xóa đợt khám" })).toHaveCount(0)
  expect(backend.requests.filter((request) => request.method === "DELETE")).toHaveLength(1)
})

test("a missing batch shows a not-found state with a way back", async ({ page }) => {
  const backend = await mockBackend(page)
  await page.goto(`/organizations/${ORGANIZATION_ID}/health-examination-batches/does-not-exist`)
  await expect(page.getByText("Không tìm thấy đợt khám")).toBeVisible()
  await page.getByRole("link", { name: /Về danh sách đợt khám/ }).click()
  await expect(page).toHaveURL(new RegExp(`/organizations/${ORGANIZATION_ID}$`))
  expect(backend.unexpected).toEqual([])
})

test("a forbidden list shows a Vietnamese message, not the backend text", async ({ page }) => {
  const backend = await mockBackend(page)
  backend.failList(403)
  await page.goto(ORGANIZATION_URL)
  await expect(
    page.getByRole("alert").filter({ hasText: "Không được phép thực hiện thao tác này." })
  ).toBeVisible()
  await expect(page.getByText("Forbidden by test")).toHaveCount(0)
  backend.clearListFailure()
  await page.getByRole("button", { name: "Thử lại" }).click()
  await expect(page.getByText("Chưa có đợt khám nào cho đơn vị này")).toBeVisible()
})
