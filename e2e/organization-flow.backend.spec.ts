import { expect, test } from "@playwright/test"

/**
 * Real backend: Staff -> organization CRUD. It needs a running backend (profile `local`), Redis,
 * and a provisioned STAFF account; credentials come from the environment and are never committed.
 */
const username = process.env.E2E_STAFF_USERNAME
const password = process.env.E2E_STAFF_PASSWORD

test("create, find, edit and deactivate an organization on the real backend", async ({ page }) => {
  test.skip(!username || !password, "Requires E2E_STAFF_USERNAME/E2E_STAFF_PASSWORD and a running backend.")
  if (!username || !password) return

  const suffix = Date.now().toString(36).toUpperCase()
  const taxCode = Date.now().toString().slice(-10)
  const name = `Đơn vị E2E ${suffix}`

  await page.goto("/auth/login")
  await page.getByPlaceholder("Nhập tên đăng nhập").fill(username)
  await page.getByPlaceholder("Nhập mật khẩu").fill(password)
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click()
  await expect(page).toHaveURL(/\/organizations$/)

  await page.getByRole("button", { name: "Thêm đơn vị" }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel(/Tên đơn vị/).fill(name)
  await dialog.getByLabel(/Mã số thuế/).fill(taxCode)
  await dialog.getByLabel(/Điện thoại đơn vị/).fill("0900000001")
  await dialog.getByLabel(/Email đơn vị/).fill(`org-${suffix.toLowerCase()}@example.com`)
  await dialog.getByLabel(/Người liên hệ/).fill("Người liên hệ E2E")
  await dialog.getByLabel(/Điện thoại người liên hệ|^Số điện thoại/).fill("0900000002")
  await dialog.getByLabel(/Email người liên hệ/).fill(`contact-${suffix.toLowerCase()}@example.com`)
  await dialog.getByLabel(/Địa chỉ/).fill("1 Đường Kiểm Thử, Hà Nội")
  await dialog.getByRole("button", { name: "Tạo đơn vị" }).click()

  await page.getByPlaceholder(/Tìm theo tên đơn vị/).fill(name)
  await expect(page.getByText(name)).toBeVisible()
  await page.getByLabel(`Xem chi tiết cho ${name}`).click()
  await expect(page.getByRole("heading", { name })).toBeVisible()

  await page.getByRole("button", { name: "Chỉnh sửa đơn vị" }).click()
  await page.getByRole("dialog").getByLabel(/Tên đơn vị/).fill(`${name} (sửa)`)
  await page.getByRole("dialog").getByRole("button", { name: /Lưu|Cập nhật/ }).click()
  await expect(page.getByRole("heading", { name: `${name} (sửa)` })).toBeVisible()

  await page.getByRole("button", { name: "Ngừng hoạt động" }).click()
  await page.getByRole("button", { name: "Xác nhận ngừng hoạt động" }).click()
  await expect(page).toHaveURL(/\/organizations$/)
  await page.getByPlaceholder(/Tìm theo tên đơn vị/).fill(name)
  await expect(page.getByText(`${name} (sửa)`)).toHaveCount(0)
})
