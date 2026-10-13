"use client"

import { useEffect, useId, useState } from "react"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { SmartPhone01Icon, SparklesIcon } from "@hugeicons/core-free-icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "@/shared/ui"
import { useUsernameAvailability } from "../hooks/use-user-accounts"
import {
  USERNAME_MAX_LENGTH,
  isWellFormedUsername,
  type CreateUserAccountFormValues,
} from "../schemas/create-user-account.schema"
import type { AccountOwnerCandidate } from "../types"
import { formatMobileNumber } from "../utils/format"
import { RequiredMark } from "./required-mark"

const AVAILABILITY_DEBOUNCE_MS = 400

interface SignInCredentialsSectionProps {
  register: UseFormRegister<CreateUserAccountFormValues>
  errors: FieldErrors<CreateUserAccountFormValues>
  /** Current username value, for the availability check. */
  username: string
  onGeneratePassword: () => void
  selectedOwner: AccountOwnerCandidate | null
}

export function SignInCredentialsSection({
  register,
  errors,
  username,
  onGeneratePassword,
  selectedOwner,
}: SignInCredentialsSectionProps) {
  const id = useId()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [checkedUsername, setCheckedUsername] = useState<string | null>(null)

  useEffect(() => {
    const candidate = isWellFormedUsername(username) ? username : null
    const timer = window.setTimeout(() => setCheckedUsername(candidate), AVAILABILITY_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [username])

  const availability = useUsernameAvailability(checkedUsername)
  const usernameError = errors.username?.message
  const passwordError = errors.temporaryPassword?.message
  const upToDate = checkedUsername !== null && checkedUsername === username
  const available = upToDate && !usernameError ? availability.data : undefined

  const usernameHintId = `${id}-username-hint`
  const passwordHintId = `${id}-password-hint`
  const smsNumber = formatMobileNumber(selectedOwner?.smsPhoneNumber)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-username`} className="text-xs font-medium text-foreground">
            Tên đăng nhập
            <RequiredMark />
          </Label>
          <div className="relative">
            <Input
              id={`${id}-username`}
              autoComplete="off"
              spellCheck={false}
              placeholder="VD: nguyen.van.a"
              maxLength={USERNAME_MAX_LENGTH}
              {...register("username")}
              aria-invalid={usernameError || available === false ? true : undefined}
              aria-describedby={usernameHintId}
              className={cn(
                "pr-9",
                available === true && "border-status-success focus-visible:border-status-success"
              )}
            />
            {available === true ? (
              <CheckCircle2
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-status-success"
              />
            ) : null}
          </div>
          <p id={usernameHintId} aria-live="polite" className="text-xs">
            {usernameError ? (
              <span className="text-destructive">{usernameError}</span>
            ) : upToDate && availability.isFetching ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                Đang kiểm tra tên đăng nhập...
              </span>
            ) : available === true ? (
              <span className="inline-flex items-center gap-1 text-status-success">
                <CheckCircle2 aria-hidden="true" className="size-3.5" />
                Tên đăng nhập có thể sử dụng
              </span>
            ) : available === false ? (
              <span className="inline-flex items-center gap-1 text-destructive">
                <XCircle aria-hidden="true" className="size-3.5" />
                Tên đăng nhập đã tồn tại
              </span>
            ) : (
              <span className="text-muted-foreground">
                Chữ không dấu, chữ số hoặc ký hiệu; phân biệt chữ hoa, chữ thường.
              </span>
            )}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-password`} className="text-xs font-medium text-foreground">
            Mật khẩu tạm thời
            <RequiredMark />
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Input
                id={`${id}-password`}
                type={passwordVisible ? "text" : "password"}
                autoComplete="new-password"
                spellCheck={false}
                {...register("temporaryPassword")}
                aria-invalid={passwordError ? true : undefined}
                aria-describedby={passwordHintId}
                className="pr-20 font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-pressed={passwordVisible}
                aria-label={passwordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-primary"
              >
                {passwordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                {passwordVisible ? "Ẩn" : "Hiện"}
              </Button>
            </div>
            <Button type="button" variant="outline" onClick={onGeneratePassword}>
              <HugeiconsIcon icon={SparklesIcon} aria-hidden="true" />
              Tạo ngẫu nhiên
            </Button>
          </div>
          <p id={passwordHintId} className="text-xs">
            {passwordError ? (
              <span className="text-destructive">{passwordError}</span>
            ) : (
              <span className="text-muted-foreground">
                Mật khẩu chỉ gửi cho chủ tài khoản qua SMS và không hiển thị lại sau khi tạo.
              </span>
            )}
          </p>
        </div>
      </div>

      {!selectedOwner ? (
        <Alert role="status" className="border-info/30 bg-info-bg text-info">
          <HugeiconsIcon icon={SmartPhone01Icon} aria-hidden="true" />
          <AlertDescription className="text-info">
            Chọn chủ tài khoản để xem số điện thoại nhận thông tin đăng nhập.
          </AlertDescription>
        </Alert>
      ) : smsNumber ? (
        <Alert role="status" className="border-info/30 bg-info-bg text-info">
          <HugeiconsIcon icon={SmartPhone01Icon} aria-hidden="true" />
          <AlertDescription className="text-info">
            Thông tin đăng nhập sẽ được gửi qua SMS tới số{" "}
            <strong className="font-mono font-semibold tabular-nums">{smsNumber}</strong> của chủ tài
            khoản. Mật khẩu tạm thời không hiển thị lại sau khi tạo.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertDescription>
            Hồ sơ chưa có số di động hợp lệ để nhận SMS nên chưa thể tạo tài khoản. Vui lòng cập nhật
            số điện thoại trong hồ sơ trước.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
