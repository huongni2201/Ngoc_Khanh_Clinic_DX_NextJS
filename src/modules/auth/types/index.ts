export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface AuthUser {
  id: string
  username: string
  name: string
  role: string
  email?: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  expiresIn?: number
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}
