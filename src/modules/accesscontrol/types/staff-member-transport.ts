import { z } from "zod"

// Mirrors the backend contract docs/api/staff-members.md (accesscontrol). Enum values are kept exactly.

export const STAFF_MEMBER_SEX_VALUES = ["MALE", "FEMALE", "OTHER", "UNKNOWN"] as const
export const STAFF_MEMBER_STATUS_VALUES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const
export const ACCOUNT_STATUS_VALUES = ["ACTIVE", "LOCKED", "DISABLED"] as const

export const staffAccountResponseSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  status: z.enum(ACCOUNT_STATUS_VALUES),
  roleCode: z.string(),
  /** Account version, sent back when changing the role (PUT /api/v1/accounts/{accountId}/role). */
  rowVersion: z.number().int().nonnegative(),
})

export const staffMemberResponseSchema = z.object({
  id: z.string().min(1),
  staffCode: z.string().min(1),
  fullName: z.string(),
  dateOfBirth: z.iso.date().nullish(),
  sex: z.enum(STAFF_MEMBER_SEX_VALUES).nullish(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  status: z.enum(STAFF_MEMBER_STATUS_VALUES),
  rowVersion: z.number().int().nonnegative(),
  account: staffAccountResponseSchema.nullish(),
})

export type StaffMemberResponseDto = z.infer<typeof staffMemberResponseSchema>

export const staffMemberPageResponseSchema = z.object({
  items: z.array(staffMemberResponseSchema),
  page: z.number().int().positive(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export type StaffMemberPageResponseDto = z.infer<typeof staffMemberPageResponseSchema>

export const roleResponseSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string(),
  // Optional since V005: a role created by an administrator may have no description.
  description: z.string().nullish(),
  /** Number of permissions the role grants. */
  permissionCount: z.number().int().nonnegative(),
})

export const roleListResponseSchema = z.array(roleResponseSchema)

export type RoleResponseDto = z.infer<typeof roleResponseSchema>

export interface ChangeAccountRoleRequestDto {
  roleCode: string
  rowVersion: number
}

export const accountRoleResponseSchema = z.object({
  accountId: z.string().min(1),
  roleCode: z.string().min(1),
  rowVersion: z.number().int().nonnegative(),
})

export type AccountRoleResponseDto = z.infer<typeof accountRoleResponseSchema>

export interface CreateStaffMemberRequestDto {
  fullName: string
  dateOfBirth?: string
  sex?: (typeof STAFF_MEMBER_SEX_VALUES)[number]
  phone?: string
  email?: string
  initialPassword: string
  roleCode: string
}
