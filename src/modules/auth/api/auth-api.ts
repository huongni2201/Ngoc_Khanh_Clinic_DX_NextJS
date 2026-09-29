import { z } from "zod"
import { httpClient, HttpError } from "@/shared/api/http-client"
import { csrfEnvelopeSchema, sessionEnvelopeSchema } from "../schemas/session.schema"
import type { LoginCredentials, StaffSession } from "../types"

function parse<T>(schema: z.ZodType<T>, response: unknown): T {
  const result = schema.safeParse(response)
  if (!result.success) throw new HttpError("INVALID_RESPONSE", "Phản hồi máy chủ không hợp lệ. Vui lòng thử lại.")
  return result.data
}

export const authApi = {
  async csrf() {
    return parse(csrfEnvelopeSchema, await httpClient("/api/v1/auth/csrf")).data
  },
  async login(credentials: LoginCredentials): Promise<StaffSession> {
    const csrf = await authApi.csrf()
    return parse(sessionEnvelopeSchema, await httpClient("/api/v1/auth/staff/login", {
      method: "POST",
      headers: { [csrf.headerName]: csrf.token },
      body: JSON.stringify({ username: credentials.username, password: credentials.password }),
    })).data
  },
  async me(signal?: AbortSignal): Promise<StaffSession | null> {
    try {
      return parse(sessionEnvelopeSchema, await httpClient("/api/v1/auth/me", { signal })).data
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) return null
      throw error
    }
  },
  async logout(): Promise<void> {
    const csrf = await authApi.csrf()
    const response = await httpClient("/api/v1/auth/logout", {
      method: "POST", headers: { [csrf.headerName]: csrf.token },
    })
    if (response !== undefined) throw new HttpError("INVALID_RESPONSE", "Chưa xác nhận được đăng xuất. Vui lòng thử lại.")
  },
}
