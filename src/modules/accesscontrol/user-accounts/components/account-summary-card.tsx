import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Lock, Plus, StatusPill } from "@/shared/ui"
import type { AccountOwnerCandidate, AccountType, AssignableRole } from "../types"
import { ACCOUNT_TYPE_COPY, selectsRoles } from "../utils/account-type"
import { formatMobileNumber } from "../utils/format"
import { PATIENT_ROLE_CODE, roleLabel } from "../utils/role-labels"

interface AccountSummaryCardProps {
  accountType: AccountType
  owner: AccountOwnerCandidate | null
  username: string
  roles: AssignableRole[]
  isSubmitting: boolean
  /** True when the account cannot be created as entered, e.g. the owner has no SMS number. */
  submitBlocked: boolean
  onCancel: () => void
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-divider py-3 last:border-b-0">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-foreground">{children}</dd>
    </div>
  )
}

const EMPTY = <span className="text-muted-foreground">—</span>

/** Right rail: what will be created, and the submit and cancel actions of the form. */
export function AccountSummaryCard({
  accountType,
  owner,
  username,
  roles,
  isSubmitting,
  submitBlocked,
  onCancel,
}: AccountSummaryCardProps) {
  const smsNumber = formatMobileNumber(owner?.smsPhoneNumber)

  return (
    <Card
      role="complementary"
      aria-labelledby="account-summary-title"
      className="gap-0 py-0 xl:sticky xl:top-0"
    >
      <CardHeader className="border-b border-border px-5 py-3.5 [.border-b]:pb-3.5">
        <h2
          id="account-summary-title"
          className="text-xs font-semibold uppercase tracking-wide text-secondary-text"
        >
          Tóm tắt tài khoản
        </h2>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5 pt-2">
        <dl>
          <SummaryRow label="Loại tài khoản">{ACCOUNT_TYPE_COPY[accountType].label}</SummaryRow>
          <SummaryRow label="Chủ tài khoản">
            {owner ? (
              <>
                <span className="block font-medium">{owner.fullName}</span>
                <span className="block font-mono text-xs text-muted-foreground">
                  {owner.ownerCode}
                </span>
              </>
            ) : (
              EMPTY
            )}
          </SummaryRow>
          <SummaryRow label="Tên đăng nhập">
            {username ? <span className="break-all font-mono">{username}</span> : EMPTY}
          </SummaryRow>
          <SummaryRow label="Vai trò">
            {!selectsRoles(accountType) ? (
              <Badge variant="secondary">{roleLabel(PATIENT_ROLE_CODE)}</Badge>
            ) : roles.length > 0 ? (
              <span className="flex flex-wrap justify-end gap-1">
                {roles.map((role) => (
                  <Badge key={role.roleId} variant="secondary">
                    {roleLabel(role.code, role.name)}
                  </Badge>
                ))}
              </span>
            ) : (
              EMPTY
            )}
          </SummaryRow>
          <SummaryRow label="Gửi SMS tới">
            {smsNumber ? <span className="font-mono tabular-nums">{smsNumber}</span> : EMPTY}
          </SummaryRow>
          <SummaryRow label="Trạng thái sau khi tạo">
            <StatusPill tone="success">Hoạt động</StatusPill>
          </SummaryRow>
        </dl>

        <div className="space-y-2">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting || submitBlocked}
          >
            <Plus aria-hidden="true" />
            {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
        </div>

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Lock aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          Mật khẩu được lưu dưới dạng mã hóa và chỉ gửi cho chủ tài khoản qua SMS.
        </p>
      </CardContent>
    </Card>
  )
}
