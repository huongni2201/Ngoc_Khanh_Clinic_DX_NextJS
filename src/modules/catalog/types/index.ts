export interface ClinicalService {
  id: string
  code: string
  name: string
  serviceType: string
  /** Catalog reference price (VND). */
  unitPrice: number
}
