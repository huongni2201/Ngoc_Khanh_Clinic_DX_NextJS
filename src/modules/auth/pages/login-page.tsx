"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LoginBackgroundDecorations } from "../components/login-background-decorations"
import { LoginCard } from "../components/login-card"
import { useAuth } from "../hooks/use-auth"

export function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isCheckingAuth } = useAuth()

  // Redirect to dashboard if user is already authenticated
  React.useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, isCheckingAuth, router])

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
          unavailableMessage="Backend chưa cung cấp API đăng nhập. Vui lòng liên hệ quản trị viên hệ thống."
        />
      </div>

      {/* Outer Page Footer */}
      <footer className="relative z-10 w-full text-center text-xs text-muted-foreground pt-4 pb-2">
        © 2026 Ngọc Khánh Clinic. Tất cả quyền được bảo lưu.
      </footer>
    </div>
  )
}
