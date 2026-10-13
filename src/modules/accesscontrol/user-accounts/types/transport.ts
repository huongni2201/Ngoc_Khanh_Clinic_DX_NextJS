import { z } from "zod"

// Mirrors the backend UC-005 contract (Springboot docs/api/user-accounts.md).

export const ACCOUNT_TYPES = ["STAFF", "PATIENT"] as const

const accountTypeSchema = z.enum(ACCOUNT_TYPES)

export const createUserAccountResponseSchema = z.object({
  accountId: z.uuid(),
  accountType: accountTypeSchema,
  username: z.string(),
  status: z.enum(["ACTIVE", "LOCKED", "DISABLED"]),
  ownerId: z.uuid(),
  roleCodes: z.array(z.string()),
  smsDelivered: z.boolean(),
})

export type CreateUserAccountResponseDto = z.infer<typeof createUserAccountResponseSchema>

export interface CreateUserAccountRequestDto {
  accountType: (typeof ACCOUNT_TYPES)[number]
  ownerId: string
  username: string
  temporaryPassword: string
  /** Initial roles of a STAFF account; always empty for a PATIENT account. */
  roleIds: string[]
}

const eligibleOwnerSchema = z.object({
  ownerId: z.uuid(),
  ownerCode: z.string(),
  fullName: z.string(),
  departmentName: z.string().nullish(),
  dateOfBirth: z.iso.date().nullish(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  smsPhoneNumber: z.string().nullish(),
})

export const eligibleOwnerListSchema = z.object({
  items: z.array(eligibleOwnerSchema),
  limited: z.boolean(),
})

export type EligibleOwnerDto = z.infer<typeof eligibleOwnerSchema>

export const usernameAvailabilitySchema = z.object({ available: z.boolean() })

export const assignableRoleListSchema = z.array(
  z.object({
    roleId: z.uuid(),
    code: z.string(),
    name: z.string(),
    description: z.string().nullish(),
  })
)
