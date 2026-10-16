import type {
  ACCOUNT_STATUS_VALUES,
  STAFF_MEMBER_SEX_VALUES,
  STAFF_MEMBER_STATUS_VALUES,
} from "./staff-member-transport"

export type StaffMemberSex = (typeof STAFF_MEMBER_SEX_VALUES)[number]
export type StaffMemberStatus = (typeof STAFF_MEMBER_STATUS_VALUES)[number]
export type StaffAccountStatus = (typeof ACCOUNT_STATUS_VALUES)[number]

export interface StaffAccount {
  id: string
  username: string
  status: StaffAccountStatus
  roleCode: string
  /** Version to send back when changing the role. */
  rowVersion: number
}

export interface StaffMember {
  id: string
  staffCode: string
  fullName: string
  /** ISO LocalDate, formatted only at the presentation boundary. */
  dateOfBirth?: string
  sex?: StaffMemberSex
  phone?: string
  email?: string
  status: StaffMemberStatus
  rowVersion: number
  /** Null when the staff member has no account (for example one provisioned by SQL). */
  account: StaffAccount | null
}

export interface RoleOption {
  id: string
  code: string
  name: string
  description: string
  permissionCount: number
}

/** New role of an account (SRS UC-010 Change User Role). */
export interface ChangeAccountRoleInput {
  roleCode: string
  /** The account version last read. */
  rowVersion: number
}

export interface AccountRole {
  accountId: string
  roleCode: string
  rowVersion: number
}

export const STAFF_MEMBER_SORT_KEYS = ["id", "staffCode", "fullName"] as const
export type StaffMemberSortKey = (typeof STAFF_MEMBER_SORT_KEYS)[number]

export interface StaffMemberFilterParams {
  search?: string
  page?: number
  pageSize?: number
  sortKey?: StaffMemberSortKey
  sortBy?: "ASC" | "DESC"
}

export interface StaffMemberListResponse {
  data: StaffMember[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateStaffMemberInput {
  fullName: string
  dateOfBirth?: string
  sex?: StaffMemberSex
  phone?: string
  email?: string
  initialPassword: string
  roleCode: string
}
