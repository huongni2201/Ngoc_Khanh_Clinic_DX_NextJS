"use client"

import { useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/auth-api"
import { useUserSession } from "./use-user-session"
import { errorMessage, HttpError } from "@/shared/api/http-client"
import { notifySessionChanged, replaceSession, SESSION_QUERY_KEY } from "../utils/session-cache"
import type { LoginCredentials } from "../types"

// 403 on sign-in/sign-out means the backend rejected the request origin (ADR-0014).
function authFailureMessage(error: unknown): string {
  if (error instanceof HttpError && error.status === 403) {
    return "Yêu cầu bị từ chối do nguồn truy cập không hợp lệ. Vui lòng tải lại trang."
  }
  if (error instanceof HttpError && error.status === 503) {
    return "Hệ thống đăng nhập tạm thời không khả dụng. Vui lòng thử lại sau."
  }
  return errorMessage(error)
}

export function useAuth() {
  const client = useQueryClient()
  const session = useUserSession()
  const busy = useRef(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [retryAt, setRetryAt] = useState(0)
  const mutation = useMutation({ mutationFn: authApi.login, retry: false, gcTime: 0 })
  const login = async (credentials: LoginCredentials) => {
    if (busy.current || Date.now() < retryAt) return
    busy.current = true
    setLoginError(null)
    try {
      await client.cancelQueries({ queryKey: SESSION_QUERY_KEY })
      const result = await mutation.mutateAsync(credentials)
      await replaceSession(client, result)
      notifySessionChanged()
    } catch (error) {
      setLoginError(error instanceof HttpError && error.status === 401
        ? "Tên đăng nhập hoặc mật khẩu không chính xác."
        : authFailureMessage(error))
      if (error instanceof HttpError && error.status === 429 && error.retryAfterSeconds) {
        setRetryAt(Date.now() + error.retryAfterSeconds * 1000)
      }
      throw error
    } finally {
      busy.current = false
      mutation.reset()
    }
  }
  return {
    currentUser: session.data,
    isAuthenticated: Boolean(session.data) && !session.isError,
    isCheckingAuth: session.isPending || (!session.isFetchedAfterMount && session.isFetching),
    sessionError: session.isError ? errorMessage(session.error) : null,
    retrySession: session.refetch,
    login,
    isLoggingIn: mutation.isPending,
    loginError,
    retryAt,
    resetLoginError: () => setLoginError(null),
  }
}

export function useLogout() {
  const client = useQueryClient()
  const busy = useRef(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const mutation = useMutation({ mutationFn: authApi.logout, retry: false, gcTime: 0 })
  const logout = async () => {
    if (busy.current) return false
    busy.current = true
    setLogoutError(null)
    try {
      await client.cancelQueries({ queryKey: SESSION_QUERY_KEY })
      await mutation.mutateAsync()
      await replaceSession(client, null)
      notifySessionChanged()
      return true
    } catch (error) {
      setLogoutError(authFailureMessage(error))
      return false
    } finally {
      busy.current = false
      mutation.reset()
    }
  }
  return { logout, logoutError, isLoggingOut: mutation.isPending }
}
