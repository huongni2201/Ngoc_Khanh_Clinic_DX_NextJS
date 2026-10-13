import type { ACCOUNT_TYPES, CreateUserAccountResponseDto } from "./transport"

export type AccountType = (typeof ACCOUNT_TYPES)[number]

/** Active staff member or patient without an account, offered as the owner of a new account. */
export interface AccountOwnerCandidate {
  ownerId: string
  ownerCode: string
  fullName: string
  departmentName?: string
  /** LocalDate (`yyyy-MM-dd`) of a patient. */
  dateOfBirth?: string
  phone?: string
  email?: string
  /** Normalized mobile number for the SMS; undefined when the stored phone cannot receive it. */
  smsPhoneNumber?: string
}

export interface AccountOwnerCandidateList {
  items: AccountOwnerCandidate[]
  /** More profiles may match; the keyword should be refined. */
  limited: boolean
}

export interface AssignableRole {
  roleId: string
  code: string
  name: string
  description?: string
}

export interface CreateUserAccountInput {
  accountType: AccountType
  ownerId: string
  username: string
  temporaryPassword: string
  roleIds: string[]
}

/** The created account exactly as returned; `smsDelivered` is true only when the gateway accepted it. */
export type CreatedUserAccount = CreateUserAccountResponseDto
