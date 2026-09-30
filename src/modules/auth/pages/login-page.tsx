"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { LoginBackgroundDecorations } from "../components/login-background-decorations"
import { LoginCard } from "../components/login-card"
import { useAuth } from "../hooks/use-auth"
import { LoginFormValues } from "../schemas/login.schema"
import { canAccessStaffWorkspace } from "../utils/staff-workspace-access"
import { SessionAccessNotice } from "../components/session-access-notice"

export function LoginPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    currentUser,
    isCheckingAuth,
    login,
    isLoggingIn,
    loginError,
    resetLoginError,
    retryAt,
    sessionError,
    retrySession,
  } = useAuth()

  // Only staff with effective assignments enter the internal workspace.
  React.useEffect(() => {
    if (!isCheckingAuth && isAuthenticated && canAccessStaffWorkspace(currentUser)) {
      router.replace("/organizations")
    }
  }, [isAuthenticated, isCheckingAuth, currentUser, router])

  const handleLoginSubmit = async (values: LoginFormValues) => {
    try {
      await login({
        username: values.username,
        password: values.password,
      })
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

  if (sessionError) {
    return (
      <div className="m-auto max-w-md p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {sessionError}
            <Button className="mt-3" variant="outline" onClick={() => void retrySession()}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isAuthenticated && currentUser) {
    if (!canAccessStaffWorkspace(currentUser)) return <SessionAccessNotice session={currentUser} />
    return <div role="status" className="m-auto p-6 text-muted-foreground">Đang chuyển đến khu vực nhân viên…</div>
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
          retryAt={retryAt}
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
