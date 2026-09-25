import * as React from "react"
import Image from "next/image"
import { Headphones } from "@/shared/ui/product-icon"
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
    <div className="relative z-10 w-full max-w-[440px] rounded-lg border border-border bg-card p-6 sm:p-8">
      {/* 1. Header: Clinic Logo & Brand */}
      <div className="mb-7 flex items-center gap-3.5">
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
            Quản lý khám sức khỏe đơn vị
          </p>
        </div>
      </div>

      {/* 2. Title & Subtitle */}
      <div className="mb-6 space-y-1 text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
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
      <div className="mt-7 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <Headphones className="size-4 text-primary shrink-0" aria-hidden="true" />
        <span>Cần hỗ trợ? Liên hệ quản trị viên hệ thống.</span>
      </div>
    </div>
  )
}

