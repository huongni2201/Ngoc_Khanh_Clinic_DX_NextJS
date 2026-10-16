import { z } from "zod"
import { parseApiData } from "@/shared/api/parse-api-data"

const catalogPageSchema = z.object({
  items: z.array(z.unknown()),
  page: z.number().int().min(1),
  size: z.number().int().min(1).max(100),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

/** Validate pagination before callers access items or derive table controls. */
export function parseCatalogPageEnvelope(data: unknown) {
  return parseApiData(catalogPageSchema, data)
}
