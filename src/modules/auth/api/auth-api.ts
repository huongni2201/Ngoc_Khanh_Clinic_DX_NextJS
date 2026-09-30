import { ApiClientError } from "@/shared/api/api-client"
import type { AuthUser, LoginCredentials } from "../types"

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    void credentials
    throw new ApiClientError("Backend chưa cung cấp API đăng nhập.", 501)
  },

  async logout(): Promise<void> {},

  getCurrentUser(): AuthUser | null {
    return null
  },

  isAuthenticated(): boolean {
    return false
  },
}
