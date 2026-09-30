"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiClientError } from "@/shared/api/api-client"
import { authApi } from "../api/auth-api"
import type { LoginCredentials } from "../types"

export function useAuth() {
  const queryClient = useQueryClient()

  const currentUser = authApi.getCurrentUser()
  const isAuthenticated = authApi.isAuthenticated()

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout()
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })

  const getErrorMessage = (error: unknown): string => {
    if (!error) return ""
    if (error instanceof ApiClientError && error.status === 401) {
      return "Tên đăng nhập hoặc mật khẩu không chính xác."
    }
    if (error instanceof Error) {
      return error.message
    }
    return "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại."
  }

  return {
    currentUser,
    isAuthenticated,
    isCheckingAuth: false,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? getErrorMessage(loginMutation.error) : null,
    resetLoginError: loginMutation.reset,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  }
}
