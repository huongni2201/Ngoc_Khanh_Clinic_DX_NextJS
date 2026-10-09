import { expect, test } from "@playwright/test"
import { mockBackend } from "./support/mock-backend"

for (const route of ["/patients", "/appointments", "/reception", "/doctor"]) {
  test(`${route} retains the unavailable state without calling unsupported APIs`, async ({ page }) => {
    const backend = await mockBackend(page)
    await page.goto(route)
    await expect(page.getByText(/Backend chưa cung cấp API/).first()).toBeVisible()
    expect(backend.unexpected).toEqual([])
    expect(backend.requests.filter(({ path }) =>
      /^\/api\/v1\/(patients|appointments|reception|doctor|encounters)(\/|$)/.test(path)
    )).toEqual([])
  })
}
