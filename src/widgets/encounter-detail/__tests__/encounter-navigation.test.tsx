import { beforeEach, expect, it, vi } from "vitest"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { EncounterDetailPage } from "@/widgets/encounter-detail"
import { renderWithClient } from "@/test-utils/render-with-client"

const navigation = vi.hoisted(() => ({ query: "", replace: vi.fn(), push: vi.fn() }))
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "pat-mock-01", encounterId: "LK000456" }),
  useRouter: () => ({ replace: navigation.replace, push: navigation.push }),
  useSearchParams: () => new URLSearchParams(navigation.query),
}))
beforeEach(() => vi.clearAllMocks())

it("returns from the laboratory detail to the lab tab", async () => {
  navigation.query = "tab=lab&view=cbc"
  renderWithClient(<EncounterDetailPage />)
  const back = await screen.findByRole("button", { name: "Quay lại danh sách dịch vụ chẩn đoán" })
  await userEvent.click(back)
  expect(navigation.replace).toHaveBeenCalledWith("?tab=lab", { scroll: false })
})

it("prints the correct patient and prescription and closes within the prescriptions tab", async () => {
  navigation.query = "tab=prescriptions&modal=print"
  renderWithClient(<EncounterDetailPage />)
  const dialog = await screen.findByRole("dialog")
  expect(within(dialog).getByText("Nguyễn Văn Hùng")).toBeInTheDocument()
  expect(within(dialog).getAllByText("DT-2024-00456").length).toBeGreaterThan(0)
  await userEvent.click(within(dialog).getByRole("button", { name: "Đóng" }))
  expect(navigation.replace).toHaveBeenCalledWith("?tab=prescriptions", { scroll: false })
})
