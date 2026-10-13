"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, Check, InfoList, Plus, StatusPill } from "@/shared/ui"
import type { AccountOwnerCandidate, CreatedUserAccount } from "../types"
import { ACCOUNT_TYPE_COPY } from "../utils/account-type"
import { formatMobileNumber } from "../utils/format"
import { roleLabel } from "../utils/role-labels"

interface AccountCreatedResultProps {
  account: CreatedUserAccount
  owner: AccountOwnerCandidate
  /** Display names of the granted role codes, from the assignable role list. */
  roleNames: Record<string, string>
  onCreateAnother: () => void
}

export function AccountCreatedResult({
  account,
  owner,
  roleNames,
  onCreateAnother,
}: AccountCreatedResultProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => headingRef.current?.focus(), [])

  return (
    <Card
      role="region"
      aria-labelledby="account-created-title"
      className="mx-auto w-full max-w-2xl gap-5 p-6 sm:p-8"
    >
      <div className="space-y-2 text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex size-14 items-center justify-center rounded-full bg-status-success-bg text-status-success"
        >
          <Check className="size-6" />
        </span>
        <h2
          id="account-created-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-semibold text-foreground outline-none"
        >
          Đã tạo tài khoản thành công
        </h2>
        <p className="text-sm text-secondary-text">
          Tài khoản <strong className="font-mono font-semibold">{account.username}</strong> đã được
          tạo và có thể đăng nhập ngay.
        </p>
      </div>

      {account.smsDelivered ? (
        <Alert role="status" className="border-status-success/30 bg-status-success-bg text-status-success">
          <Check aria-hidden="true" />
          <AlertDescription className="text-status-success">
            Đã gửi thông tin đăng nhập qua SMS tới số{" "}
            <span className="font-mono">{formatMobileNumber(owner.smsPhoneNumber)}</span>.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-status-warning/30 bg-status-warning-bg text-status-warning">
          <AlertTriangle aria-hidden="true" />
          <AlertDescription className="text-status-warning">
            <strong className="font-semibold">Chưa gửi được SMS thông tin đăng nhập.</strong> Tài
            khoản vẫn được tạo. Hãy dùng chức năng Đặt lại mật khẩu để gửi lại mật khẩu tạm cho chủ
            tài khoản.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg bg-muted p-5">
        <InfoList
          className="grid grid-cols-1 gap-4 space-y-0 sm:grid-cols-2"
          items={[
            {
              label: "Chủ tài khoản",
              value: (
                <>
                  {owner.fullName} · <span className="font-mono">{owner.ownerCode}</span>
                </>
              ),
            },
            { label: "Loại tài khoản", value: ACCOUNT_TYPE_COPY[account.accountType].label },
            {
              label: "Vai trò",
              value: (
                <span className="flex flex-wrap gap-1">
                  {account.roleCodes.map((code) => (
                    <Badge key={code} variant="outline">
                      {roleLabel(code, roleNames[code])}
                    </Badge>
                  ))}
                </span>
              ),
            },
            {
              label: "Trạng thái",
              value:
                account.status === "ACTIVE" ? (
                  <StatusPill tone="success">Hoạt động</StatusPill>
                ) : (
                  <StatusPill>{account.status}</StatusPill>
                ),
            },
          ]}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" render={<Link href="/dashboard" />} nativeButton={false}>
          Về trang tổng quan
        </Button>
        <Button type="button" onClick={onCreateAnother}>
          <Plus aria-hidden="true" />
          Tạo tài khoản khác
        </Button>
      </div>
    </Card>
  )
}
