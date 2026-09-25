"use client"

import * as React from "react"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Lock, Eye, EyeOff, Loader2, AlertCircle } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginSchema, type LoginFormValues } from "../schemas/login.schema"

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>
  isLoading?: boolean
  serverError?: string | null
  onClearServerError?: () => void
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  serverError,
  onClearServerError,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  })

  const isBusy = isLoading || isSubmitting

  const handleFormSubmit = async (values: LoginFormValues) => {
    await onSubmit(values)
  }

  const handleInputChange = () => {
    if (serverError && onClearServerError) {
      onClearServerError()
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      className="space-y-4 sm:space-y-5"
    >
      {/* 401 / Server Error Alert */}
      {serverError && (
        <Alert
          variant="destructive"
          className="py-2.5 px-3 rounded-lg border-destructive/20 bg-destructive/10 text-destructive text-xs flex items-center gap-2"
        >
          <AlertCircle className="size-4 shrink-0" />
          <AlertDescription className="text-xs font-medium">
            {serverError}
          </AlertDescription>
        </Alert>
      )}

      {/* Field 1: Username */}
      <div className="space-y-1.5 text-left">
        <Label
          htmlFor="username"
          className="text-xs sm:text-sm font-medium text-foreground inline-flex items-center gap-1"
        >
          Tên đăng nhập <span className="text-destructive font-semibold">*</span>
        </Label>
        <div className="relative flex items-center">
          <User
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="username"
            type="text"
            required
            autoComplete="username"
            disabled={isBusy}
            placeholder="Nhập tên đăng nhập"
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? "username-error" : undefined}
            className="h-10 pl-10 pr-3.5 text-sm"
            {...register("username", {
              onChange: handleInputChange,
            })}
          />
        </div>
        {errors.username && (
          <p
            id="username-error"
            role="alert"
            className="text-xs text-destructive font-medium mt-1"
          >
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Field 2: Password */}
      <div className="space-y-1.5 text-left">
        <Label
          htmlFor="password"
          className="text-xs sm:text-sm font-medium text-foreground inline-flex items-center gap-1"
        >
          Mật khẩu <span className="text-destructive font-semibold">*</span>
        </Label>
        <div className="relative flex items-center">
          <Lock
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            disabled={isBusy}
            placeholder="Nhập mật khẩu"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="h-10 pl-10 pr-11 text-sm"
            {...register("password", {
              onChange: handleInputChange,
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showPassword ? (
              <EyeOff className="size-4.5" aria-hidden="true" />
            ) : (
              <Eye className="size-4.5" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id="password-error"
            role="alert"
            className="text-xs text-destructive font-medium mt-1"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Option Row: Remember Me & Forgot Password */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="rememberMe"
            render={({ field }) => (
              <Checkbox
                id="rememberMe"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isBusy}
              />
            )}
          />
          <Label
            htmlFor="rememberMe"
            className="text-xs sm:text-sm text-secondary-foreground font-normal cursor-pointer select-none"
          >
            Ghi nhớ đăng nhập
          </Label>
        </div>

        <Link
          href="/forgot-password"
          className="text-xs sm:text-sm text-primary hover:underline font-medium transition-colors"
        >
          Quên mật khẩu?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isValid || isBusy}
        className="mt-1 h-10 w-full"
      >
        {isBusy ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Đang đăng nhập...
          </>
        ) : (
          "Đăng nhập"
        )}
      </Button>
    </form>
  )
}
