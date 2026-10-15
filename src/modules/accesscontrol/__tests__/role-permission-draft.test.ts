import { describe, expect, it } from "vitest"
import {
  EMPTY_DRAFT,
  filterPermissions,
  groupByModule,
  hasPendingChanges,
  isGrantedAfterSave,
  isProtectedPermission,
  pendingChangeOf,
  rebaseDraft,
  setPermissions,
  subtractSent,
} from "../utils/role-permission-draft"
import { toDisplayCatalog } from "../utils/permission-labels"
import { roleDisplayDescription, roleDisplayName } from "../utils/role-labels"
import { catalogFixture } from "./role-fixtures"

const granted = new Set(["PATIENT_VIEW", "PAYMENT_REFUND"])

describe("role permission draft", () => {
  it("records only real differences from the saved permissions", () => {
    let draft = setPermissions(EMPTY_DRAFT, granted, ["PAYMENT_VIEW"], true)
    draft = setPermissions(draft, granted, ["PAYMENT_REFUND"], false)
    draft = setPermissions(draft, granted, ["PATIENT_VIEW"], true)

    expect([...draft.grant]).toEqual(["PAYMENT_VIEW"])
    expect([...draft.revoke]).toEqual(["PAYMENT_REFUND"])
    expect(pendingChangeOf(draft, "PAYMENT_VIEW")).toBe("grant")
    expect(pendingChangeOf(draft, "PAYMENT_REFUND")).toBe("revoke")
    expect(pendingChangeOf(draft, "PATIENT_VIEW")).toBeNull()
    expect(isGrantedAfterSave(draft, granted, "PAYMENT_REFUND")).toBe(false)
    expect(isGrantedAfterSave(draft, granted, "PAYMENT_VIEW")).toBe(true)

    const undone = setPermissions(
      setPermissions(draft, granted, ["PAYMENT_VIEW"], false),
      granted,
      ["PAYMENT_REFUND"],
      true
    )
    expect(hasPendingChanges(undone)).toBe(false)
  })

  it("applies a module change to every given permission", () => {
    const draft = setPermissions(EMPTY_DRAFT, granted, ["PAYMENT_REFUND", "PAYMENT_VIEW"], true)
    expect([...draft.grant]).toEqual(["PAYMENT_VIEW"])
    expect(draft.revoke.size).toBe(0)
  })

  it("keeps the changes made while a save was in flight", () => {
    const sentDraft = setPermissions(EMPTY_DRAFT, granted, ["PAYMENT_VIEW"], true)
    const sent = { grant: [...sentDraft.grant], revoke: [...sentDraft.revoke] }
    const meanwhile = setPermissions(sentDraft, granted, ["PAYMENT_REFUND"], false)

    const left = subtractSent(meanwhile, sent)

    expect(left && [...left.grant]).toEqual([])
    expect(left && [...left.revoke]).toEqual(["PAYMENT_REFUND"])
    expect(subtractSent(sentDraft, sent)).toBeNull()
  })

  it("drops changes the saved permissions already contain", () => {
    const draft = setPermissions(
      setPermissions(EMPTY_DRAFT, granted, ["PAYMENT_VIEW"], true),
      granted,
      ["PATIENT_VIEW"],
      false
    )
    const rebased = rebaseDraft(draft, new Set(["PAYMENT_VIEW", "PATIENT_VIEW"]))

    expect(rebased.grant.size).toBe(0)
    expect([...rebased.revoke]).toEqual(["PATIENT_VIEW"])
    expect(rebaseDraft(rebased, new Set(["PATIENT_VIEW"]))).toBe(rebased)
  })

  it("shows the catalogue in Vietnamese, grouped by module", () => {
    const catalog = toDisplayCatalog(catalogFixture)

    expect(groupByModule(catalog).map((group) => group.module)).toEqual([
      "Bệnh nhân",
      "Hóa đơn và thanh toán",
      "Vai trò và phân quyền",
    ])
    expect(catalog.find((item) => item.code === "PAYMENT_REFUND")?.name).toBe("Hoàn tiền")
    expect(
      toDisplayCatalog([{ code: "LATER", name: "Later", module: "New", useCases: [], sensitive: false }])
    ).toMatchObject([{ name: "Later", module: "New" }])
  })

  it("filters by name only, ignoring case", () => {
    const catalog = toDisplayCatalog(catalogFixture)

    expect(filterPermissions(catalog, "HOÀN", null).map((item) => item.code)).toEqual([
      "PAYMENT_REFUND",
    ])
    expect(filterPermissions(catalog, "PAYMENT_REFUND", null)).toEqual([])
    expect(filterPermissions(catalog, "UC-046", null)).toEqual([])
    expect(
      filterPermissions(catalog, "", (code) => granted.has(code)).map((item) => item.code)
    ).toEqual(["PATIENT_VIEW", "PAYMENT_REFUND"])
  })

  it("names seeded roles in Vietnamese and keeps names an administrator typed", () => {
    expect(roleDisplayName({ code: "RECEPTIONIST", name: "Receptionist" })).toBe("Lễ tân")
    expect(roleDisplayName({ code: "RECEPTIONIST", name: "Lễ tân ca sáng" })).toBe("Lễ tân ca sáng")
    expect(roleDisplayName({ code: "LAB_TECH", name: "Kỹ thuật viên" })).toBe("Kỹ thuật viên")
    expect(
      roleDisplayDescription({
        code: "NURSE",
        description:
          "Prepares participant examination records, enters batch examination data and issues completed records.",
      })
    ).toMatch(/^Chuẩn bị hồ sơ khám/)
    expect(roleDisplayDescription({ code: "NURSE", description: undefined })).toBeUndefined()
  })

  it("locks only the granted role administration permissions of the Administrator", () => {
    const adminGrants = new Set(["ROLE_PERMISSION_ASSIGN"])
    expect(isProtectedPermission("ADMINISTRATOR", "ROLE_PERMISSION_ASSIGN", adminGrants)).toBe(true)
    expect(isProtectedPermission("ADMINISTRATOR", "ROLE_MANAGE", adminGrants)).toBe(false)
    expect(isProtectedPermission("ADMINISTRATOR", "PATIENT_VIEW", new Set(["PATIENT_VIEW"]))).toBe(
      false
    )
    expect(isProtectedPermission("NURSE", "ROLE_PERMISSION_ASSIGN", adminGrants)).toBe(false)
  })
})
