import { describe, expect, it } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"
import { createUserAccountSchema } from "../schemas/create-user-account.schema"
import { GENERATED_PASSWORD_LENGTH, generateTemporaryPassword } from "../utils/temporary-password"
import { describeCreateUserAccountError } from "../utils/user-account-errors"
import { roleLabel } from "../utils/role-labels"

const VALID = {
  accountType: "STAFF" as const,
  ownerId: "owner",
  username: "nguyen.van.a",
  temporaryPassword: "abc",
  roleIds: ["role"],
}

function messages(values: Record<string, unknown>) {
  const result = createUserAccountSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe("create user account schema", () => {
  it("accepts any non-blank password: there is no complexity policy", () => {
    expect(messages(VALID)).toEqual([])
    expect(messages({ ...VALID, temporaryPassword: "a" })).toEqual([])
  })

  it("rejects a blank password", () => {
    expect(messages({ ...VALID, temporaryPassword: "   " })).toEqual([
      "Mật khẩu tạm thời là bắt buộc",
    ])
  })

  it("requires a role for a staff account only", () => {
    expect(messages({ ...VALID, roleIds: [] })).toEqual([
      "Chọn ít nhất một vai trò cho tài khoản nhân viên",
    ])
    expect(messages({ ...VALID, accountType: "PATIENT", roleIds: [] })).toEqual([])
  })

  it.each(["nguyễn.văn.a", " nguyen", "nguyen ", ""])(
    "rejects the username %j like the backend",
    (username) => {
      expect(messages({ ...VALID, username })).not.toEqual([])
    }
  )

  it("requires an owner", () => {
    expect(messages({ ...VALID, ownerId: "" })).toEqual(["Vui lòng chọn hồ sơ chủ tài khoản"])
  })
})

describe("temporary password generator", () => {
  it("creates random passwords of each character kind without confusable characters", () => {
    const generated = new Set<string>()
    for (let index = 0; index < 1000; index += 1) {
      const password = generateTemporaryPassword()
      expect(password).toHaveLength(GENERATED_PASSWORD_LENGTH)
      expect(password).toMatch(/[A-Z]/)
      expect(password).toMatch(/[a-z]/)
      expect(password).toMatch(/[0-9]/)
      expect(password).toMatch(/[^A-Za-z0-9]/)
      expect(password).not.toMatch(/[0O1lI]/)
      generated.add(password)
    }
    expect(generated.size).toBe(1000)
  })
})

describe("create user account errors", () => {
  const conflict = (message: string) => new ApiClientError("x", 409, 409, message)

  it.each([
    ["Username already exists", "username-taken"],
    ["Account owner already has an account", "owner-linked"],
    ["Account owner is not active", "owner-inactive"],
    ["Account owner has no valid mobile phone number", "owner-without-mobile"],
    ["Role is not assignable", "role-not-assignable"],
    ["Something else", "unknown"],
  ])("maps the 409 message %j to %s", (message, kind) => {
    expect(describeCreateUserAccountError(conflict(message)).kind).toBe(kind)
  })

  it("never shows the English backend text", () => {
    const failure = describeCreateUserAccountError(conflict("Username already exists"))
    expect(failure.message).not.toContain("Username")
  })

  it("maps other statuses", () => {
    expect(describeCreateUserAccountError(new ApiClientError("x", 403)).kind).toBe("forbidden")
    expect(describeCreateUserAccountError(new ApiClientError("x", 404)).kind).toBe("owner-not-found")
    expect(describeCreateUserAccountError(new ApiClientError("x", 400)).kind).toBe("invalid")
    expect(describeCreateUserAccountError(new Error("x")).kind).toBe("unknown")
  })
})

describe("role labels", () => {
  it("shows Nurse as Điều dưỡng and falls back to the backend name", () => {
    expect(roleLabel("NURSE")).toBe("Điều dưỡng")
    expect(roleLabel("NEW_ROLE", "New role")).toBe("New role")
  })
})
