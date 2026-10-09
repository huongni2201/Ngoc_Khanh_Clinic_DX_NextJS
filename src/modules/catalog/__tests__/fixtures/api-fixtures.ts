import type { ClinicalService } from "@/modules/catalog"

// Master catalog of clinic's examination items (matching reference image)
export const clinicalServiceCatalog: ClinicalService[] = [
  {
    id: "item-kntq",
    code: "HM001",
    name: "Khám nội tổng quát",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
  {
    id: "item-xnm",
    code: "HM002",
    name: "Xét nghiệm máu",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
  {
    id: "item-xnnt",
    code: "HM003",
    name: "Xét nghiệm nước tiểu",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
  {
    id: "item-saob",
    code: "HM004",
    name: "Siêu âm ổ bụng",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
  {
    id: "item-xqp",
    code: "HM005",
    name: "X-quang phổi",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
  {
    id: "item-km",
    code: "HM006",
    name: "Khám mắt",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
  {
    id: "item-tmh",
    code: "HM007",
    name: "Tai mũi họng",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
]

// ----------------------------------------------------
// Public API Functions
// ----------------------------------------------------

export async function fetchClinicalServiceCatalog(): Promise<ClinicalService[]> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return [...clinicalServiceCatalog]
}
