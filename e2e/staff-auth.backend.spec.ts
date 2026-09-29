import { test, expect } from "@playwright/test"

test("real backend cookie and CSRF smoke test", async ({ page, context }) => {
  const username = process.env.E2E_STAFF_USERNAME
  const password = process.env.E2E_STAFF_PASSWORD
  test.skip(!username || !password, "Requires a provisioned staff test account and running backend/Redis.")
  if (!username || !password) return
  await page.goto("/auth/login")
  await page.getByPlaceholder("Nhập tên đăng nhập").fill(username)
  await page.getByPlaceholder("Nhập mật khẩu").fill(password)
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click()
  await expect(page).toHaveURL(/\/organizations$/)
  const cookie = (await context.cookies()).find((item) => item.name === "NKC_SESSION")
  expect(Boolean(cookie?.httpOnly && cookie.sameSite === "Lax")).toBe(true)
  await page.reload()
  await expect(page.getByText(username, { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Tài khoản" }).click()
  await page.getByRole("menuitem", { name: "Đăng xuất" }).click()
  await expect(page).toHaveURL(/\/auth\/login$/)
  await page.goto("/organizations")
  await expect(page).toHaveURL(/\/auth\/login$/)
})
