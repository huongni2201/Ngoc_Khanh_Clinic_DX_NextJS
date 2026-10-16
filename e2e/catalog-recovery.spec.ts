import { expect, test, type Page } from "@playwright/test"
import { staffSession } from "../src/modules/accesscontrol/__tests__/fixtures"

const permissions = ["DEPARTMENT", "ROOM", "SPECIALTY", "SERVICE", "MEDICINE"]
  .flatMap(r => ["VIEW", "DETAIL_VIEW", "CREATE", "UPDATE", "DEACTIVATE", "REACTIVATE"].map(a => `CATALOG_${r}_${a}`))
const depId = "11111111-1111-4111-8111-111111111112"
const inactiveId = "11111111-1111-4111-8111-111111111113"
const dept = { id: depId, code: "D1", name: "Khoa thử nghiệm", departmentType: "CLINICAL", active: true, rowVersion: 2, createdAt: null, updatedAt: null }
const headers = { "access-control-allow-origin": "http://localhost:3000", "access-control-allow-credentials": "true" }
const base = "/api/v1/catalog/management/"

async function arrange(page: Page, failure?: number, manyParents = false) {
  let currentDept = { ...dept }
  const requests: { method: string; path: string; query: string; body: unknown }[] = []
  await page.addInitScript(() => localStorage.setItem("nkc-session-present", "1"))
  await page.route("http://localhost:8080/api/**", async route => {
    const req = route.request(), url = new URL(req.url()), method = req.method()
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers: { ...headers, "access-control-allow-headers": "content-type", "access-control-allow-methods": "GET,POST,PUT,DELETE" } })
    requests.push({ method, path: url.pathname, query: url.search, body: req.postData() ? req.postDataJSON() : null })
    let data: unknown = { items: [], page: 1, size: 10, totalElements: 0, totalPages: 0 }, status = 200
    if (url.pathname.endsWith("/auth/me")) data = { ...staffSession,
      idleExpiresAt: "2099-01-01T12:00:00Z", absoluteExpiresAt: "2099-01-01T20:00:00Z",
      roleAssignments: [{ ...staffSession.roleAssignments[0], roleCode: "CLINIC_MANAGER", permissions }] }
    if (url.pathname === base + "departments") {
      const pageNumber = Number(url.searchParams.get("page") ?? 1)
      const items = manyParents ? (pageNumber === 1 ? Array.from({ length: 10 }, (_, n) => ({ ...dept, id: `${depId.slice(0,-2)}${String(n).padStart(2,"0")}`, code: `D${n}`, name: `Khoa ${n}` }))
        : [{ ...dept, id: inactiveId, name: "Khoa đã ngừng", active: false }]) : [currentDept]
      data = { items, page: pageNumber, size: 10, totalElements: manyParents ? 11 : 1, totalPages: manyParents ? 2 : 1 }
    }
    if (url.pathname === base + "departments/" + depId) data = currentDept
    if (url.pathname === base + "departments/" + inactiveId) data = { ...dept, id: inactiveId, name: "Khoa đã ngừng", active: false }
    if (url.pathname.startsWith(base) && method !== "GET") {
      status = failure ?? 200; data = null
      if (failure === 409) {
        const version = method === "DELETE" ? Number(url.searchParams.get("rowVersion")) : req.postDataJSON().rowVersion
        if (version === 3) {
          if (method === "DELETE") { currentDept = { ...currentDept, active: false, rowVersion: 4 }; status = 204 }
          else { currentDept = { ...currentDept, ...req.postDataJSON(), rowVersion: 4 }; status = 200; data = currentDept }
        } else currentDept = { ...currentDept, name: "Khoa máy chủ", rowVersion: 3 }
      }
    }
    if (status === 204) return route.fulfill({ status, headers })
    await route.fulfill({ status, headers, contentType: "application/json",
      body: JSON.stringify({ result: status >= 400 ? "NG" : "OK", code: status, data,
        ...(status === 401 ? { message: "Authentication required" } : {}) }) })
  })
  return requests
}

test("restores Vietnamese filter labels immediately from the URL", async ({ page }) => {
  await arrange(page)
  await page.goto("/admin/catalog/services?active=false&serviceType=CONSULTATION")
  await expect(page.getByRole("combobox", { name: "Trạng thái", exact: true })).toHaveText("Ngừng sử dụng")
  await expect(page.getByRole("combobox", { name: "Loại dịch vụ", exact: true })).toHaveText("Khám")
  await expect(page.getByRole("button", { name: "Lọc theo khoa", exact: true })).toHaveText("Tất cả khoa")
})

test("filters historical data using inactive parents beyond the first page", async ({ page }) => {
  const requests = await arrange(page, undefined, true)
  await page.goto("/admin/catalog/services")
  await page.getByRole("button", { name: "Lọc theo khoa", exact: true }).click()
  const picker = page.getByRole("dialog", { name: "Lọc theo khoa", exact: true })
  await picker.getByRole("button", { name: "Trang 2", exact: true }).click()
  await picker.getByRole("button", { name: "Chọn Khoa đã ngừng", exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`departmentId=${inactiveId}`))
  await expect(page.getByRole("button", { name: "Lọc theo khoa", exact: true })).toHaveText("Khoa đã ngừng")
  const calls = requests.filter(r => r.path === base + "departments")
  expect(calls.some(r => new URLSearchParams(r.query).get("page") === "2")).toBe(true)
  expect(calls.every(r => !new URLSearchParams(r.query).has("active"))).toBe(true)
})

test("selects a required reference with Enter and returns focus to its trigger", async ({ page }) => {
  await arrange(page)
  await page.goto("/admin/catalog/rooms")
  await page.getByRole("button", { name: "Thêm phòng", exact: true }).first().click()
  await page.getByRole("button", { name: "Khoa", exact: true }).click()
  const picker = page.getByRole("dialog", { name: "Chọn khoa", exact: true })
  const choice = picker.getByRole("button", { name: `Chọn ${dept.name}`, exact: true })
  await choice.focus()
  await page.keyboard.press("Enter")
  await expect(picker).not.toBeVisible()
  const trigger = page.getByRole("button", { name: "Khoa", exact: true })
  await expect(trigger).toHaveText(dept.name)
  await expect(trigger).toBeFocused()
})

test("preserves the draft after 409 until explicitly reloading the new server version", async ({ page }) => {
  const requests = await arrange(page, 409)
  await page.goto("/admin/catalog/departments")
  await page.getByRole("button", { name: `Sửa ${dept.name}`, exact: true }).click()
  await page.getByRole("dialog").getByLabel(/^Tên khoa/).fill("Bản nháp của tôi")
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click()
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("Tải lại sẽ bỏ bản nháp")
  await expect(page.getByRole("dialog").getByLabel(/^Tên khoa/)).toHaveValue("Bản nháp của tôi")
  expect(requests.filter(r => r.method === "PUT")).toHaveLength(1)
  await page.getByRole("button", { name: "Bỏ bản nháp và tải lại", exact: true }).click()
  await expect(page.getByRole("dialog").getByLabel(/^Tên khoa/)).toHaveValue("Khoa máy chủ")
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click()
  await expect(page.getByRole("dialog")).not.toBeVisible()
  expect(requests.filter(r => r.method === "PUT").map(r => (r.body as { rowVersion: number }).rowVersion)).toEqual([2, 3])
})

test("expires the cached session when a catalog write returns 401", async ({ page }) => {
  await arrange(page, 401)
  await page.goto("/admin/catalog/departments")
  await page.getByRole("button", { name: `Sửa ${dept.name}`, exact: true }).click()
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click()
  await expect(page).toHaveURL(/\/auth\/login/)
  await expect(page.getByRole("cell", { name: dept.name, exact: true })).toHaveCount(0)
})

test("reloads a status conflict before confirming again with the latest version", async ({ page }) => {
  const requests = await arrange(page, 409)
  await page.goto("/admin/catalog/departments")
  await page.getByRole("button", { name: `Ngừng ${dept.name}`, exact: true }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Ngừng sử dụng", exact: true }).click()
  await expect(page.getByRole("button", { name: "Tải dữ liệu mới", exact: true })).toBeVisible()
  expect(requests.filter(r => r.method === "DELETE")).toHaveLength(1)
  await page.getByRole("button", { name: "Tải dữ liệu mới", exact: true }).click()
  await expect(page.getByRole("button", { name: "Tải dữ liệu mới", exact: true })).toHaveCount(0)
  await page.getByRole("dialog").getByRole("button", { name: "Ngừng sử dụng", exact: true }).click()
  await expect(page.getByRole("button", { name: "Bật lại Khoa máy chủ", exact: true })).toBeVisible()
  expect(requests.filter(r => r.method === "DELETE").map(r => new URLSearchParams(r.query).get("rowVersion"))).toEqual(["2", "3"])
})

test("keeps the signed-in workspace on a forbidden write", async ({ page }) => {
  await arrange(page, 403)
  await page.goto("/admin/catalog/departments")
  await page.getByRole("button", { name: `Sửa ${dept.name}`, exact: true }).click()
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click()
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("không có quyền")
  await expect(page).toHaveURL(/\/admin\/catalog\/departments/)
})
