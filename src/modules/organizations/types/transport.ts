import { z } from "zod"

const optionalNullableString = z.string().nullish()

export const organizationResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  taxCode: optionalNullableString,
  address: optionalNullableString,
  contactName: z.string(),
  contactPhone: z.string(),
  contactJobTitle: optionalNullableString,
  note: optionalNullableString,
  status: z.string(),
})

export type OrganizationResponseDto = z.infer<typeof organizationResponseSchema>

export interface OrganizationRequestDto {
  name: string
  taxCode?: string
  address?: string
  contactName: string
  contactPhone: string
  contactJobTitle?: string
  note?: string
}

export interface OrganizationPageResponseDto {
  items: OrganizationResponseDto[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
