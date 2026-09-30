import { afterEach, describe, expect, it } from "vitest"
import { authApi } from "../api/auth-api"

afterEach(() => localStorage.clear())

describe("authApi", () => {
  it("does not manufacture a user or persist a fake token", async () => {
    await expect(
      authApi.login({ username: "staff", password: "secret" })
    ).rejects.toMatchObject({
      status: 501,
      message: "Backend chưa cung cấp API đăng nhập.",
    })

    expect(localStorage.getItem("nk_auth_token")).toBeNull()
    expect(localStorage.getItem("nk_auth_user")).toBeNull()
  })
})
