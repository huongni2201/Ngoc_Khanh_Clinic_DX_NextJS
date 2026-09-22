import { AuthResponse, AuthUser, LoginCredentials } from "../types"

const TOKEN_KEY = "nk_auth_token"
const USER_KEY = "nk_auth_user"

type AuthListener = () => void
const listeners = new Set<AuthListener>()

export function subscribeToAuth(callback: () => void) {
  listeners.add(callback)
  const handleStorage = () => callback()
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage)
  }
  return () => {
    listeners.delete(callback)
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage)
    }
  }
}

function notifyAuthChange() {
  listeners.forEach((callback) => callback())
}

export class AuthError extends Error {
  status: number

  constructor(message: string, status: number = 400) {
    super(message)
    this.name = "AuthError"
    this.status = status
  }
}

export interface AuthApi {
  login(credentials: LoginCredentials): Promise<AuthResponse>
  logout(): Promise<void>
  getCurrentUser(): AuthUser | null
  isAuthenticated(): boolean
}

let cachedUser: AuthUser | null = null
let cachedUserRaw: string | null = null

class AuthApiService implements AuthApi {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Network latency simulation
    await new Promise((resolve) => setTimeout(resolve, 600))

    const { username, password } = credentials

    // Simulate 401 Unauthorized for invalid test credentials
    if (
      username.toLowerCase() === "invalid" ||
      password === "wrong" ||
      password === "wrongpassword"
    ) {
      throw new AuthError("Tên đăng nhập hoặc mật khẩu không chính xác.", 401)
    }

    // Realistic auth response matching the system's admin persona (BS. Nguyễn Thị Lan)
    const user: AuthUser = {
      id: "usr-001",
      username: username,
      name: "BS. Nguyễn Thị Lan",
      role: "Quản trị hệ thống",
      email: `${username.toLowerCase()}@ngockhanhclinic.vn`,
    }

    const response: AuthResponse = {
      user,
      accessToken: `nk_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      expiresIn: 86400,
    }

    if (typeof window !== "undefined") {
      try {
        const rawUser = JSON.stringify(user)
        localStorage.setItem(TOKEN_KEY, response.accessToken)
        localStorage.setItem(USER_KEY, rawUser)
        cachedUserRaw = rawUser
        cachedUser = user
        notifyAuthChange()
      } catch {
        // localStorage might be unavailable in private browsing or constrained envs
      }
    }

    return response
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        cachedUserRaw = null
        cachedUser = null
        notifyAuthChange()
      } catch {
        // Ignore storage errors
      }
    }
  }

  getCurrentUser(): AuthUser | null {
    if (typeof window === "undefined") return null
    try {
      const data = localStorage.getItem(USER_KEY)
      if (data !== cachedUserRaw) {
        cachedUserRaw = data
        cachedUser = data ? JSON.parse(data) : null
      }
      return cachedUser
    } catch {
      return null
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false
    try {
      return Boolean(localStorage.getItem(TOKEN_KEY))
    } catch {
      return false
    }
  }
}

export const authApi = new AuthApiService()
