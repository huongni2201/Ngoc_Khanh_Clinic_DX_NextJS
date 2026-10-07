import { expect, test } from "@playwright/test"
import { staffSession } from "../src/modules/auth/__tests__/fixtures"

const API = "http://localhost:8080"
const CORS = { "access-control-allow-origin": "http://localhost:3000", "access-control-allow-credentials": "true" }

test("fresh visitors reach login without /me even when the backend is offline", async ({ page }) => {
  const requests: string[] = []
  await page.route(`${API}/api/**`, async (route) => {
    requests.push(new URL(route.request().url()).pathname)
    await route.abort("connectionrefused")
  })
  await page.goto("/organizations")
  await expect(page).toHaveURL(/\/auth\/login$/)
  await expect(page.getByRole("button", { name: "Đăng nhập", exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole("button", { name: "Đăng nhập", exact: true })).toBeVisible()
  expect(requests).toEqual([])
})

test("login posts directly, navigation reuses its response and reload restores the cookie session", async ({ page }) => {
  const authRequests: string[] = []
  // Next dev StrictMode may cancel a mount probe; count completed exchanges.
  page.on("requestfinished", (request) => {
    const path = new URL(request.url()).pathname
    if (path.startsWith("/api/v1/auth/") && request.method() !== "OPTIONS") authRequests.push(path)
  })
  await page.route(`${API}/api/**`, async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: { ...CORS, "access-control-allow-headers": "content-type", "access-control-allow-methods": "GET,POST" } })
    }
    let data: unknown = { items: [], page: 1, size: 10, totalElements: 0, totalPages: 0 }
    if (path.startsWith("/api/v1/auth/")) {
      expect(["/api/v1/auth/login", "/api/v1/auth/me"]).toContain(path)
      data = staffSession
    }
    if (path === "/api/v1/auth/login") {
      expect(request.postDataJSON()).toEqual({ username: " staff.test ", password: "secret" })
      expect(request.headers().origin).toBe("http://localhost:3000")
    }
    if (path === "/api/v1/auth/me") expect(request.headers().cookie).toContain("NKC_SESSION=")
    await route.fulfill({
      status: 200,
      headers: { ...CORS, ...(path === "/api/v1/auth/login" ? { "set-cookie": "NKC_SESSION=e2e-session; HttpOnly; SameSite=Lax; Path=/" } : {}) },
      contentType: "application/json",
      body: JSON.stringify({ result: "OK", code: 200, message: "Success", data }),
    })
  })
  await page.goto("/auth/login")
  await page.getByLabel("Tên đăng nhập").fill(" staff.test ")
  await page.getByPlaceholder("Nhập mật khẩu").fill("secret")
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click()
  await expect(page).toHaveURL(/\/organizations$/)
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeVisible()
  expect(authRequests).toEqual(["/api/v1/auth/login"])
  expect(await page.evaluate(() => localStorage.getItem("nkc-session-present"))).toBe("1")
  expect(await page.evaluate(() => document.cookie)).not.toContain("NKC_SESSION")
  await page.reload()
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeVisible()
  expect(authRequests).toEqual(["/api/v1/auth/login", "/api/v1/auth/me"])
})

test("a stale restore hint cannot authorize a visitor and is cleared on 401", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("nkc-session-present", "1"))
  const requests: string[] = []
  page.on("requestfinished", (request) => {
    if (request.url().startsWith(`${API}/api/`)) requests.push(new URL(request.url()).pathname)
  })
  await page.route(`${API}/api/**`, async (route) => {
    await route.fulfill({ status: 401, headers: CORS, contentType: "application/json", body: JSON.stringify({ result: "NG", code: 401, message: "Authentication required" }) })
  })
  await page.goto("/organizations")
  await expect(page).toHaveURL(/\/auth\/login$/)
  await expect(page.getByRole("button", { name: "Đăng nhập", exact: true })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem("nkc-session-present"))).toBeNull()
  expect(requests).toEqual(["/api/v1/auth/me"])
})
