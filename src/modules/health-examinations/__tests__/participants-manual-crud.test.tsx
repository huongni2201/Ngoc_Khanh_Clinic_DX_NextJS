import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApiClientError, apiClient } from "@/shared/api/api-client"
import { ParticipantsTab } from "../components/participants-tab/participants-tab"

const BASE = "/api/v1/organizations/org-1/health-examination-batches/batch-1/participants"
const DAYS = [
  { id: "day-1", examinationDate: "2026-10-20" },
  { id: "day-2", examinationDate: "2026-10-21" },
]

function item(index: number, overrides: Record<string, unknown> = {}) {
  return {
    id: `p-${index}`,
    batchId: "batch-1",
    batchDayId: "day-1",
    examinationDate: "2026-10-20",
    participantCode: `NV${String(index).padStart(3, "0")}`,
    fullName: `Người khám ${index}`,
    dateOfBirth: "1990-03-14",
    sex: "FEMALE",
    identificationNumberMasked: "********8901",
    departmentName: "Phòng Kế toán",
    positionName: "Kế toán viên",
    rosterStatus: "ACTIVE",
    attendanceStatus: "UNCONFIRMED",
    reconciliationStatus: "PENDING",
    actualExaminationDate: null,
    preparedAt: null,
    rowVersion: 2,
    ...overrides,
  }
}

function detail(index: number, overrides: Record<string, unknown> = {}) {
  return {
    ...item(index),
    identificationNumber: "012345678901",
    phone: "0900000000",
    email: null,
    patientLinked: false,
    source: "MANUAL",
    createdAt: "2026-10-07T01:00:00Z",
    updatedAt: "2026-10-07T01:00:00Z",
    ...overrides,
  }
}

const envelope = (data: unknown) => ({ result: "OK" as const, code: 200, message: "ok", data })

function page(items: unknown[]) {
  return envelope({ items, page: 1, size: 10, totalElements: items.length, totalPages: 1 })
}

/** Routes GET by URL: the list, or the detail of one Participant. */
function stubGets(items: unknown[], details: Record<string, unknown> = {}) {
  return vi.spyOn(apiClient, "get").mockImplementation(async (path: string) => {
    const match = /\/participants\/([^/?]+)$/.exec(path)
    if (match) return envelope(details[match[1]] ?? detail(1)) as never
    return page(items) as never
  })
}

function renderTab(props: Partial<React.ComponentProps<typeof ParticipantsTab>> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <ParticipantsTab
        organizationId="org-1"
        batchId="batch-1"
        batch={{ code: "DK 001", status: "DRAFT", rowVersion: 4, days: DAYS }}
        canManage
        {...props}
      />
    </QueryClientProvider>
  )
}

afterEach(() => vi.restoreAllMocks())
beforeEach(() => vi.clearAllMocks())

describe("manual Participant actions are shown only when allowed", () => {
  it("shows Add, Edit and Cancel for a manager on a Draft batch", async () => {
    stubGets([item(1)])
    renderTab()

    expect(await screen.findByText("Người khám 1")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Thêm người khám" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sửa người khám Người khám 1" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Hủy người khám Người khám 1" })).toBeEnabled()
  })

  it("shows them on a Ready batch too", async () => {
    stubGets([item(1)])
    renderTab({ batch: { code: "DK 001", status: "READY", rowVersion: 4, days: DAYS } })

    expect(await screen.findByRole("button", { name: "Thêm người khám" })).toBeInTheDocument()
  })

  it("hides them without the manage permission", async () => {
    stubGets([item(1)])
    renderTab({ canManage: false })

    expect(await screen.findByText("Người khám 1")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Thêm người khám" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Sửa người khám/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Hủy người khám/ })).not.toBeInTheDocument()
  })

  it.each(["FINALIZED", "CLOSED"])("hides them on a %s batch", async (status) => {
    stubGets([item(1)])
    renderTab({ batch: { code: "DK 001", status, rowVersion: 4, days: DAYS } })

    expect(await screen.findByText("Người khám 1")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Thêm người khám" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Sửa người khám/ })).not.toBeInTheDocument()
  })

  it("offers no actions on a cancelled Participant", async () => {
    stubGets([item(1, { rosterStatus: "CANCELLED" })])
    renderTab()

    expect(await screen.findByText("Người khám 1")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Sửa người khám/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Hủy người khám/ })).not.toBeInTheDocument()
  })

  it("disables Cancel with the reason for a prepared Participant, but still allows Edit", async () => {
    stubGets([item(1, { preparedAt: "2026-10-07T01:00:00Z" })])
    renderTab()

    const cancel = await screen.findByRole("button", { name: "Hủy người khám Người khám 1" })
    expect(cancel).toBeDisabled()
    expect(cancel).toHaveAccessibleDescription(/đã được chuẩn bị lượt khám/)
    expect(screen.getByRole("button", { name: "Sửa người khám Người khám 1" })).toBeEnabled()
  })
})

describe("adding a Participant", () => {
  async function fillValidForm(dialog: HTMLElement, user: ReturnType<typeof userEvent.setup>) {
    await user.type(within(dialog).getByLabelText(/Họ và tên/), "Trần Thị B")
    await user.type(within(dialog).getByLabelText(/Ngày sinh/), "1992-05-06")
    await user.selectOptions(within(dialog).getByLabelText(/Giới tính/), "FEMALE")
    await user.type(within(dialog).getByLabelText(/CCCD/), "098765432109")
    await user.selectOptions(within(dialog).getByLabelText(/Ngày khám/), "day-2")
    await user.type(within(dialog).getByLabelText(/Đơn vị\/Phòng ban/), "Phòng Nhân sự")
    await user.type(within(dialog).getByLabelText(/Chức vụ/), "Chuyên viên")
  }

  it("validates the form before any request", async () => {
    stubGets([item(1)])
    const post = vi.spyOn(apiClient, "post")
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Thêm người khám" }))
    const dialog = await screen.findByRole("dialog")

    await user.click(within(dialog).getByRole("button", { name: "Thêm người khám" }))

    expect(await within(dialog).findByText("Họ và tên là bắt buộc")).toBeInTheDocument()
    expect(within(dialog).getByText("CCCD là bắt buộc")).toBeInTheDocument()
    expect(within(dialog).getByText("Vui lòng chọn ngày khám")).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it("posts the form, closes the dialog and tells the user", async () => {
    stubGets([item(1)])
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue(envelope(detail(2, { fullName: "Trần Thị B" })) as never)
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Thêm người khám" }))
    const dialog = await screen.findByRole("dialog")

    await fillValidForm(dialog, user)
    await user.click(within(dialog).getByRole("button", { name: "Thêm người khám" }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post.mock.calls[0][0]).toBe(BASE)
    expect(post.mock.calls[0][1]).toMatchObject({
      fullName: "Trần Thị B",
      identificationNumber: "098765432109",
      sex: "FEMALE",
      batchDayId: "day-2",
      phone: null,
      email: null,
    })
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("status")).toHaveTextContent("Đã thêm người khám vào danh sách.")
  })

  it("shows a duplicate CCCD on the CCCD field and keeps the dialog open", async () => {
    stubGets([item(1)])
    vi.spyOn(apiClient, "post").mockRejectedValue(
      new ApiClientError("x", 409, 409, "Participant identity already exists in this batch")
    )
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Thêm người khám" }))
    const dialog = await screen.findByRole("dialog")

    await fillValidForm(dialog, user)
    await user.click(within(dialog).getByRole("button", { name: "Thêm người khám" }))

    expect(await within(dialog).findByText(/CCCD này đã có trong đợt khám/)).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

describe("editing a Participant", () => {
  it("fills the form from the detail with the full CCCD and saves with the detail's version", async () => {
    stubGets([item(1)], { "p-1": detail(1, { rowVersion: 9 }) })
    const put = vi
      .spyOn(apiClient, "put")
      .mockResolvedValue(envelope(detail(1, { fullName: "Tên mới", rowVersion: 10 })) as never)
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Sửa người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")

    const cccd = await within(dialog).findByDisplayValue("012345678901")
    expect(cccd).toBeEnabled()
    expect(within(dialog).getByDisplayValue("0900000000")).toBeInTheDocument()

    const name = within(dialog).getByLabelText(/Họ và tên/)
    await user.clear(name)
    await user.type(name, "Tên mới")
    await user.click(within(dialog).getByRole("button", { name: "Lưu thay đổi" }))

    await waitFor(() => expect(put).toHaveBeenCalledTimes(1))
    expect(put.mock.calls[0][0]).toBe(`${BASE}/p-1`)
    expect(put.mock.calls[0][1]).toMatchObject({
      fullName: "Tên mới",
      identificationNumber: "012345678901",
      rowVersion: 9,
    })
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("status")).toHaveTextContent("Đã cập nhật thông tin người khám.")
  })

  it("locks the CCCD once the Participant is linked to a patient", async () => {
    stubGets([item(1)], { "p-1": detail(1, { patientLinked: true }) })
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Sửa người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")

    const cccd = await within(dialog).findByDisplayValue("012345678901")
    expect(cccd).toBeDisabled()
    expect(within(dialog).getByText(/Không thể đổi CCCD/)).toBeInTheDocument()
  })

  it("reloads the latest data and explains a stale version", async () => {
    const get = stubGets([item(1)], { "p-1": detail(1, { rowVersion: 9 }) })
    vi.spyOn(apiClient, "put").mockRejectedValue(
      new ApiClientError("x", 409, 409, "Record was changed by another request")
    )
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Sửa người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")
    await within(dialog).findByDisplayValue("012345678901")
    const detailCalls = () => get.mock.calls.filter(([path]) => /p-1$/.test(path as string)).length
    const before = detailCalls()

    await user.click(within(dialog).getByRole("button", { name: "Lưu thay đổi" }))

    expect(await within(dialog).findByText(/Dữ liệu đã thay đổi/)).toBeInTheDocument()
    await waitFor(() => expect(detailCalls()).toBeGreaterThan(before))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("closes with a notice when the detail is forbidden", async () => {
    vi.spyOn(apiClient, "get").mockImplementation(async (path: string) => {
      if (/\/participants\/p-1$/.test(path)) throw new ApiClientError("x", 403, 403)
      return page([item(1)]) as never
    })
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Sửa người khám Người khám 1" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("status")).toHaveTextContent(/không có quyền xem đầy đủ/)
  })
})

describe("cancelling a Participant", () => {
  it("confirms, sends the row's version in the query and reports the cancellation", async () => {
    stubGets([item(1, { rowVersion: 6 })])
    const del = vi.spyOn(apiClient, "delete").mockResolvedValue(envelope(undefined) as never)
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Hủy người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")

    expect(within(dialog).getByText(/không phải xóa/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Hủy người khám" }))

    await waitFor(() => expect(del).toHaveBeenCalledWith(`${BASE}/p-1?rowVersion=6`))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("status")).toHaveTextContent("Đã hủy người khám Người khám 1.")
  })

  it("does nothing when the user keeps the Participant", async () => {
    stubGets([item(1)])
    const del = vi.spyOn(apiClient, "delete")
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Hủy người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")

    await user.click(within(dialog).getByRole("button", { name: "Giữ lại" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(del).not.toHaveBeenCalled()
  })

  it("explains a refusal in Vietnamese and keeps the dialog open", async () => {
    stubGets([item(1)])
    vi.spyOn(apiClient, "delete").mockRejectedValue(
      new ApiClientError(
        "x",
        409,
        409,
        "Participant cannot be cancelled after preparation or attendance"
      )
    )
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Hủy người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")

    await user.click(within(dialog).getByRole("button", { name: "Hủy người khám" }))

    expect(await within(dialog).findByText(/Không thể hủy người khám đã được chuẩn bị/)).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

describe("reactivating a Participant", () => {
  const cancelledRow = (overrides: Record<string, unknown> = {}) =>
    item(1, { rosterStatus: "CANCELLED", rowVersion: 6, ...overrides })

  it("shows Reactivate on a cancelled row for a manager on a Draft or Ready batch", async () => {
    stubGets([cancelledRow(), item(2)])
    renderTab()

    expect(await screen.findByText("Người khám 1")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Khôi phục người khám Người khám 1" })).toBeEnabled()
    // An active row keeps Edit and Cancel and gets no Reactivate.
    expect(screen.queryByRole("button", { name: "Khôi phục người khám Người khám 2" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Hủy người khám Người khám 2" })).toBeInTheDocument()
  })

  it("shows it on a Ready batch too", async () => {
    stubGets([cancelledRow()])
    renderTab({ batch: { code: "DK 001", status: "READY", rowVersion: 4, days: DAYS } })

    expect(
      await screen.findByRole("button", { name: "Khôi phục người khám Người khám 1" })
    ).toBeInTheDocument()
  })

  it("hides it without the manage permission", async () => {
    stubGets([cancelledRow()])
    renderTab({ canManage: false })

    expect(await screen.findByText("Người khám 1")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Khôi phục người khám/ })).not.toBeInTheDocument()
  })

  it.each(["FINALIZED", "CLOSED"])("hides it on a %s batch", async (status) => {
    stubGets([cancelledRow()])
    renderTab({ batch: { code: "DK 001", status, rowVersion: 4, days: DAYS } })

    expect(await screen.findByText("Người khám 1")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Khôi phục người khám/ })).not.toBeInTheDocument()
  })

  it("starts on the old day, sends the row's version and reports the reactivation", async () => {
    stubGets([cancelledRow({ batchDayId: "day-2" })])
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(envelope(detail(1)) as never)
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Khôi phục người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")

    expect(within(dialog).getByText(/Đang trong danh sách\); thông tin cũ được giữ nguyên/)).toBeInTheDocument()
    expect(within(dialog).getByLabelText("Ngày khám")).toHaveValue("day-2")
    await user.click(within(dialog).getByRole("button", { name: "Khôi phục người khám" }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post.mock.calls[0][0]).toBe(`${BASE}/p-1/reactivate`)
    expect(post.mock.calls[0][1]).toEqual({ rowVersion: 6, batchDayId: "day-2" })
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("status")).toHaveTextContent("Đã khôi phục người khám Người khám 1.")
  })

  it("sends the day the user picks instead", async () => {
    stubGets([cancelledRow()])
    const post = vi.spyOn(apiClient, "post").mockResolvedValue(envelope(detail(1)) as never)
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Khôi phục người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")

    await user.selectOptions(within(dialog).getByLabelText("Ngày khám"), "day-2")
    await user.click(within(dialog).getByRole("button", { name: "Khôi phục người khám" }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post.mock.calls[0][1]).toEqual({ rowVersion: 6, batchDayId: "day-2" })
  })

  it("does nothing when the user postpones", async () => {
    stubGets([cancelledRow()])
    const post = vi.spyOn(apiClient, "post")
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Khôi phục người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")

    await user.click(within(dialog).getByRole("button", { name: "Để sau" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(post).not.toHaveBeenCalled()
  })

  it("closes, reloads the list and says so after a stale version", async () => {
    const get = stubGets([cancelledRow()])
    vi.spyOn(apiClient, "post").mockRejectedValue(
      new ApiClientError("x", 409, 409, "Record was changed by another request")
    )
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Khôi phục người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")
    const listCallsBefore = get.mock.calls.length

    await user.click(within(dialog).getByRole("button", { name: "Khôi phục người khám" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("status")).toHaveTextContent(/Dữ liệu người khám đã thay đổi/)
    await waitFor(() => expect(get.mock.calls.length).toBeGreaterThan(listCallsBefore))
  })

  it("closes and reloads the list when the Participant is no longer cancelled", async () => {
    const get = stubGets([cancelledRow()])
    vi.spyOn(apiClient, "post").mockRejectedValue(
      new ApiClientError("x", 409, 409, "Participant is not cancelled")
    )
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Khôi phục người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")
    const listCallsBefore = get.mock.calls.length

    await user.click(within(dialog).getByRole("button", { name: "Khôi phục người khám" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("status")).toHaveTextContent(/không còn ở trạng thái Đã hủy/)
    await waitFor(() => expect(get.mock.calls.length).toBeGreaterThan(listCallsBefore))
  })

  it("closes with a notice when the backend refuses the permission", async () => {
    stubGets([cancelledRow()])
    vi.spyOn(apiClient, "post").mockRejectedValue(new ApiClientError("x", 403, 403, "Forbidden"))
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Khôi phục người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")

    await user.click(within(dialog).getByRole("button", { name: "Khôi phục người khám" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("status")).toHaveTextContent("Bạn không có quyền khôi phục người khám.")
  })

  it("keeps the dialog open and explains a batch that no longer accepts changes", async () => {
    stubGets([cancelledRow()])
    vi.spyOn(apiClient, "post").mockRejectedValue(
      new ApiClientError("x", 409, 409, "Batch does not accept Participant changes")
    )
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Khôi phục người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")

    await user.click(within(dialog).getByRole("button", { name: "Khôi phục người khám" }))

    expect(await within(dialog).findByText(/không còn nhận thay đổi người khám/)).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

describe("adding a CCCD that belongs to a cancelled Participant", () => {
  async function submitDuplicate(user: ReturnType<typeof userEvent.setup>) {
    await user.click(await screen.findByRole("button", { name: "Thêm người khám" }))
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText(/Họ và tên/), "Trần Thị B")
    await user.type(within(dialog).getByLabelText(/Ngày sinh/), "1992-05-06")
    await user.selectOptions(within(dialog).getByLabelText(/Giới tính/), "FEMALE")
    await user.type(within(dialog).getByLabelText(/CCCD/), "098765432109")
    await user.selectOptions(within(dialog).getByLabelText(/Ngày khám/), "day-2")
    await user.type(within(dialog).getByLabelText(/Đơn vị\/Phòng ban/), "Phòng Nhân sự")
    await user.type(within(dialog).getByLabelText(/Chức vụ/), "Chuyên viên")
    await user.click(within(dialog).getByRole("button", { name: "Thêm người khám" }))
    return dialog
  }

  const duplicate = () =>
    new ApiClientError("x", 409, 409, "Participant identity already exists in this batch")

  /** The list answers the lookup of the CCCD with `lookupItems`, and everything else with `items`. */
  function stubListAndLookup(items: unknown[], lookupItems: unknown[] | Error) {
    return vi.spyOn(apiClient, "get").mockImplementation(async (path: string) => {
      if (path.includes("identificationNumber=")) {
        if (lookupItems instanceof Error) throw lookupItems
        return page(lookupItems) as never
      }
      return page(items) as never
    })
  }

  it("offers to reactivate the cancelled Participant and opens the reactivate dialog", async () => {
    const get = stubListAndLookup(
      [item(1)],
      [item(7, { fullName: "Lê Văn Cũ", rosterStatus: "CANCELLED", rowVersion: 3 })]
    )
    vi.spyOn(apiClient, "post").mockRejectedValue(duplicate())
    renderTab()
    const user = userEvent.setup()

    const dialog = await submitDuplicate(user)

    expect(await within(dialog).findByText(/CCCD này thuộc người khám/)).toHaveTextContent(
      "CCCD này thuộc người khám Lê Văn Cũ đã bị hủy."
    )
    const lookup = get.mock.calls.map(([path]) => String(path)).find((path) =>
      path.includes("identificationNumber=")
    )
    const query = new URL(lookup as string, "http://x").searchParams
    expect(query.get("identificationNumber")).toBe("098765432109")
    expect(query.get("rosterStatus")).toBe("CANCELLED")
    expect(query.get("size")).toBe("1")

    const post = vi.spyOn(apiClient, "post").mockResolvedValue(envelope(detail(7)) as never)
    await user.click(within(dialog).getByRole("button", { name: "Khôi phục người khám này" }))

    await waitFor(() => expect(screen.queryByLabelText(/^Họ và tên/)).not.toBeInTheDocument())
    const reactivate = await screen.findByRole("dialog")
    expect(within(reactivate).getByText("Lê Văn Cũ")).toBeInTheDocument()
    await user.click(within(reactivate).getByRole("button", { name: "Khôi phục người khám" }))
    await waitFor(() => expect(post).toHaveBeenCalledWith(`${BASE}/p-7/reactivate`, {
      rowVersion: 3,
      batchDayId: "day-1",
    }))
  })

  it("keeps only the CCCD field error when no cancelled Participant holds the CCCD", async () => {
    stubListAndLookup([item(1)], [])
    vi.spyOn(apiClient, "post").mockRejectedValue(duplicate())
    renderTab()
    const user = userEvent.setup()

    const dialog = await submitDuplicate(user)

    expect(await within(dialog).findByText(/CCCD này đã có trong đợt khám/)).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Khôi phục người khám này" })).not.toBeInTheDocument()
    )
  })

  it("does not suggest an active Participant", async () => {
    stubListAndLookup([item(1)], [item(7)])
    vi.spyOn(apiClient, "post").mockRejectedValue(duplicate())
    renderTab()
    const user = userEvent.setup()

    const dialog = await submitDuplicate(user)

    expect(await within(dialog).findByText(/CCCD này đã có trong đợt khám/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Khôi phục người khám này" })).not.toBeInTheDocument()
  })

  it("falls back to the field error when the lookup fails", async () => {
    stubListAndLookup([item(1)], new ApiClientError("x", 500, 500, "boom"))
    vi.spyOn(apiClient, "post").mockRejectedValue(duplicate())
    renderTab()
    const user = userEvent.setup()

    const dialog = await submitDuplicate(user)

    expect(await within(dialog).findByText(/CCCD này đã có trong đợt khám/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Khôi phục người khám này" })).not.toBeInTheDocument()
  })
})

describe("the cancel dialog wording", () => {
  it("says the CCCD is kept and the Participant can be reactivated", async () => {
    stubGets([item(1)])
    renderTab()
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Hủy người khám Người khám 1" }))
    const dialog = await screen.findByRole("dialog")

    expect(
      within(dialog).getByText(
        "CCCD vẫn được giữ trong đợt khám; có thể khôi phục người khám này sau nếu hủy nhầm."
      )
    ).toBeInTheDocument()
    expect(within(dialog).queryByText(/không thể thêm lại cùng CCCD/)).not.toBeInTheDocument()
  })
})
