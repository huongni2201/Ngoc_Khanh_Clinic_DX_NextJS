"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi, AuthError, subscribeToAuth } from "../api/auth-api"
import { LoginCredentials } from "../types"

export function useAuth() {
  const queryClient = useQueryClient()

  // Use useSyncExternalStore to synchronize client-side auth state cleanly without cascading render warnings
  const isAuthenticated = React.useSyncExternalStore(
    subscribeToAuth,
    () => authApi.isAuthenticated(),
    () => false
  )

  const currentUser = React.useSyncExternalStore(
    subscribeToAuth,
    () => authApi.getCurrentUser(),
    () => null
  )

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await authApi.login(credentials)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data.user)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout()
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["auth"] })
    },
  })

  const getErrorMessage = (error: unknown): string => {
    if (!error) return ""
    if (error instanceof AuthError) {
      return error.message
    }
    if (error instanceof Error) {
      if ("status" in error && (error as { status: number }).status === 401) {
        return "Tên đăng nhập hoặc mật khẩu không chính xác."
      }
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

