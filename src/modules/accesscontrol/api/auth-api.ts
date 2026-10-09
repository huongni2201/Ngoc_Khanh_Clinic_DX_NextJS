import { z } from "zod"
import { httpClient, HttpError } from "@/shared/api/http-client"
import { sessionEnvelopeSchema } from "../schemas/session.schema"
import type { LoginCredentials, UserSession } from "../types"

function parse<T>(schema: z.ZodType<T>, response: unknown): T {
  const result = schema.safeParse(response)
  if (!result.success) throw new HttpError("INVALID_RESPONSE", "Phản hồi máy chủ không hợp lệ. Vui lòng thử lại.")
  return result.data
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<UserSession> {
    return parse(sessionEnvelopeSchema, await httpClient("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: credentials.username, password: credentials.password }),
    })).data
  },
  async me(signal?: AbortSignal): Promise<UserSession | null> {
    try {
      return parse(sessionEnvelopeSchema, await httpClient("/api/v1/auth/me", { signal })).data
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) return null
      throw error
    }
  },
  async logout(): Promise<void> {
    const response = await httpClient("/api/v1/auth/logout", { method: "POST" })
    if (response !== undefined) throw new HttpError("INVALID_RESPONSE", "Chưa xác nhận được đăng xuất. Vui lòng thử lại.")
  },
}
