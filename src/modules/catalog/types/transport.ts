import { z } from "zod"

const serviceCatalogItemResponseSchema = z.object({
  id: z.string().min(1),
  code: z.string(),
  name: z.string(),
  serviceType: z.string(),
  unitPrice: z.number().nonnegative(),
  active: z.boolean(),
})

export type ServiceCatalogItemResponseDto = z.infer<typeof serviceCatalogItemResponseSchema>

export const serviceCatalogPageResponseSchema = z.object({
  items: z.array(serviceCatalogItemResponseSchema),
  page: z.number().int().positive(),
  size: z.number().int().positive().max(100),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})
