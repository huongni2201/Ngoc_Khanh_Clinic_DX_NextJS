import { expect, test } from "@playwright/test"
import { mockBackend, ORGANIZATION_ID } from "./support/mock-backend"

// Past dates, so recording attendance is allowed (the backend refuses ATTENDED for a future day).
const FIRST_DAY = "2026-01-05"
const SECOND_DAY = "2026-01-07"

const agreementUrl = (agreementId: string, tab: string) =>
  `/organizations/${ORGANIZATION_ID}/agreements/${agreementId}?tab=${tab}`

test("assigns a roster to a session, moves one person to another day and records attendance", async ({ page }) => {
  const backend = await mockBackend(page)
  const agreement = backend.seedAgreement({ status: "ACTIVE", rowVersion: 1 })
  backend.seedParticipant(agreement)
  backend.seedParticipant(agreement)
  backend.seedParticipant(agreement)
  const first = backend.seedSession({ sessionDate: FIRST_DAY })
  const second = backend.seedSession({ sessionDate: SECOND_DAY })

  // Participants have no date yet: pick two and assign them to the first session.
  await page.goto(agreementUrl(agreement.id, "participants"))
  await expect(page.getByText("Người khám 3")).toBeVisible()
  await page.getByRole("checkbox", { name: "Chọn Người khám 1" }).click()
  await page.getByRole("checkbox", { name: "Chọn Người khám 2" }).click()
  await page.getByRole("button", { name: /^Xếp lịch khám \(2\)/ }).click()

  const assignDialog = page.getByRole("dialog", { name: "Xếp lịch khám", exact: true })
  await assignDialog.getByRole("radio").first().click()
  await assignDialog.getByRole("button", { name: "Xếp lịch", exact: true }).click()
  await expect(assignDialog).toBeHidden()

  expect(backend.assignments.map((entry) => [entry.sessionId, entry.status])).toEqual([
    [first.id, "ASSIGNED"],
    [first.id, "ASSIGNED"],
  ])
  const assignRequest = backend.requests.find(
    (entry) => entry.method === "POST" && entry.path.endsWith(`/sessions/${first.id}/assignments`)
  )
  expect(assignRequest?.body).toEqual({ participantIds: backend.participants.slice(0, 2).map((entry) => entry.id) })

  // The session list shows how many were assigned; the count comes from the backend.
  await page.goto(agreementUrl(agreement.id, "sessions"))
  const firstRow = page.getByRole("row", { name: /05\/01\/2026/ })
  await expect(firstRow.getByRole("cell").nth(4)).toHaveText("2")

  // Move one person to the second day: the old assignment stays as history.
  await page.getByRole("button", { name: "Xem lịch khám ngày 05/01/2026" }).click()
  const sheet = page.getByRole("dialog")
  await expect(sheet.getByText("Người khám 1")).toBeVisible()
  await sheet.getByRole("button", { name: "Đổi lịch khám của Người khám 1" }).click()
  const moveDialog = page.getByRole("dialog", { name: "Đổi lịch khám", exact: true })
  await moveDialog.getByRole("radio").click()
  await moveDialog.getByRole("button", { name: "Đổi lịch", exact: true }).click()
  await expect(moveDialog).toBeHidden()

  const moved = backend.assignments.find((entry) => entry.status === "MOVED")
  const replacement = backend.assignments.find((entry) => entry.id === moved?.replacedBy)
  expect(replacement).toMatchObject({ sessionId: second.id, status: "ASSIGNED" })
  expect(replacement?.participantId).toBe(moved?.participantId)
  expect(backend.participants).toHaveLength(3)

  // Attendance is recorded on the assignment, not on the Participant.
  await sheet.getByRole("button", { name: "Ghi nhận Người khám 2 đã đến" }).click()
  await expect
    .poll(() => backend.assignments.find((entry) => entry.sessionId === first.id && entry.status === "ATTENDED"))
    .toBeTruthy()
  expect(backend.participants.every((entry) => entry.rosterStatus === "ACTIVE")).toBe(true)
  expect(backend.unexpected).toEqual([])
})

test("a Participant already in the target day is refused and the move dialog stays open", async ({ page }) => {
  const backend = await mockBackend(page)
  const agreement = backend.seedAgreement({ status: "ACTIVE", rowVersion: 1 })
  const person = backend.seedParticipant(agreement)
  const first = backend.seedSession({ sessionDate: FIRST_DAY })
  const second = backend.seedSession({ sessionDate: SECOND_DAY })
  backend.seedAssignment(person, first)
  backend.seedAssignment(person, second)

  await page.goto(agreementUrl(agreement.id, "sessions"))
  await page.getByRole("button", { name: "Xem lịch khám ngày 05/01/2026" }).click()
  const sheet = page.getByRole("dialog")
  await sheet.getByRole("button", { name: "Đổi lịch khám của Người khám 1" }).click()
  const moveDialog = page.getByRole("dialog", { name: "Đổi lịch khám", exact: true })
  await moveDialog.getByRole("radio").click()
  await moveDialog.getByRole("button", { name: "Đổi lịch", exact: true }).click()

  await expect(moveDialog.getByText(/đã có trong lịch đích/)).toBeVisible()
  expect(backend.assignments.filter((entry) => entry.status === "MOVED")).toHaveLength(0)
})
