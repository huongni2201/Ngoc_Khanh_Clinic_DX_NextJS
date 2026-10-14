import { describe, expect, it } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"
import { createStaffMemberSchema, EMPTY_CREATE_STAFF_MEMBER_FORM } from "../schemas/staff-member.schema"
import { previewUsernameBase } from "../utils/username-preview"
import { isUnavailableRoleError, staffMemberFieldErrors } from "../utils/staff-member-errors"
import { roleLabel } from "../utils/staff-member-labels"

const valid = {
  ...EMPTY_CREATE_STAFF_MEMBER_FORM,
  fullName: "Nguyễn Văn An",
  initialPassword: "Tam@12345",
  roleCodes: ["RECEPTIONIST"],
}

function messages(values: typeof valid) {
  const result = createStaffMemberSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe("username preview", () => {
  it.each([
    ["Nguyễn Văn An", "annv"],
    ["Đặng Thị Đào", "daodt"],
    ["  Trần   Bình  ", "binht"],
    ["An", "an"],
    ["Lê-Văn O'Neil", "oneill"],
  ])("previews %s as %s", (name, base) => {
    expect(previewUsernameBase(name)).toBe(base)
  })

  it("has no preview for a name without letters", () => {
    expect(previewUsernameBase("123 !!")).toBeNull()
  })
})

describe("create staff member form rules", () => {
  it("accepts the minimum valid form", () => {
    expect(messages(valid)).toEqual([])
  })

  it("requires a name with letters, a role and an 8 character password", () => {
    expect(messages({ ...valid, fullName: "123" })).toContain("Họ và tên phải có chữ cái")
    expect(messages({ ...valid, roleCodes: [] })).toContain("Chọn ít nhất một vai trò")
    expect(messages({ ...valid, initialPassword: "short" })).toContain(
      "Mật khẩu tạm phải có ít nhất 8 ký tự"
    )
  })

  it("rejects a password above 72 UTF-8 bytes even when it has fewer characters", () => {
    const accented = "ệ".repeat(25) // 25 characters, 75 bytes
    expect(accented.length).toBeLessThan(72)
    expect(messages({ ...valid, initialPassword: accented })).toContain(
      "Mật khẩu tạm quá dài (tối đa 72 byte, ký tự có dấu tính nhiều byte)"
    )
  })

  it("rejects a birth date that is not in the past and an invalid email", () => {
    expect(messages({ ...valid, dateOfBirth: "2999-01-01" })).toContain("Ngày sinh phải trước hôm nay")
    expect(messages({ ...valid, email: "not-an-email" })).toContain("Email không hợp lệ")
  })
})

describe("staff member errors and labels", () => {
  it("maps backend field paths to form fields", () => {
    const error = new ApiClientError("x", 400, 400, "Invalid", [
      { field: "initialPassword", code: "Size" },
      { field: "roleCodes[0]", code: "NotBlank" },
      { field: "unknown", code: "X" },
    ])
    expect(staffMemberFieldErrors(error).map((item) => item.field)).toEqual(["initialPassword", "roleCodes"])
    expect(staffMemberFieldErrors(new Error("x"))).toEqual([])
  })

  it("treats a create 409 as an unavailable role", () => {
    expect(isUnavailableRoleError(new ApiClientError("x", 409))).toBe(true)
    expect(isUnavailableRoleError(new ApiClientError("x", 400))).toBe(false)
  })

  it("labels known roles in Vietnamese and falls back for new ones", () => {
    expect(roleLabel("GENERAL_PRACTITIONER")).toBe("Bác sĩ đa khoa")
    expect(roleLabel("NURSE", { name: "Nurse" })).toBe("Nurse")
    expect(roleLabel("NURSE")).toBe("NURSE")
  })
})
