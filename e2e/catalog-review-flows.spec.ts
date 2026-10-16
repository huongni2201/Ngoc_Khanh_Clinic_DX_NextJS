import { expect, test } from "@playwright/test"
import { staffSession } from "../src/modules/accesscontrol/__tests__/fixtures"

const base = "/api/v1/catalog/management/"
const id = "11111111-1111-4111-8111-111111111112"
const departmentId = "11111111-1111-4111-8111-111111111113"
const specialtyId = "11111111-1111-4111-8111-111111111114"
const cors = { "access-control-allow-origin": "http://localhost:3000", "access-control-allow-credentials": "true" }
const permissions = ["DEPARTMENT", "ROOM", "SPECIALTY", "SERVICE", "MEDICINE"]
  .flatMap(r => ["VIEW", "DETAIL_VIEW", "CREATE", "UPDATE", "DEACTIVATE", "REACTIVATE"].map(a => `CATALOG_${r}_${a}`))
const cases = [
  { resource: "departments", label: "khoa", nameLabel: "Tên khoa", extra: { departmentType: "CLINICAL" } },
  { resource: "rooms", label: "phòng", nameLabel: "Tên phòng", extra: { departmentId, departmentName: "Khoa nền", roomType: "Khám bệnh" } },
  { resource: "specialties", label: "chuyên khoa", nameLabel: "Tên chuyên khoa", extra: {} },
  { resource: "services", label: "dịch vụ", nameLabel: "Tên dịch vụ", extra: {
    performingDepartmentId: departmentId, performingDepartmentName: "Khoa nền", serviceType: "CONSULTATION",
    specialtyId: null, specialtyName: null, unitPrice: 150000.5, preparationInstruction: "Hướng dẫn kiểm thử" } },
  { resource: "medicines", label: "thuốc", nameLabel: "Tên hoạt chất", extra: {
    genericName: "", brandName: null, strength: "500mg", dosageForm: "Viên nén", unit: "Viên" } },
] as const

for (const item of cases) test(`${item.resource}: list/create/detail/update/deactivate/reactivate through the existing UI`, async ({ page }) => {
  let row: Record<string, unknown> | undefined
  const writes: { method: string; path: string; version?: number }[] = []
  await page.addInitScript(() => localStorage.setItem("nkc-session-present", "1"))
  await page.route("http://localhost:8080/api/**", async route => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname, method = req.method()
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers: { ...cors,
      "access-control-allow-headers": "content-type", "access-control-allow-methods": "GET,POST,PUT,DELETE" } })
    let status = 200, data: unknown = { items: [], page: 1, size: 10, totalElements: 0, totalPages: 0 }
    if (path.endsWith("/auth/me")) data = { ...staffSession, idleExpiresAt: "2099-01-01T12:00:00Z", absoluteExpiresAt: "2099-01-01T20:00:00Z",
      roleAssignments: [{ ...staffSession.roleAssignments[0], roleCode: "CLINIC_MANAGER", permissions }] }
    if (path === base + item.resource && method === "POST") {
      const body = req.postDataJSON()
      const created: Record<string, unknown> = { id, code: "TEST01", name: "Kiểm thử", ...item.extra, ...body, active: true, rowVersion: 0, createdAt: "2026-10-15T09:00:00Z", updatedAt: "2026-10-15T09:00:00Z" }
      if (item.resource === "services") created.unitPrice = Number(created.unitPrice)
      row = created; data = created; status = 201; writes.push({ method, path })
    } else if (path.startsWith(base + item.resource + "/") && method !== "GET") {
      const version = method === "DELETE" ? Number(url.searchParams.get("rowVersion")) : req.postDataJSON().rowVersion
      writes.push({ method, path, version })
      if (version !== row?.rowVersion) { status = 409; data = null }
      else if (method === "DELETE") { row = { ...row, active: false, rowVersion: version + 1 }; status = 204 }
      else {
        const updated: Record<string, unknown> = { ...row, ...(method === "PUT" ? req.postDataJSON() : { active: true }), rowVersion: version + 1 }
        if (item.resource === "services") updated.unitPrice = Number(updated.unitPrice)
        row = updated; data = updated
      }
    } else if (path.startsWith(base)) {
      if (path === base + item.resource) data = { items: row ? [row] : [], page: 1, size: 10, totalElements: row ? 1 : 0, totalPages: row ? 1 : 0 }
      else if (path === base + item.resource + "/" + id) data = row
      else if (path === base + "departments") data = { items: [{ id: departmentId, code: "D0", name: "Khoa nền", departmentType: "CLINICAL", active: true, rowVersion: 0, createdAt: null, updatedAt: null }], page: 1, size: 10, totalElements: 1, totalPages: 1 }
      else if (path === base + "specialties") data = { items: [{ id: specialtyId, code: "SP0", name: "Chuyên khoa nền", active: true, rowVersion: 0, createdAt: null, updatedAt: null }], page: 1, size: 10, totalElements: 1, totalPages: 1 }
    }
    await route.fulfill({ status, headers: cors, ...(status === 204 ? {} : { contentType: "application/json", body: JSON.stringify({ result: status < 400 ? "OK" : "NG", code: status, data }) }) })
  })
  await page.goto(`/admin/catalog/${item.resource}`)
  await page.getByRole("button", { name: `Thêm ${item.label}`, exact: true }).first().click()
  await page.getByLabel(new RegExp(`^Mã ${item.label}`)).fill("TEST01")
  await page.getByLabel(new RegExp(`^${item.nameLabel}`)).fill("Kiểm thử")
  if (item.resource === "departments" || item.resource === "services") {
    await page.getByRole("combobox", { name: item.resource === "departments" ? /^Loại khoa/ : /^Loại dịch vụ/ }).click()
    await page.getByRole("option", { name: item.resource === "departments" ? "Lâm sàng" : "Khám", exact: true }).click()
  }
  if (item.resource === "rooms" || item.resource === "services") {
    await page.getByRole("button", { name: item.resource === "rooms" ? "Khoa" : "Khoa thực hiện", exact: true }).click()
    await page.getByRole("button", { name: "Chọn Khoa nền", exact: true }).click()
  }
  if (item.resource === "rooms") await page.getByRole("dialog").getByLabel(/^Loại phòng/).fill("Khám bệnh")
  if (item.resource === "services") {
    await page.getByLabel(/^Đơn giá/).fill("150000,50")
    await page.getByLabel(/^Hướng dẫn chuẩn bị/).fill("Hướng dẫn kiểm thử")
  }
  if (item.resource === "medicines") {
    await page.getByLabel(/^Hàm lượng/).fill("500mg")
    await page.getByRole("dialog").getByLabel(/^Dạng bào chế/).fill("Viên nén")
    await page.getByLabel(/^Đơn vị tính/).fill("Viên")
  }
  const dialog = page.getByRole("dialog").filter({ has: page.getByRole("button", { name: `Thêm ${item.label}`, exact: true }) })
  await dialog.getByRole("button", { name: `Thêm ${item.label}`, exact: true }).click()
  await expect(page.getByRole("cell", { name: "Kiểm thử", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Xem Kiểm thử", exact: true }).click()
  await expect(page.getByRole("dialog", { name: "Kiểm thử", exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Sửa Kiểm thử", exact: true }).click()
  await page.getByLabel(new RegExp(`^${item.nameLabel}`)).fill("Đã cập nhật")
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click()
  await expect(page.getByRole("cell", { name: "Đã cập nhật", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Ngừng Đã cập nhật", exact: true }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Ngừng sử dụng", exact: true }).click()
  await expect(page.getByRole("button", { name: "Bật lại Đã cập nhật", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Bật lại Đã cập nhật", exact: true }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Bật lại", exact: true }).click()
  await expect(page.getByRole("button", { name: "Ngừng Đã cập nhật", exact: true })).toBeVisible()
  expect(writes.map(w => [w.method, w.version])).toEqual([["POST", undefined], ["PUT", 0], ["DELETE", 1], ["POST", 2]])
  expect(row?.active).toBe(true)
})
