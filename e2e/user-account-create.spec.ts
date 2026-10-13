import { expect, test, type Page, type Route } from "@playwright/test"
import { API } from "./support/mock-backend"

const CORS = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

const GP_ROLE_ID = "0199aaaa-0000-7000-8000-000000000101"
const STAFF_OWNER_ID = "0199bbbb-0000-7000-8000-000000000201"

interface UserAccountMock {
  urls: string[]
  creates: Record<string, unknown>[]
}

function envelope(route: Route, status: number, data?: unknown, message = "OK") {
  return route.fulfill({
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
    body: JSON.stringify({ result: status < 400 ? "OK" : "NG", code: status, message, data }),
  })
}

/** Backend stand-in for the UC-005 routes and the Administrator session. */
async function mockUserAccounts(page: Page, permissions: string[]): Promise<UserAccountMock> {
  await page.addInitScript(() => localStorage.setItem("nkc-session-present", "1"))
  const mock: UserAccountMock = { urls: [], creates: [] }

  await page.route(`${API}/api/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS })
    mock.urls.push(request.url())

    if (url.pathname === "/api/v1/auth/me") {
      const now = Date.now()
      return envelope(route, 200, {
        principalType: "STAFF",
        userId: "11111111-1111-4111-8111-111111111111",
        staffId: "22222222-2222-4222-8222-222222222222",
        patientId: null,
        username: "admin.test",
        roleAssignments: [
          { roleId: "33333333-3333-4333-8333-333333333333", roleCode: "ADMINISTRATOR", permissions },
        ],
        idleExpiresAt: new Date(now + 30 * 60_000).toISOString(),
        absoluteExpiresAt: new Date(now + 8 * 3600_000).toISOString(),
      })
    }
    if (url.pathname === "/api/v1/user-accounts/assignable-roles") {
      return envelope(route, 200, [
        { roleId: GP_ROLE_ID, code: "GENERAL_PRACTITIONER", name: "General Practitioner", description: "" },
        { roleId: "0199aaaa-0000-7000-8000-000000000102", code: "NURSE", name: "Nurse", description: "" },
      ])
    }
    if (url.pathname === "/api/v1/user-accounts/eligible-owners") {
      return envelope(route, 200, {
        items: [
          {
            ownerId: STAFF_OWNER_ID,
            ownerCode: "NV-0071",
            fullName: "Nguyễn Văn A",
            departmentName: "Khoa Khám bệnh",
            dateOfBirth: null,
            phone: "0912 345 678",
            email: "a.nguyen@example.invalid",
            smsPhoneNumber: "0912345678",
          },
        ],
        limited: false,
      })
    }
    if (url.pathname === "/api/v1/user-accounts/username-availability") {
      return envelope(route, 200, { available: url.searchParams.get("username") !== "taken" })
    }
    if (url.pathname === "/api/v1/user-accounts" && request.method() === "POST") {
      expect(request.headers().origin).toBe("http://localhost:3000")
      const body = request.postDataJSON() as Record<string, unknown>
      mock.creates.push(body)
      return envelope(
        route,
        201,
        {
          accountId: "0199cccc-0000-7000-8000-000000000301",
          accountType: body.accountType,
          username: body.username,
          status: "ACTIVE",
          ownerId: body.ownerId,
          roleCodes: ["GENERAL_PRACTITIONER"],
          smsDelivered: false,
        },
        "User account created"
      )
    }
    return envelope(route, 404, undefined, "Unexpected request")
  })
  return mock
}

test("an Administrator creates a staff account from the sidebar", async ({ page }) => {
  const mock = await mockUserAccounts(page, [
    "USER_ACCOUNT_CREATE",
    "USER_ACCOUNT_OWNER_SEARCH",
    "USER_ACCOUNT_USERNAME_CHECK",
    "USER_ACCOUNT_ASSIGNABLE_ROLE_VIEW",
  ])
  await page.goto("/user-accounts/new")

  await expect(page.getByRole("heading", { name: "Tạo tài khoản người dùng" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Tài khoản người dùng" }).first()).toHaveAttribute(
    "aria-current",
    "page"
  )

  await page.getByRole("textbox", { name: "Tìm hồ sơ chủ tài khoản" }).fill("Nguyễn")
  await page.getByRole("textbox", { name: "Tìm hồ sơ chủ tài khoản" }).press("Enter")
  await page.getByRole("radio", { name: "Nguyễn Văn A" }).click()
  await page.getByLabel("Tên đăng nhập").fill("nguyen.van.a")
  await expect(page.getByText("Tên đăng nhập có thể sử dụng")).toBeVisible()
  await page.getByRole("button", { name: "Tạo ngẫu nhiên" }).click()
  await page.getByRole("checkbox", { name: "Bác sĩ đa khoa" }).click()
  await page.getByRole("button", { name: "Tạo tài khoản" }).click()

  await expect(page.getByRole("heading", { name: "Đã tạo tài khoản thành công" })).toBeVisible()
  await expect(page.getByText("Chưa gửi được SMS thông tin đăng nhập.")).toBeVisible()
  expect(mock.creates).toHaveLength(1)
  expect(mock.creates[0]).toMatchObject({
    accountType: "STAFF",
    ownerId: STAFF_OWNER_ID,
    username: "nguyen.van.a",
    roleIds: [GP_ROLE_ID],
  })
  const password = String(mock.creates[0].temporaryPassword)
  expect(password).toHaveLength(12)
  // The password travels only in the POST body, never in a URL or on the result screen.
  expect(mock.urls.some((url) => url.includes(encodeURIComponent(password)))).toBe(false)
  await expect(page.getByText(password)).toHaveCount(0)
})

test("a staff member without the permission sees no administration entry", async ({ page }) => {
  await mockUserAccounts(page, ["ORGANIZATION_READ"])
  await page.goto("/user-accounts/new")

  await expect(page.getByText("Không có quyền truy cập")).toBeVisible()
  await expect(page.getByRole("link", { name: "Tài khoản người dùng" })).toHaveCount(0)
})
