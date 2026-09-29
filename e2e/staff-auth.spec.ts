import { test, expect, type Page } from "@playwright/test"
import { staffSession } from "../src/modules/auth/__tests__/fixtures"

const api = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

async function mockAuth(page: Page, loginStatus = 200, logoutStatus = 204) {
  let authenticated = false
  await page.route(api + "/api/v1/auth/**", async (route) => {
    const endpoint = new URL(route.request().url()).pathname
    const headers = {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, X-XSRF-TOKEN",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    }
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers })
    let status = 200
    let data: unknown = staffSession
    if (endpoint.endsWith("/csrf")) data = { token: "masked-test-token", headerName: "X-XSRF-TOKEN" }
    else if (endpoint.endsWith("/login")) {
      expect(route.request().headers()["x-xsrf-token"]).toBe("masked-test-token")
      expect(route.request().postDataJSON()).toEqual({ username: "staff.test", password: "test-password" })
      status = loginStatus
      authenticated = status === 200
    } else if (endpoint.endsWith("/logout")) {
      expect(route.request().headers()["x-xsrf-token"]).toBe("masked-test-token")
      status = logoutStatus
      if (status === 204) authenticated = false
    } else if (!authenticated) status = 401
    await route.fulfill({ status, headers, contentType: "application/json",
      body: status === 204 ? undefined : JSON.stringify({ result: status === 200 ? "OK" : "NG", code: status, message: "Test response", data }) })
  })
}

async function login(page: Page) {
  await page.goto("/auth/login")
  await page.getByPlaceholder("Nhập tên đăng nhập").fill("staff.test")
  await page.getByPlaceholder("Nhập mật khẩu").fill("test-password")
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click()
}

test("login, reload, logout and protect the previous page", async ({ page }) => {
  await mockAuth(page)
  await login(page)
  await expect(page).toHaveURL(/\/organizations$/)
  await expect(page.getByText("staff.test", { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText("staff.test", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Tài khoản" }).click()
  await page.getByRole("menuitem", { name: "Đăng xuất" }).click()
  await expect(page).toHaveURL(/\/auth\/login$/)
  await page.goto("/organizations")
  await expect(page).toHaveURL(/\/auth\/login$/)
  expect(await page.evaluate(() => localStorage.getItem("nk_auth_token"))).toBeNull()
})

test("invalid credentials remain on the login page", async ({ page }) => {
  await mockAuth(page, 401)
  await login(page)
  await expect(page.getByText("Tên đăng nhập hoặc mật khẩu không chính xác.")).toBeVisible()
  await expect(page).toHaveURL(/\/auth\/login$/)
})

test("failed logout does not claim the session was revoked", async ({ page }) => {
  await mockAuth(page, 200, 503)
  await login(page)
  await page.getByRole("button", { name: "Tài khoản" }).click()
  await page.getByRole("menuitem", { name: "Đăng xuất" }).click()
  await expect(page.getByRole("alert")).toBeVisible()
  await expect(page).toHaveURL(/\/organizations$/)
})
