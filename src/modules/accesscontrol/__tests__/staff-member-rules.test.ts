import { describe, expect, it } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"
import { createStaffMemberSchema, EMPTY_CREATE_STAFF_MEMBER_FORM } from "../schemas/staff-member.schema"
import { previewUsernameBase } from "../utils/username-preview"
import {
  createStaffMemberErrorMessage,
  isDuplicateIdentityError,
  isUnavailableRoleError,
  staffMemberFieldErrors,
} from "../utils/staff-member-errors"
import { roleLabel } from "../utils/staff-member-labels"

const valid = {
  ...EMPTY_CREATE_STAFF_MEMBER_FORM,
  fullName: "Nguyễn Văn An",
  initialPassword: "Tam@12345",
  roleCode: "RECEPTIONIST",
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

  it("accepts only Vietnamese alphabet names, a role and an 8 character password", () => {
    const nameRule = "Họ và tên chỉ gồm chữ cái tiếng Việt, dấu cách, dấu chấm, dấu nháy hoặc gạch nối"
    for (const name of ["123", "王小明", "Øyvind", "Straße", "Æsa", "Łukasz", "An 2", "An_B", ". -"]) {
      expect(messages({ ...valid, fullName: name }), name).toContain(nameRule)
    }
    for (const name of [
      "Đặng Thị Đào",
      "NGUYỄN VĂN AN",
      "Lê-Văn O'Neil",
      "Trần T. Bình",
      "Nguyễn Văn An",
    ]) {
      expect(messages({ ...valid, fullName: name }), name).toEqual([])
    }
    expect(messages({ ...valid, roleCode: "" })).toContain("Vui lòng chọn một vai trò")
    expect(messages({ ...valid, initialPassword: "short" })).toContain(
      "Mật khẩu tạm phải có ít nhất 8 ký tự"
    )
  })

  it("accepts only printable ASCII passwords without spaces, up to 72 characters", () => {
    const ascii = "Mật khẩu tạm chỉ gồm chữ không dấu, số và ký hiệu, không có dấu cách"
    for (const password of ["Mậtkhẩu123", "Tam 12345", "Tam\t12345", "ệ".repeat(25)]) {
      expect(messages({ ...valid, initialPassword: password })).toContain(ascii)
    }
    expect(messages({ ...valid, initialPassword: "a".repeat(73) })).toContain(
      "Mật khẩu tạm không được vượt quá 72 ký tự"
    )
    expect(messages({ ...valid, initialPassword: "A1!~" + "x".repeat(68) })).toEqual([])
  })

  it("rejects a birth date that is not in the past and an invalid email", () => {
    expect(messages({ ...valid, dateOfBirth: "2999-01-01" })).toContain("Ngày sinh phải trước hôm nay")
    expect(messages({ ...valid, email: "not-an-email" })).toContain("Thư điện tử không hợp lệ")
  })
})

describe("staff member errors and labels", () => {
  it("maps backend field paths to form fields", () => {
    const error = new ApiClientError("x", 400, 400, "Invalid", [
      { field: "initialPassword", code: "Size" },
      { field: "roleCode", code: "NotBlank" },
      { field: "unknown", code: "X" },
    ])
    expect(staffMemberFieldErrors(error).map((item) => item.field)).toEqual(["initialPassword", "roleCode"])
    expect(staffMemberFieldErrors(new Error("x"))).toEqual([])
  })

  it("tells an unavailable role (422) from a duplicate identity (409) by the status code", () => {
    const failure = (status: number) => new ApiClientError("x", status, status, "Failure")

    expect(isUnavailableRoleError(failure(422))).toBe(true)
    expect(isDuplicateIdentityError(failure(422))).toBe(false)
    expect(isDuplicateIdentityError(failure(409))).toBe(true)
    expect(isUnavailableRoleError(failure(409))).toBe(false)
    expect(isUnavailableRoleError(failure(400))).toBe(false)
    expect(createStaffMemberErrorMessage(failure(409))).toContain("vừa bị trùng")
    expect(createStaffMemberErrorMessage(failure(422))).toContain(
      "Vai trò đã chọn không còn khả dụng"
    )
  })

  it("labels known roles in Vietnamese and falls back for new ones", () => {
    expect(roleLabel("GENERAL_PRACTITIONER")).toBe("Bác sĩ đa khoa")
    expect(roleLabel("NURSE")).toBe("Điều dưỡng")
    expect(roleLabel("PHARMACIST", { name: "Pharmacist" })).toBe("Pharmacist")
    expect(roleLabel("PHARMACIST")).toBe("PHARMACIST")
  })
})
