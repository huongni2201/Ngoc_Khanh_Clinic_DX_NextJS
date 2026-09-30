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
