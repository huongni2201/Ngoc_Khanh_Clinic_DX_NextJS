import { z } from "zod"

// Mirrors the backend contract docs/api/roles-and-permissions.md (accesscontrol).

export const ROLE_STATUS_FILTER_VALUES = ["ACTIVE", "INACTIVE"] as const

export const roleSummaryResponseSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string(),
  description: z.string().nullish(),
  active: z.boolean(),
  permissionCount: z.number().int().nonnegative(),
  userCount: z.number().int().nonnegative(),
  rowVersion: z.number().int().nonnegative(),
})

export type RoleSummaryResponseDto = z.infer<typeof roleSummaryResponseSchema>

export const rolePageResponseSchema = z.object({
  items: z.array(roleSummaryResponseSchema),
  page: z.number().int().positive(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export const permissionCatalogItemSchema = z.object({
  code: z.string().min(1),
  name: z.string(),
  module: z.string().min(1),
  useCases: z.array(z.string()),
  sensitive: z.boolean(),
})

export const permissionCatalogResponseSchema = z.array(permissionCatalogItemSchema)

export type PermissionCatalogItemDto = z.infer<typeof permissionCatalogItemSchema>

export const rolePermissionsResponseSchema = z.object({
  roleId: z.string().min(1),
  roleCode: z.string().min(1),
  active: z.boolean(),
  rowVersion: z.number().int().nonnegative(),
  permissionCodes: z.array(z.string()),
})

export type RolePermissionsResponseDto = z.infer<typeof rolePermissionsResponseSchema>

export interface CreateRoleRequestDto {
  code: string
  name: string
  description?: string
  copyFromRoleId?: string
  active: boolean
}

export interface UpdateRoleRequestDto {
  name: string
  description?: string
  active: boolean
  rowVersion: number
}

export interface UpdateRolePermissionsRequestDto {
  rowVersion: number
  grant: string[]
  revoke: string[]
}
