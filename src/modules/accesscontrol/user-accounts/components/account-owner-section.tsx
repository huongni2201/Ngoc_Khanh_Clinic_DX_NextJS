"use client"

import { useId, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Stethoscope02Icon, UserIcon } from "@hugeicons/core-free-icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { isApiErrorStatus } from "@/shared/api/api-client"
import {
  Info,
  InfoList,
  Lock,
  Search,
  SearchField,
  StatusPill,
  type InfoListItem,
} from "@/shared/ui"
import { useEligibleOwners } from "../hooks/use-user-accounts"
import {
  OWNER_KEYWORD_MAX_LENGTH,
  OWNER_KEYWORD_MIN_LENGTH,
} from "../schemas/create-user-account.schema"
import type { EligibleOwner, AccountType } from "../types"
import { ACCOUNT_TYPES } from "../types/transport"
import { ACCOUNT_TYPE_COPY, isAccountType } from "../utils/account-type"
import { formatLocalDate, initials } from "../utils/format"
import { RequiredMark } from "./required-mark"

const ACCOUNT_TYPE_ICONS: Record<AccountType, typeof UserIcon> = {
  STAFF: Stethoscope02Icon,
  PATIENT: UserIcon,
}

interface OwnerColumn {
  header: string
  value: (owner: EligibleOwner) => string | undefined
  mono?: boolean
}

/** Result columns after the code and name, per account type (SRS III.1.2.2 [3]). */
const DETAIL_COLUMNS: Record<AccountType, OwnerColumn[]> = {
  STAFF: [
    { header: "Khoa / phòng", value: (owner) => owner.departmentName },
    { header: "Số điện thoại", value: (owner) => owner.phone, mono: true },
    { header: "Email", value: (owner) => owner.email },
  ],
  PATIENT: [
    { header: "Ngày sinh", value: (owner) => formatLocalDate(owner.dateOfBirth) },
    { header: "Số điện thoại", value: (owner) => owner.phone, mono: true },
  ],
}

/** Read-only profile fields of the selected owner (SRS III.1.2.2 [4]). */
const PROFILE_FIELDS: Record<AccountType, (owner: EligibleOwner) => InfoListItem[]> = {
  STAFF: (owner) => [
    { label: "Số điện thoại", value: owner.phone, mono: true },
    { label: "Email", value: owner.email },
  ],
  PATIENT: (owner) => [
    { label: "Ngày sinh", value: formatLocalDate(owner.dateOfBirth) },
    { label: "Số điện thoại", value: owner.phone, mono: true },
  ],
}

interface AccountOwnerSectionProps {
  accountType: AccountType
  onAccountTypeChange: (accountType: AccountType) => void
  selectedOwner: EligibleOwner | null
  onSelectOwner: (owner: EligibleOwner) => void
  /** Validation message of the owner field. */
  ownerError?: string
}

export function AccountOwnerSection({
  accountType,
  onAccountTypeChange,
  selectedOwner,
  onSelectOwner,
  ownerError,
}: AccountOwnerSectionProps) {
  const id = useId()
  const [keyword, setKeyword] = useState("")
  const [submittedKeyword, setSubmittedKeyword] = useState<string | null>(null)
  const [keywordError, setKeywordError] = useState<string | null>(null)
  const eligibleOwners = useEligibleOwners(accountType, submittedKeyword)
  const copy = ACCOUNT_TYPE_COPY[accountType]

  const changeAccountType = (value: unknown) => {
    if (!isAccountType(value)) return
    setKeyword("")
    setSubmittedKeyword(null)
    setKeywordError(null)
    onAccountTypeChange(value)
  }

  const search = () => {
    const text = keyword.trim()
    if (text.length < OWNER_KEYWORD_MIN_LENGTH) {
      setKeywordError(`Nhập ít nhất ${OWNER_KEYWORD_MIN_LENGTH} ký tự để tìm.`)
      return
    }
    setKeywordError(null)
    if (text === submittedKeyword) void eligibleOwners.refetch()
    else setSubmittedKeyword(text)
  }

  const selectById = (ownerId: unknown) => {
    const owner = eligibleOwners.data?.items.find((item) => item.ownerId === ownerId)
    if (owner) onSelectOwner(owner)
  }

  const searchHintId = `${id}-search-hint`
  const searchErrorId = `${id}-search-error`
  const searchMessage = keywordError ?? ownerError

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p id={`${id}-type-label`} className="text-xs font-medium text-foreground">
          Loại tài khoản
          <RequiredMark />
        </p>
        <RadioGroup
          aria-labelledby={`${id}-type-label`}
          value={accountType}
          onValueChange={changeAccountType}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {ACCOUNT_TYPES.map((value) => {
            const checked = value === accountType
            const labelId = `${id}-type-${value}`
            return (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                  checked
                    ? "border-primary bg-selected ring-1 ring-primary"
                    : "border-border bg-card hover:bg-hover"
                )}
              >
                <RadioGroupItem
                  value={value}
                  aria-labelledby={labelId}
                  className="mt-0.5"
                />
                <span className="min-w-0 flex-1">
                  <span id={labelId} className="block text-sm font-semibold text-foreground">
                    {ACCOUNT_TYPE_COPY[value].label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {ACCOUNT_TYPE_COPY[value].description}
                  </span>
                </span>
                <HugeiconsIcon
                  icon={ACCOUNT_TYPE_ICONS[value]}
                  aria-hidden="true"
                  className={cn("size-[18px] shrink-0", checked ? "text-primary" : "text-muted-foreground")}
                />
              </label>
            )
          })}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${id}-keyword`} className="text-xs font-medium text-foreground">
          Tìm hồ sơ chủ tài khoản
          <RequiredMark />
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchField
            id={`${id}-keyword`}
            value={keyword}
            onChange={setKeyword}
            maxLength={OWNER_KEYWORD_MAX_LENGTH}
            placeholder={copy.searchPlaceholder}
            label="Tìm hồ sơ chủ tài khoản"
            describedBy={searchMessage ? `${searchErrorId} ${searchHintId}` : searchHintId}
            invalid={Boolean(searchMessage)}
            className="min-w-0 flex-1 sm:max-w-none"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                search()
              }
            }}
          />
          <Button type="button" variant="outline" onClick={search} className="sm:w-auto">
            <Search aria-hidden="true" />
            Tìm kiếm
          </Button>
        </div>
        {searchMessage ? (
          <p id={searchErrorId} className="text-xs text-destructive">
            {searchMessage}
          </p>
        ) : null}
        <p id={searchHintId} className="text-xs text-muted-foreground">
          {copy.searchHint}
        </p>
      </div>

      {submittedKeyword !== null ? (
        <EligibleOwnerResults
          idPrefix={id}
          accountType={accountType}
          isLoading={eligibleOwners.isFetching && !eligibleOwners.data}
          error={eligibleOwners.error}
          items={eligibleOwners.data?.items}
          limited={eligibleOwners.data?.limited ?? false}
          selectedOwnerId={selectedOwner?.ownerId}
          onSelect={selectById}
        />
      ) : null}

      {selectedOwner ? <SelectedOwnerPanel owner={selectedOwner} accountType={accountType} /> : null}
    </div>
  )
}

function EligibleOwnerResults({
  idPrefix,
  accountType,
  isLoading,
  error,
  items,
  limited,
  selectedOwnerId,
  onSelect,
}: {
  idPrefix: string
  accountType: AccountType
  isLoading: boolean
  error: Error | null
  items: EligibleOwner[] | undefined
  limited: boolean
  selectedOwnerId: string | undefined
  onSelect: (ownerId: unknown) => void
}) {
  const columns = DETAIL_COLUMNS[accountType]

  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Đang tìm hồ sơ" className="space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {isApiErrorStatus(error, 403)
            ? "Bạn không có quyền tìm hồ sơ chủ tài khoản."
            : "Không thể tìm hồ sơ. Vui lòng thử lại."}
        </AlertDescription>
      </Alert>
    )
  }
  if (!items || items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        Không tìm thấy hồ sơ đang hoạt động và chưa có tài khoản phù hợp với từ khóa.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <RadioGroup
        aria-label="Kết quả tìm hồ sơ chủ tài khoản"
        value={selectedOwnerId ?? ""}
        onValueChange={onSelect}
        className="block overflow-hidden rounded-lg border border-border"
      >
        <Table>
          <TableHeader className="bg-table-header-bg">
            <TableRow>
              <TableHead className="w-10">
                <span className="sr-only">Chọn</span>
              </TableHead>
              <TableHead>{ACCOUNT_TYPE_COPY[accountType].ownerCodeHeader}</TableHead>
              <TableHead>Họ và tên</TableHead>
              {columns.map((column) => (
                <TableHead key={column.header}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const selected = item.ownerId === selectedOwnerId
              const nameId = `${idPrefix}-owner-${item.ownerId}`
              return (
                <TableRow
                  key={item.ownerId}
                  data-state={selected ? "selected" : undefined}
                  onClick={() => onSelect(item.ownerId)}
                  className={cn("cursor-pointer", selected && "bg-selected hover:bg-selected")}
                >
                  <TableCell
                    className={cn(
                      "border-l-[3px]",
                      selected ? "border-l-primary" : "border-l-transparent"
                    )}
                  >
                    <RadioGroupItem value={item.ownerId} aria-labelledby={nameId} />
                  </TableCell>
                  <TableCell className="font-mono text-[13px]">{item.ownerCode}</TableCell>
                  <TableCell id={nameId} className="font-medium text-foreground">
                    {item.fullName}
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={column.header}
                      className={cn(column.mono && "font-mono text-[13px] tabular-nums")}
                    >
                      {column.value(item) ?? "—"}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </RadioGroup>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Chỉ hiển thị hồ sơ đang hoạt động và chưa có tài khoản.</span>
        <span>{items.length} kết quả</span>
      </div>
      {limited ? (
        <p className="text-xs text-status-warning">
          Có thể còn hồ sơ khác phù hợp. Vui lòng nhập từ khóa cụ thể hơn.
        </p>
      ) : null}
    </div>
  )
}

function SelectedOwnerPanel({
  owner,
  accountType,
}: {
  owner: EligibleOwner
  accountType: AccountType
}) {
  const copy = ACCOUNT_TYPE_COPY[accountType]
  const subtitle = [copy.label, owner.ownerCode, owner.departmentName]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="space-y-2">
      <div
        aria-label="Chủ tài khoản đã chọn"
        role="group"
        className="rounded-lg border border-border bg-surface-alt p-4"
      >
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          >
            {initials(owner.fullName)}
          </span>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-foreground">{owner.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
                <Lock aria-hidden="true" className="size-3" />
                Chỉ xem
              </span>
            </div>
            <InfoList
              className="grid grid-cols-1 gap-4 space-y-0 sm:grid-cols-3"
              items={[
                ...PROFILE_FIELDS[accountType](owner),
                { label: "Trạng thái hồ sơ", value: <StatusPill tone="success">Hoạt động</StatusPill> },
              ]}
            />
          </div>
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info aria-hidden="true" className="size-3.5 shrink-0" />
        Thông tin cá nhân được quản lý trong hồ sơ {copy.profileNoun} và không
        chỉnh sửa tại màn hình này.
      </p>
    </div>
  )
}

