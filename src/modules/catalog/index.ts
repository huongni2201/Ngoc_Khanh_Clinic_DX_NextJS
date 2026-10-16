export type { ClinicalService } from "./types"
export { fetchClinicalServiceCatalog } from "./api/services"
export { useClinicalServices } from "./hooks/use-clinical-services"
export { catalogKeys } from "./query-keys"
export { catalogManagementKeys } from "./query-keys.management"

// Management types
export * from "./types/management"

// Management pages
export { DepartmentManagementPage } from "./pages/management/department-management-page"
export { RoomManagementPage } from "./pages/management/room-management-page"
export { SpecialtyManagementPage } from "./pages/management/specialty-management-page"
export { ServiceManagementPage } from "./pages/management/service-management-page"
export { MedicineManagementPage } from "./pages/management/medicine-management-page"

// Management components
export { CatalogAccessBoundary } from "./components/management/catalog-access-boundary"

// Management utils & permissions
export {
  CATALOG_PERMISSIONS,
  DEPARTMENT_TYPE_LABELS,
  SERVICE_TYPE_LABELS,
  formatPrice,
  parsePriceInput,
  formatTimestamp,
  isClinicManager,
  canAccessCatalogManagement,
} from "./utils/management/catalog-management-utils"
