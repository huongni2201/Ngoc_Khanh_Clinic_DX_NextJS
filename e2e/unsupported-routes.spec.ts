import { expect, test } from "@playwright/test"
import { mockBackend, ORGANIZATION_ID } from "./support/mock-backend"

const TABS = [
  { name: "Người khám", param: "participants" },
  { name: "Chi tiết khám", param: "examination" },
  { name: "Báo cáo", param: "report" },
]

for (const tab of TABS) {
  test(`"${tab.name}" says it is unsupported and sends no request for it`, async ({ page }) => {
    const backend = await mockBackend(page)
    const batch = backend.seedBatch()
    await page.goto(`/organizations/${ORGANIZATION_ID}/health-examination-batches/${batch.id}`)
    await expect(page.getByRole("heading", { name: batch.batchName })).toBeVisible()

    const before = backend.requests.length
    await page.getByRole("button", { name: tab.name }).click()
    await expect(page).toHaveURL(new RegExp(`tab=${tab.param}`))
    await expect(page.getByText("Chưa hỗ trợ")).toBeVisible()
    await page.waitForTimeout(500)

    const after = backend.requests.slice(before).map((request) => request.path)
    expect(after.filter((path) => /participants|report|matrix|export|progress/.test(path))).toEqual([])
    expect(backend.unexpected).toEqual([])
  })
}
