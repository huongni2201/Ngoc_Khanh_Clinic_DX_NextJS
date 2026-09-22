"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LoginBackgroundDecorations } from "../components/login-background-decorations"
import { LoginCard } from "../components/login-card"
import { useAuth } from "../hooks/use-auth"
import { LoginFormValues } from "../schemas/login.schema"

export function LoginPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    isCheckingAuth,
    login,
    isLoggingIn,
    loginError,
    resetLoginError,
  } = useAuth()

  // Redirect to dashboard if user is already authenticated
  React.useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, isCheckingAuth, router])

  const handleLoginSubmit = async (values: LoginFormValues) => {
    try {
      await login({
        username: values.username,
        password: values.password,
        rememberMe: values.rememberMe,
      })
      router.push("/dashboard")
    } catch {
      // Error is caught and surfaced via loginError in useAuth hook
    }
  }

  // Prevent flash while checking existing authentication state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-background px-4 py-8 sm:py-12 overflow-x-hidden">
      {/* Subtle Background Shapes & Dot Grids */}
      <LoginBackgroundDecorations />

      {/* Spacer for vertical centering */}
      <div className="w-full flex-1 flex items-center justify-center py-4 sm:py-8">
        <LoginCard
          onSubmit={handleLoginSubmit}
          isLoading={isLoggingIn}
          serverError={loginError}
          onClearServerError={resetLoginError}
        />
      </div>

      {/* Outer Page Footer */}
      <footer className="relative z-10 w-full text-center text-xs text-muted-foreground pt-4 pb-2">
        © 2026 Ngọc Khánh Clinic. Tất cả quyền được bảo lưu.
      </footer>
    </div>
  )
}
