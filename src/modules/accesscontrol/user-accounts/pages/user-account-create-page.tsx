"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, PageHeader, ScreenLayout, ShieldCheck } from "@/shared/ui"
import { useCachedUserSession } from "../../hooks/use-cached-user-session"
import { hasStaffPermission } from "../../utils/staff-workspace-access"
import { AccountCreatedResult } from "../components/account-created-result"
import { AccountOwnerSection } from "../components/account-owner-section"
import { AccountSummaryCard } from "../components/account-summary-card"
import { InitialRolesSection } from "../components/initial-roles-section"
import { SectionCard } from "../components/section-card"
import { SignInCredentialsSection } from "../components/sign-in-credentials-section"
import { useAssignableRoles, useCreateUserAccount } from "../hooks/use-user-accounts"
import { userAccountKeys } from "../query-keys"
import {
  createUserAccountSchema,
  EMPTY_CREATE_USER_ACCOUNT_VALUES,
  type CreateUserAccountFormValues,
} from "../schemas/create-user-account.schema"
import type { EligibleOwner, AccountType, CreatedUserAccount } from "../types"
import { selectsRoles } from "../utils/account-type"
import { USER_ACCOUNT_CREATE_PERMISSION } from "../utils/permissions"
import { generateTemporaryPassword } from "../utils/temporary-password"
import { describeCreateUserAccountError } from "../utils/user-account-errors"

const PAGE_DESCRIPTION =
  "Cấp tài khoản đăng nhập cho nhân viên hoặc bệnh nhân đã có hồ sơ trong hệ thống."

interface CreatedAccount {
  account: CreatedUserAccount
  owner: EligibleOwner
  roleNames: Record<string, string>
}

function Header({ step }: { step: string }) {
  return (
    <PageHeader
      breadcrumbs={[{ label: "Quản trị" }, { label: "Tài khoản người dùng" }, { label: step }]}
      title="Tạo tài khoản người dùng"
      description={PAGE_DESCRIPTION}
    />
  )
}

/** UC-005 Create User Account: an Administrator links a new account to an existing profile. */
export function UserAccountCreatePage() {
  const session = useCachedUserSession()
  const [created, setCreated] = useState<CreatedAccount | null>(null)

  if (!hasStaffPermission(session, USER_ACCOUNT_CREATE_PERMISSION)) {
    return (
      <ScreenLayout>
        <Header step="Tạo tài khoản" />
        <Alert variant="destructive" className="max-w-2xl">
          <ShieldCheck aria-hidden="true" />
          <AlertTitle>Không có quyền truy cập</AlertTitle>
          <AlertDescription>
            Bạn không có quyền tạo tài khoản người dùng. Vui lòng liên hệ quản trị viên nếu cần cấp
            quyền.
          </AlertDescription>
        </Alert>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout>
      <Header step={created ? "Kết quả" : "Tạo tài khoản"} />
      {created ? (
        <AccountCreatedResult
          account={created.account}
          owner={created.owner}
          roleNames={created.roleNames}
          onCreateAnother={() => setCreated(null)}
        />
      ) : (
        <CreateUserAccountForm onCreated={setCreated} />
      )}
    </ScreenLayout>
  )
}

function CreateUserAccountForm({ onCreated }: { onCreated: (created: CreatedAccount) => void }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const createAccount = useCreateUserAccount()
  const [selectedOwner, setSelectedOwner] = useState<EligibleOwner | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitted },
  } = useForm<CreateUserAccountFormValues>({
    resolver: zodResolver(createUserAccountSchema),
    defaultValues: EMPTY_CREATE_USER_ACCOUNT_VALUES,
  })
  const [accountType, username, roleIds] = useWatch({
    control,
    name: ["accountType", "username", "roleIds"],
  })
  const roles = useAssignableRoles(selectsRoles(accountType))

  const selectedRoles = (roles.data ?? []).filter((role) => roleIds.includes(role.roleId))

  const changeAccountType = (type: AccountType) => {
    setValue("accountType", type)
    setValue("ownerId", "")
    setValue("roleIds", [])
    clearErrors(["ownerId", "roleIds"])
    setSelectedOwner(null)
    setFormError(null)
  }

  const selectOwner = (owner: EligibleOwner) => {
    setSelectedOwner(owner)
    setValue("ownerId", owner.ownerId, { shouldValidate: isSubmitted })
  }

  const changeRoles = (next: string[]) => {
    setValue("roleIds", next, { shouldValidate: isSubmitted })
  }

  const generatePassword = () => {
    setValue("temporaryPassword", generateTemporaryPassword(), {
      shouldDirty: true,
      shouldValidate: isSubmitted,
    })
  }

  const onSubmit = async (values: CreateUserAccountFormValues) => {
    if (!selectedOwner || createAccount.isPending) return
    setFormError(null)
    try {
      const account = await createAccount.mutateAsync(values)
      const roleNames = Object.fromEntries(
        (roles.data ?? []).map((role) => [role.code, role.name])
      )
      onCreated({ account, owner: selectedOwner, roleNames })
    } catch (error) {
      const failure = describeCreateUserAccountError(error)
      setFormError(failure.message)
      switch (failure.kind) {
        case "username-taken":
          setError("username", { message: failure.message }, { shouldFocus: true })
          break
        case "owner-linked":
        case "owner-inactive":
        case "owner-not-found":
          setSelectedOwner(null)
          setValue("ownerId", "")
          setError("ownerId", { message: failure.message })
          void queryClient.invalidateQueries({ queryKey: userAccountKeys.eligibleOwnerSearches() })
          break
        case "owner-without-mobile":
          void queryClient.invalidateQueries({ queryKey: userAccountKeys.eligibleOwnerSearches() })
          break
        case "role-not-assignable":
          setError("roleIds", { message: failure.message })
          void roles.refetch()
          break
      }
    } finally {
      // The mutation variables hold the temporary password; drop them from the cache.
      createAccount.reset()
    }
  }

  return (
    <form
      noValidate
      aria-label="Tạo tài khoản người dùng"
      onSubmit={handleSubmit(onSubmit)}
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_344px]"
    >
      <div className="min-w-0 space-y-5">
        {formError ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <SectionCard step={1} title="Chủ tài khoản" titleId="account-owner-title">
          <AccountOwnerSection
            accountType={accountType}
            onAccountTypeChange={changeAccountType}
            selectedOwner={selectedOwner}
            onSelectOwner={selectOwner}
            ownerError={errors.ownerId?.message}
          />
        </SectionCard>

        <SectionCard step={2} title="Thông tin đăng nhập" titleId="sign-in-title">
          <SignInCredentialsSection
            register={register}
            errors={errors}
            username={username}
            onGeneratePassword={generatePassword}
            selectedOwner={selectedOwner}
          />
        </SectionCard>

        {/* SRS 2-AF-01: a patient account hides the Initial Roles section; it gets the PATIENT role. */}
        {selectsRoles(accountType) ? (
          <SectionCard
            step={3}
            title="Vai trò ban đầu"
            titleId="initial-roles-title"
            aside={
              <span aria-live="polite">
                Đã chọn <strong className="text-foreground">{roleIds.length}</strong> vai trò
              </span>
            }
          >
            <InitialRolesSection
              roles={roles.data}
              isLoading={roles.isLoading}
              error={roles.error}
              onRetry={() => void roles.refetch()}
              selectedRoleIds={roleIds}
              onChange={changeRoles}
              validationError={errors.roleIds?.message}
            />
          </SectionCard>
        ) : null}
      </div>

      <AccountSummaryCard
        accountType={accountType}
        owner={selectedOwner}
        username={username}
        roles={selectedRoles}
        isSubmitting={createAccount.isPending}
        submitBlocked={Boolean(selectedOwner && !selectedOwner.smsPhoneNumber)}
        onCancel={() => router.back()}
      />
    </form>
  )
}
