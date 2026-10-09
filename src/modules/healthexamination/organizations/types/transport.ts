import { z } from "zod"

const optionalNullableString = z.string().nullish()

export const organizationResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  taxCode: optionalNullableString,
  phone: optionalNullableString,
  email: z.string(),
  address: z.string(),
  contactFullName: z.string(),
  contactPhone: z.string(),
  contactEmail: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  rowVersion: z.number().int().nonnegative(),
})

export type OrganizationResponseDto = z.infer<typeof organizationResponseSchema>

export interface OrganizationRequestDto {
  name: string
  taxCode?: string
  phone?: string
  email: string
  address: string
  contactFullName: string
  contactPhone: string
  contactEmail: string
}

export interface UpdateOrganizationRequestDto extends OrganizationRequestDto {
  rowVersion: number
}

export interface OrganizationPageResponseDto {
  items: OrganizationResponseDto[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
