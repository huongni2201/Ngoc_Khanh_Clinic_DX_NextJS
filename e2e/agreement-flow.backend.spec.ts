import { expect, test } from "@playwright/test"

/**
 * Real backend: Staff -> organization -> health examination agreement (create, view, edit, delete),
 * using the services seeded by the `local` profile (db/local). Credentials come from the
 * environment and are never committed.
 */
const username = process.env.E2E_STAFF_USERNAME
const password = process.env.E2E_STAFF_PASSWORD

test("organization to agreement chain works on the real backend", async ({ page }) => {
  test.skip(!username || !password, "Requires E2E_STAFF_USERNAME/E2E_STAFF_PASSWORD, a running backend and the local catalog seed.")
  if (!username || !password) return

  const suffix = Date.now().toString(36).toUpperCase()
  const orgName = `Đơn vị thỏa thuận ${suffix}`
  const taxCode = Date.now().toString().slice(-10)
  const agreementName = `Thỏa thuận ${suffix}`

  await page.goto("/auth/login")
  await page.getByPlaceholder("Nhập tên đăng nhập").fill(username)
  await page.getByPlaceholder("Nhập mật khẩu").fill(password)
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click()
  await expect(page).toHaveURL(/\/organizations$/)

  await page.getByRole("button", { name: "Thêm đơn vị" }).click()
  const orgDialog = page.getByRole("dialog")
  await orgDialog.getByLabel(/Tên đơn vị/).fill(orgName)
  await orgDialog.getByLabel(/Mã số thuế/).fill(taxCode)
  await orgDialog.getByLabel(/Thư điện tử đơn vị/).fill(`org-${suffix.toLowerCase()}@example.com`)
  await orgDialog.getByLabel(/Người liên hệ/).fill("Người liên hệ E2E")
  await orgDialog.getByLabel(/Điện thoại người liên hệ|^Số điện thoại/).fill("0900000002")
  await orgDialog.getByLabel(/Thư điện tử người liên hệ/).fill(`contact-${suffix.toLowerCase()}@example.com`)
  await orgDialog.getByLabel(/Địa chỉ/).fill("1 Đường Kiểm Thử, Hà Nội")
  await orgDialog.getByRole("button", { name: "Tạo đơn vị" }).click()

  await page.getByPlaceholder(/Tìm theo tên đơn vị/).fill(orgName)
  await page.getByLabel(`Xem chi tiết cho ${orgName}`).click()
  await page.getByRole("button", { name: "Thỏa thuận" }).click()
  await expect(page.getByText("Chưa có thỏa thuận nào cho đơn vị này")).toBeVisible()

  await page.getByRole("button", { name: "Tạo thỏa thuận" }).first().click()
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByRole("checkbox", { name: "Khám tổng quát" })).toBeVisible()
  await expect(dialog.getByLabel(/Mã thỏa thuận/)).toHaveCount(0)
  await dialog.getByLabel(/Tên thỏa thuận/).fill(agreementName)
  await dialog.getByLabel(/^Ngày khám/).fill("2026-12-15")
  await dialog.getByRole("button", { name: "Thêm ngày" }).click()
  await dialog.getByLabel(/Loại địa điểm/).selectOption("CLINIC")
  await dialog.getByRole("checkbox", { name: "Khám tổng quát" }).check()
  await dialog.getByRole("button", { name: "Tạo thỏa thuận" }).click()

  await expect(page.getByRole("heading", { name: agreementName })).toBeVisible()
  await expect(page.getByText("Nháp").first()).toBeVisible()
  await expect(page.getByText("Khám tổng quát").first()).toBeVisible()

  await page.getByRole("button", { name: "Chỉnh sửa" }).click()
  await page.getByRole("dialog").getByLabel(/Tên thỏa thuận/).fill(`${agreementName} (sửa)`)
  await page.getByRole("dialog").getByRole("button", { name: "Lưu thay đổi" }).click()
  await expect(page.getByRole("heading", { name: `${agreementName} (sửa)` })).toBeVisible()

  await page.getByRole("button", { name: "Xóa thỏa thuận" }).click()
  await page.getByRole("button", { name: "Xác nhận xóa" }).click()
  await expect(page).toHaveURL(/\/organizations\/[^/?]+$/)
  await expect(page.getByText("Chưa có thỏa thuận nào cho đơn vị này")).toBeVisible()
})
