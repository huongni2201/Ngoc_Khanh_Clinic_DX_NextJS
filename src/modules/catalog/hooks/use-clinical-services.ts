"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchClinicalServiceCatalog } from "../api/services"
import type { ClinicalService } from "../types"
import { catalogKeys } from "../query-keys"

/** The catalog is only requested while a form that needs it is open. */
export function useClinicalServices(enabled = true) {
  return useQuery<ClinicalService[]>({
    queryKey: catalogKeys.clinicalServices(),
    queryFn: ({ signal }) => fetchClinicalServiceCatalog(signal),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
