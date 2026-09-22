import * as React from "react"
import Image from "next/image"
import { Headphones } from "lucide-react"
import { LoginForm } from "./login-form"
import { LoginFormValues } from "../schemas/login.schema"

interface LoginCardProps {
  onSubmit: (values: LoginFormValues) => Promise<void>
  isLoading?: boolean
  serverError?: string | null
  onClearServerError?: () => void
}

export function LoginCard({
  onSubmit,
  isLoading = false,
  serverError,
  onClearServerError,
}: LoginCardProps) {
  return (
    <div className="relative z-10 w-full max-w-[480px] sm:max-w-[520px] rounded-2xl border border-login-card-border bg-card p-6 sm:p-10 shadow-xs transition-shadow">
      {/* 1. Header: Clinic Logo & Brand */}
      <div className="flex items-center justify-center gap-3.5 mb-6 sm:mb-8">
        <div className="relative size-12 sm:size-14 shrink-0">
          <Image
            src="/images/logo.png"
            alt="Ngọc Khánh Clinic Logo"
            width={56}
            height={56}
            className="size-full object-contain"
            priority
          />
        </div>
        <div className="flex flex-col text-left">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight">
            Ngọc Khánh <span className="text-primary font-bold">Clinic</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
            Quản lý khám sức khỏe doanh nghiệp
          </p>
        </div>
      </div>

      {/* 2. Title & Subtitle */}
      <div className="text-center space-y-1 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Đăng nhập hệ thống
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Vui lòng đăng nhập để tiếp tục sử dụng hệ thống.
        </p>
      </div>

      {/* 3. Form */}
      <LoginForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        serverError={serverError}
        onClearServerError={onClearServerError}
      />

      {/* 4. Card Footer: Support Notice */}
      <div className="mt-6 sm:mt-8 pt-4 border-t border-border/60 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Headphones className="size-4 text-primary shrink-0" aria-hidden="true" />
        <span>Cần hỗ trợ? Liên hệ quản trị viên hệ thống.</span>
      </div>
    </div>
  )
}
