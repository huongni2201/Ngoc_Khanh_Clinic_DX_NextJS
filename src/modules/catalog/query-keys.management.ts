export const catalogManagementKeys = {
  all: ["catalog", "management"] as const,

  departments: () => [...catalogManagementKeys.all, "departments"] as const,
  departmentLists: () => [...catalogManagementKeys.departments(), "list"] as const,
  departmentList: (params: Record<string, unknown>) =>
    [...catalogManagementKeys.departmentLists(), params] as const,
  departmentDetails: () => [...catalogManagementKeys.departments(), "detail"] as const,
  departmentDetail: (id: string) => [...catalogManagementKeys.departmentDetails(), id] as const,
  departmentPickers: () => [...catalogManagementKeys.departments(), "picker"] as const,
  departmentPicker: (params: Record<string, unknown>) =>
    [...catalogManagementKeys.departmentPickers(), params] as const,

  rooms: () => [...catalogManagementKeys.all, "rooms"] as const,
  roomLists: () => [...catalogManagementKeys.rooms(), "list"] as const,
  roomList: (params: Record<string, unknown>) =>
    [...catalogManagementKeys.roomLists(), params] as const,
  roomDetails: () => [...catalogManagementKeys.rooms(), "detail"] as const,
  roomDetail: (id: string) => [...catalogManagementKeys.roomDetails(), id] as const,

  specialties: () => [...catalogManagementKeys.all, "specialties"] as const,
  specialtyLists: () => [...catalogManagementKeys.specialties(), "list"] as const,
  specialtyList: (params: Record<string, unknown>) =>
    [...catalogManagementKeys.specialtyLists(), params] as const,
  specialtyDetails: () => [...catalogManagementKeys.specialties(), "detail"] as const,
  specialtyDetail: (id: string) => [...catalogManagementKeys.specialtyDetails(), id] as const,
  specialtyPickers: () => [...catalogManagementKeys.specialties(), "picker"] as const,
  specialtyPicker: (params: Record<string, unknown>) =>
    [...catalogManagementKeys.specialtyPickers(), params] as const,

  services: () => [...catalogManagementKeys.all, "services"] as const,
  serviceLists: () => [...catalogManagementKeys.services(), "list"] as const,
  serviceList: (params: Record<string, unknown>) =>
    [...catalogManagementKeys.serviceLists(), params] as const,
  serviceDetails: () => [...catalogManagementKeys.services(), "detail"] as const,
  serviceDetail: (id: string) => [...catalogManagementKeys.serviceDetails(), id] as const,

  medicines: () => [...catalogManagementKeys.all, "medicines"] as const,
  medicineLists: () => [...catalogManagementKeys.medicines(), "list"] as const,
  medicineList: (params: Record<string, unknown>) =>
    [...catalogManagementKeys.medicineLists(), params] as const,
  medicineDetails: () => [...catalogManagementKeys.medicines(), "detail"] as const,
  medicineDetail: (id: string) => [...catalogManagementKeys.medicineDetails(), id] as const,
}
