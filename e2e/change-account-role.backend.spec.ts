import { randomUUID } from "node:crypto"
import { expect, test, type APIRequestContext, type Page } from "@playwright/test"
import { staffMemberResponseSchema } from "../src/modules/accesscontrol/types/staff-member-transport"

// Real HTTP, cookies, PostgreSQL and Redis. Only newly created synthetic staff/roles are changed.
// The API has no staff deletion route; fixtures remain identifiable by this name/description.
const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
const ORIGIN = "http://localhost:3000"
const credentials = {
  username: process.env.E2E_STAFF_USERNAME,
  password: process.env.E2E_STAFF_PASSWORD,
}
const headers = { Origin: ORIGIN }

test.use({ screenshot: "only-on-failure" })

test.beforeEach(async ({ page }) => {
  test.skip(!credentials.username || !credentials.password, "Requires E2E_STAFF_USERNAME/E2E_STAFF_PASSWORD and a running backend.")
  await signIn(page, credentials.username!, credentials.password!)
})

async function signIn(page: Page, username: string, password: string) {
  const document = await page.goto("/auth/login")
  expect(document?.status()).toBe(200)
  await page.getByPlaceholder("Nhập tên đăng nhập").fill(username)
  await page.getByPlaceholder("Nhập mật khẩu").fill(password)
  const response = page.waitForResponse((response) => response.url() === `${API}/api/v1/auth/login`)
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click()
  expect((await response).status()).toBe(200)
  await expect(page).toHaveURL(/\/organizations$/)
}

async function createStaff(api: APIRequestContext, roleCode = "RECEPTIONIST") {
  // The backend accepts letters in names, so map the random hex digits to letters.
  const suffix = randomUUID().replaceAll("-", "").replace(/[0-9]/g, (digit) => String.fromCharCode(103 + Number(digit)))
  const password = randomUUID()
  const response = await api.post(`${API}/api/v1/staff-members`, {
    headers,
    data: { fullName: `Kiểm Thử Vai Trò ${suffix}`, initialPassword: password, roleCode },
  })
  expect(response.status()).toBe(201)
  const member = staffMemberResponseSchema.parse((await response.json()).data)
  if (!member.account) throw new Error("The created staff member must have an account")
  return { ...member, account: member.account, password }
}

async function createRole(api: APIRequestContext) {
  const suffix = randomUUID().replaceAll("-", "").toUpperCase()
  const response = await api.post(`${API}/api/v1/admin/roles`, {
    headers,
    data: { code: `E2E_ROLE_${suffix}`, name: `Vai trò E2E ${suffix}`, description: "Synthetic change-account-role E2E fixture" },
  })
  expect(response.status()).toBe(201)
  return (await response.json()).data as { id: string; code: string; name: string; rowVersion: number }
}

async function showStaff(page: Page, fullName: string) {
  await page.goto(`/staff-members?q=${encodeURIComponent(fullName)}`)
  const row = page.getByRole("row").filter({ hasText: fullName })
  await expect(row).toBeVisible()
  return row
}

async function openChangeRole(page: Page, fullName: string) {
  await page.getByRole("button", { name: `Đổi vai trò của ${fullName}`, exact: true }).click()
  const sheet = page.getByRole("dialog", { name: "Đổi vai trò", exact: true })
  await expect(sheet).toBeVisible()
  return sheet
}

function roleSaveResponse(page: Page, accountId: string) {
  return page.waitForResponse((response) =>
    response.request().method() === "PUT" && response.url() === `${API}/api/v1/accounts/${accountId}/role`
  )
}

async function readAccount(api: APIRequestContext, username: string) {
  const response = await api.get(`${API}/api/v1/staff-members`, { params: { searchKey: username } })
  expect(response.status()).toBe(200)
  const members = (await response.json()).data.items.map((item: unknown) => staffMemberResponseSchema.parse(item))
  return members.find((member: ReturnType<typeof staffMemberResponseSchema.parse>) => member.account?.username === username)?.account
}

test("cancel is read-only; save persists and the new role reaches the next sign-in", async ({ page, playwright }) => {
  const member = await createStaff(page.request)
  const oldSession = await playwright.request.newContext()
  try {
    const signedIn = await oldSession.post(`${API}/api/v1/auth/login`, {
      headers, data: { username: member.account.username, password: member.password },
    })
    expect(signedIn.status()).toBe(200)
    expect((await signedIn.json()).data.roleAssignments[0].roleCode).toBe("RECEPTIONIST")

    const row = await showStaff(page, member.fullName)
    let sheet = await openChangeRole(page, member.fullName)
    await expect(sheet.getByRole("button", { name: "Lưu thay đổi" })).toBeDisabled()
    await sheet.getByRole("radio", { name: /Lễ tân/ }).check()
    await expect(sheet.getByRole("button", { name: "Lưu thay đổi" })).toBeDisabled()
    await sheet.getByRole("textbox", { name: "Tìm vai trò" }).fill("không có vai trò này")
    await expect(sheet.getByText("Không có kết quả tìm kiếm.")).toBeVisible()
    await sheet.getByRole("textbox", { name: "Tìm vai trò" }).fill("Điều dưỡng")
    await sheet.getByRole("radio", { name: /Điều dưỡng/ }).check()
    await sheet.getByRole("button", { name: "Xem quyền" }).click()
    await expect(sheet.getByRole("button", { name: "Ẩn quyền" })).toBeVisible()
    await expect(sheet.getByLabel("Quyền của vai trò")).toBeVisible()
    await sheet.getByRole("button", { name: "Hủy", exact: true }).click()
    await expect(sheet).toHaveCount(0)
    expect(await readAccount(page.request, member.account.username)).toMatchObject(member.account)

    sheet = await openChangeRole(page, member.fullName)
    await sheet.getByRole("radio", { name: /Điều dưỡng/ }).check()
    const saved = roleSaveResponse(page, member.account.id)
    await sheet.getByRole("button", { name: "Lưu thay đổi" }).click()
    const response = await saved
    expect(response.status()).toBe(200)
    expect(response.request().postDataJSON()).toEqual({ roleCode: "NURSE", rowVersion: member.account.rowVersion })
    expect((await response.json()).data).toEqual({ accountId: member.account.id, roleCode: "NURSE", rowVersion: member.account.rowVersion + 1 })
    await expect(sheet).toHaveCount(0)
    await expect(row.getByText("Điều dưỡng", { exact: true })).toBeVisible()
    await page.reload()
    await expect(row.getByText("Điều dưỡng", { exact: true })).toBeVisible()
    expect(await readAccount(page.request, member.account.username)).toMatchObject({ roleCode: "NURSE", rowVersion: member.account.rowVersion + 1 })

    const existingSession = await oldSession.get(`${API}/api/v1/auth/me`)
    expect(existingSession.status()).toBe(200)
    expect((await existingSession.json()).data.roleAssignments[0].roleCode).toBe("RECEPTIONIST")
    const nextSession = await oldSession.post(`${API}/api/v1/auth/login`, {
      headers, data: { username: member.account.username, password: member.password },
    })
    expect(nextSession.status()).toBe(200)
    expect((await nextSession.json()).data.roleAssignments[0].roleCode).toBe("NURSE")
    await page.screenshot({ path: test.info().outputPath("role-saved.png"), fullPage: true })
  } finally {
    await oldSession.dispose()
  }
})

test("a concurrent change shows a Vietnamese conflict and reopening permits a fresh save", async ({ page }) => {
  const member = await createStaff(page.request)
  await showStaff(page, member.fullName)
  let sheet = await openChangeRole(page, member.fullName)
  await sheet.getByRole("radio", { name: /Điều dưỡng/ }).check()
  const competing = await page.request.put(`${API}/api/v1/accounts/${member.account.id}/role`, {
    headers, data: { roleCode: "GENERAL_PRACTITIONER", rowVersion: member.account.rowVersion },
  })
  expect(competing.status()).toBe(200)
  const rejected = roleSaveResponse(page, member.account.id)
  await sheet.getByRole("button", { name: "Lưu thay đổi" }).click()
  expect((await rejected).status()).toBe(409)
  await expect(sheet.getByRole("alert")).toContainText("vừa được người khác thay đổi")
  await expect(sheet.getByRole("radio", { name: /Điều dưỡng/ })).toBeChecked()
  expect(await readAccount(page.request, member.account.username)).toMatchObject({ roleCode: "GENERAL_PRACTITIONER", rowVersion: member.account.rowVersion + 1 })
  await sheet.getByRole("button", { name: "Hủy", exact: true }).click()
  await expect(page.getByRole("row").filter({ hasText: member.fullName }).getByText("Bác sĩ đa khoa", { exact: true })).toBeVisible()
  sheet = await openChangeRole(page, member.fullName)
  await sheet.getByRole("radio", { name: /Điều dưỡng/ }).check()
  const saved = roleSaveResponse(page, member.account.id)
  await sheet.getByRole("button", { name: "Lưu thay đổi" }).click()
  expect((await saved).status()).toBe(200)
  expect(await readAccount(page.request, member.account.username)).toMatchObject({ roleCode: "NURSE", rowVersion: member.account.rowVersion + 2 })
})

test("a role deactivated after selection is rejected and can no longer be selected", async ({ page }) => {
  const role = await createRole(page.request)
  const member = await createStaff(page.request)
  await showStaff(page, member.fullName)
  const sheet = await openChangeRole(page, member.fullName)
  await sheet.getByRole("radio", { name: new RegExp(role.name) }).check()
  const deactivated = await page.request.put(`${API}/api/v1/admin/roles/${role.id}`, {
    headers, data: { name: role.name, active: false, rowVersion: role.rowVersion },
  })
  expect(deactivated.status()).toBe(200)
  const rejected = roleSaveResponse(page, member.account.id)
  await sheet.getByRole("button", { name: "Lưu thay đổi" }).click()
  expect((await rejected).status()).toBe(422)
  await expect(sheet.getByRole("alert")).toContainText("không còn hoạt động")
  await expect(sheet.getByRole("radio", { name: new RegExp(role.name) })).toHaveCount(0)
  await expect(sheet.getByRole("button", { name: "Lưu thay đổi" })).toBeDisabled()
  expect(await readAccount(page.request, member.account.username)).toMatchObject(member.account)
})

test("the API rejects invalid roles, missing versions, unknown accounts and missing sessions", async ({ page, request }) => {
  const member = await createStaff(page.request)
  const endpoint = `${API}/api/v1/accounts/${member.account.id}/role`
  for (const [data, status] of [
    [{ roleCode: "RECEPTIONIST", rowVersion: member.account.rowVersion }, 400],
    [{ roleCode: "NURSE" }, 400],
    [{ roleCode: "NURSE", rowVersion: -1 }, 400],
    [{ roleCode: "PATIENT", rowVersion: member.account.rowVersion }, 422],
    [{ roleCode: "E2E_MISSING_ROLE", rowVersion: member.account.rowVersion }, 422],
  ] as const) {
    const rejected = await page.request.put(endpoint, { headers, data })
    expect(rejected.status()).toBe(status)
  }
  const unknown = await page.request.put(`${API}/api/v1/accounts/${randomUUID()}/role`, {
    headers, data: { roleCode: "NURSE", rowVersion: 0 },
  })
  expect(unknown.status()).toBe(404)
  const unauthenticated = await request.put(endpoint, {
    headers, data: { roleCode: "NURSE", rowVersion: member.account.rowVersion },
  })
  expect(unauthenticated.status()).toBe(401)
  const badOrigin = await page.request.put(endpoint, {
    headers: { Origin: "https://untrusted.example.invalid" },
    data: { roleCode: "NURSE", rowVersion: member.account.rowVersion },
  })
  expect(badOrigin.status()).toBe(403)
  expect(await readAccount(page.request, member.account.username)).toMatchObject(member.account)
})

test("a role with view permissions only cannot change roles in the UI or API", async ({ page, playwright }) => {
  const role = await createRole(page.request)
  const granted = await page.request.put(`${API}/api/v1/admin/roles/${role.id}/permissions`, {
    headers, data: { rowVersion: role.rowVersion, grant: ["STAFF_MEMBER_VIEW", "ROLE_VIEW"], revoke: [] },
  })
  expect(granted.status()).toBe(200)
  const member = await createStaff(page.request, role.code)
  const restrictedContext = await playwright.request.newContext()
  try {
    const login = await restrictedContext.post(`${API}/api/v1/auth/login`, {
      headers, data: { username: member.account.username, password: member.password },
    })
    expect(login.status()).toBe(200)
    expect((await login.json()).data.roleAssignments[0].permissions).not.toContain("USER_ROLE_ASSIGN")
    const denied = await restrictedContext.put(`${API}/api/v1/accounts/${member.account.id}/role`, {
      headers, data: { roleCode: "NURSE", rowVersion: member.account.rowVersion },
    })
    expect(denied.status()).toBe(403)
    // Replace the administrator browser session through the normal sign-out endpoint.
    expect((await page.request.post(`${API}/api/v1/auth/logout`, { headers })).status()).toBe(204)
    await signIn(page, member.account.username, member.password)
    await showStaff(page, member.fullName)
    await expect(page.getByRole("button", { name: /Đổi vai trò của/ })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Thêm nhân viên", exact: true })).toHaveCount(0)
  } finally {
    await restrictedContext.dispose()
  }
})
