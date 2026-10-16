import { expect, test, type Page } from "@playwright/test"
import { staffSession } from "../src/modules/accesscontrol/__tests__/fixtures"

const cors = { "access-control-allow-origin": "http://localhost:3000", "access-control-allow-credentials": "true" }
const viewPermissions = ["DEPARTMENT", "ROOM", "SPECIALTY", "SERVICE", "MEDICINE"]
  .map((name) => `CATALOG_${name}_VIEW`)

async function mockRole(page: Page, roleCode: string, permissions = [...viewPermissions, "CATALOG_SERVICE_DETAIL_VIEW"]) {
  const catalogRequests: string[] = []
  const service = {
    id: "11111111-1111-4111-8111-111111111112", code: "KHAM-NOI", name: "Khám nội tổng quát",
    serviceType: "CONSULTATION", performingDepartmentId: "11111111-1111-4111-8111-111111111113",
    performingDepartmentName: "Khoa khám", specialtyId: null, specialtyName: null,
    unitPrice: 150000.5, active: true, rowVersion: 0, createdAt: null, updatedAt: null,
    departmentType: "CLINICAL", departmentId: "11111111-1111-4111-8111-111111111113",
    departmentName: "Khoa khám", roomType: "EXAMINATION", genericName: "Thuốc kiểm thử",
    brandName: null, strength: "500mg", dosageForm: "TABLET", unit: "Viên",
  }
  await page.addInitScript(() => localStorage.setItem("nkc-session-present", "1"))
  await page.route("http://localhost:8080/api/**", async (route) => {
    const request = route.request(), path = new URL(request.url()).pathname
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: {
      ...cors, "access-control-allow-headers": "content-type", "access-control-allow-methods": "GET,POST,PUT,DELETE",
    } })
    let data: unknown = { items: [], page: 1, size: 10, totalElements: 0, totalPages: 0 }
    if (path === "/api/v1/auth/me") data = { ...staffSession,
      idleExpiresAt: "2099-01-01T12:00:00Z", absoluteExpiresAt: "2099-01-01T20:00:00Z",
      roleAssignments: [{ ...staffSession.roleAssignments[0], roleCode,
        permissions }] }
    if (path.startsWith("/api/v1/catalog/management")) {
      catalogRequests.push(path)
      data = path.endsWith(service.id) ? { ...service, preparationInstruction: "Mang theo hồ sơ khám trước đây" }
        : { items: [{ ...service, active: new URL(request.url()).searchParams.get("active") !== "false" }], page: 1, size: 10, totalElements: 1, totalPages: 1 }
    }
    await route.fulfill({ status: 200, headers: cors, contentType: "application/json",
      body: JSON.stringify({ result: "OK", code: 200, data }) })
  })
  return catalogRequests
}

test("clinic manager sees all catalog links and service details in the existing shell", async ({ page }) => {
  await mockRole(page, "CLINIC_MANAGER")
  await page.goto("/admin/catalog/services")
  const navigation = page.getByRole("navigation", { name: "Điều hướng chính" })
  for (const name of ["Khoa", "Phòng", "Chuyên khoa", "Dịch vụ", "Thuốc"]) {
    await expect(navigation.getByRole("link", { name, exact: true })).toBeVisible()
  }
  await expect(page.getByText("Khám nội tổng quát", { exact: true })).toBeVisible()
  await expect(page.getByRole("navigation", { name: "Phân trang" })).toHaveCount(0)
  await page.getByRole("button", { name: "Xem Khám nội tổng quát", exact: true }).click()
  await expect(page.getByText("Mang theo hồ sơ khám trước đây")).toBeVisible()
})

test("administrator cannot enter the clinic manager catalog by typing its URL", async ({ page }) => {
  const requests = await mockRole(page, "ADMINISTRATOR")
  await page.goto("/admin/catalog/services")
  await expect(page.getByText("Bạn không có quyền truy cập mục này")).toBeVisible()
  await expect(page.getByText("Quản lý danh mục", { exact: true })).toHaveCount(0)
  expect(requests).toEqual([])
})

test("TEST sees all five catalogs and every granted catalog action", async ({ page }) => {
  test.setTimeout(120_000)
  const permissions = ["DEPARTMENT", "ROOM", "SPECIALTY", "SERVICE", "MEDICINE"].flatMap((name) =>
    ["VIEW", "DETAIL_VIEW", "CREATE", "UPDATE", "DEACTIVATE", "REACTIVATE"].map((action) => `CATALOG_${name}_${action}`),
  )
  const requests = await mockRole(page, "TEST", permissions)
  await page.goto("/admin/catalog")
  await expect(page).toHaveURL(/\/admin\/catalog\/departments$/)
  const navigation = page.getByRole("navigation", { name: "Điều hướng chính" })
  for (const name of ["Khoa", "Phòng", "Chuyên khoa", "Dịch vụ", "Thuốc"]) {
    await expect(navigation.getByRole("link", { name, exact: true })).toBeVisible()
  }
  for (const category of ["departments", "rooms", "specialties", "services", "medicines"]) {
    await page.goto(`/admin/catalog/${category}`)
    await expect(page.getByRole("button", { name: /^Thêm / }).first()).toBeVisible()
    await expect(page.getByRole("button", { name: /^Xem / }).first()).toBeVisible()
    await expect(page.getByRole("button", { name: /^Sửa / }).first()).toBeEnabled()
    await expect(page.getByRole("button", { name: /^Ngừng / }).first()).toBeVisible()
    await page.goto(`/admin/catalog/${category}?active=false`)
    await expect(page.getByRole("button", { name: /^Bật lại / }).first()).toBeVisible()
    expect(requests).toContain(`/api/v1/catalog/management/${category}`)
  }
})

test("TEST without a catalog permission is denied without issuing catalog requests", async ({ page }) => {
  const requests = await mockRole(page, "TEST", [])
  await page.goto("/admin/catalog/services")
  await expect(page.getByText("Bạn không có quyền xem danh mục này")).toBeVisible()
  await expect(page.getByText("Quản lý danh mục", { exact: true })).toHaveCount(0)
  expect(requests).toEqual([])
})
