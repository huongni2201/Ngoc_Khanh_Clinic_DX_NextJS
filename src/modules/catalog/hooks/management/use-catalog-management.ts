"use client"

import { useQuery, useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { catalogManagementKeys } from "../../query-keys.management"
import {
  fetchDepartments,
  fetchDepartmentById,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
  reactivateDepartment,
} from "../../api/management/departments"
import {
  fetchRooms,
  fetchRoomById,
  createRoom,
  updateRoom,
  deactivateRoom,
  reactivateRoom,
} from "../../api/management/rooms"
import {
  fetchSpecialties,
  fetchSpecialtyById,
  createSpecialty,
  updateSpecialty,
  deactivateSpecialty,
  reactivateSpecialty,
} from "../../api/management/specialties"
import {
  fetchManagedServices,
  fetchManagedServiceById,
  createManagedService,
  updateManagedService,
  deactivateManagedService,
  reactivateManagedService,
} from "../../api/management/services"
import {
  fetchMedicines,
  fetchMedicineById,
  createMedicine,
  updateMedicine,
  deactivateMedicine,
  reactivateMedicine,
} from "../../api/management/medicines"
import type {
  DepartmentListParams,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  RoomListParams,
  CreateRoomDto,
  UpdateRoomDto,
  SpecialtyListParams,
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  ServiceListParams,
  CreateServiceDto,
  UpdateServiceDto,
  MedicineListParams,
  CreateMedicineDto,
  UpdateMedicineDto,
} from "../../types/management"
import { catalogKeys } from "../../query-keys"
import { useCatalogMutation } from "./use-catalog-mutation"

// ─── Departments ────────────────────────────────────────────────────────────

export function useDepartments(params: DepartmentListParams) {
  return useQuery({
    queryKey: catalogManagementKeys.departmentList(params as Record<string, unknown>),
    queryFn: ({ signal }) => fetchDepartments(params, signal),
    meta: { requiresAuth: true },
    retry: false,
  })
}

export function useDepartment(id: string, enabled = true) {
  return useQuery({
    queryKey: catalogManagementKeys.departmentDetail(id),
    queryFn: ({ signal }) => fetchDepartmentById(id, signal),
    meta: { requiresAuth: true },
    enabled: !!id && enabled,
  })
}

export function useDepartmentPicker(params: DepartmentListParams, enabled = true) {
  return useQuery({
    queryKey: catalogManagementKeys.departmentPicker(params as Record<string, unknown>),
    queryFn: ({ signal }) => fetchDepartments(params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled,
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (dto: CreateDepartmentDto) => createDepartment(dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.departmentLists() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.departmentPickers() })
    },
  })
}

export function useUpdateDepartment(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (dto: UpdateDepartmentDto) => updateDepartment(id, dto),
    onSuccess: async (dept) => {
      queryClient.setQueryData(catalogManagementKeys.departmentDetail(id), dept)
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.departmentLists() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.departmentPickers() })
      // Rooms and services show department name; invalidate them
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.roomLists() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.serviceLists() })
    },
  })
}

export function useDeactivateDepartment(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (rowVersion: number) => deactivateDepartment(id, rowVersion),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.departmentDetail(id) })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.departmentLists() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.departmentPickers() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.roomLists() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.serviceLists() })
    },
  })
}

export function useReactivateDepartment(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (rowVersion: number) => reactivateDepartment(id, rowVersion),
    onSuccess: async (dept) => {
      queryClient.setQueryData(catalogManagementKeys.departmentDetail(id), dept)
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.departmentLists() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.departmentPickers() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.roomLists() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.serviceLists() })
    },
  })
}

// ─── Rooms ──────────────────────────────────────────────────────────────────

export function useRooms(params: RoomListParams) {
  return useQuery({
    queryKey: catalogManagementKeys.roomList(params as Record<string, unknown>),
    queryFn: ({ signal }) => fetchRooms(params, signal),
    meta: { requiresAuth: true },
    retry: false,
  })
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: catalogManagementKeys.roomDetail(id),
    queryFn: ({ signal }) => fetchRoomById(id, signal),
    meta: { requiresAuth: true },
    enabled: !!id,
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (dto: CreateRoomDto) => createRoom(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogManagementKeys.roomLists() })
    },
  })
}

export function useUpdateRoom(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (dto: UpdateRoomDto) => updateRoom(id, dto),
    onSuccess: async (room) => {
      queryClient.setQueryData(catalogManagementKeys.roomDetail(id), room)
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.roomLists() })
    },
  })
}

export function useDeactivateRoom(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (rowVersion: number) => deactivateRoom(id, rowVersion),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.roomDetail(id) })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.roomLists() })
    },
  })
}

export function useReactivateRoom(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (rowVersion: number) => reactivateRoom(id, rowVersion),
    onSuccess: async (room) => {
      queryClient.setQueryData(catalogManagementKeys.roomDetail(id), room)
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.roomLists() })
    },
  })
}

// ─── Specialties ─────────────────────────────────────────────────────────────

export function useSpecialties(params: SpecialtyListParams) {
  return useQuery({
    queryKey: catalogManagementKeys.specialtyList(params as Record<string, unknown>),
    queryFn: ({ signal }) => fetchSpecialties(params, signal),
    meta: { requiresAuth: true },
    retry: false,
  })
}

export function useSpecialty(id: string, enabled = true) {
  return useQuery({
    queryKey: catalogManagementKeys.specialtyDetail(id),
    queryFn: ({ signal }) => fetchSpecialtyById(id, signal),
    meta: { requiresAuth: true },
    enabled: !!id && enabled,
  })
}

export function useSpecialtyPicker(params: SpecialtyListParams, enabled = true) {
  return useQuery({
    queryKey: catalogManagementKeys.specialtyPicker(params as Record<string, unknown>),
    queryFn: ({ signal }) => fetchSpecialties(params, signal),
    meta: { requiresAuth: true },
    retry: false,
    enabled,
  })
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (dto: CreateSpecialtyDto) => createSpecialty(dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.specialtyLists() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.specialtyPickers() })
    },
  })
}

export function useUpdateSpecialty(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (dto: UpdateSpecialtyDto) => updateSpecialty(id, dto),
    onSuccess: async (spec) => {
      queryClient.setQueryData(catalogManagementKeys.specialtyDetail(id), spec)
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.specialtyLists() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.specialtyPickers() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.serviceLists() })
    },
  })
}

export function useDeactivateSpecialty(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (rowVersion: number) => deactivateSpecialty(id, rowVersion),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.specialtyDetail(id) })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.specialtyLists() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.specialtyPickers() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.serviceLists() })
    },
  })
}

export function useReactivateSpecialty(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (rowVersion: number) => reactivateSpecialty(id, rowVersion),
    onSuccess: async (spec) => {
      queryClient.setQueryData(catalogManagementKeys.specialtyDetail(id), spec)
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.specialtyLists() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.specialtyPickers() })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.serviceLists() })
    },
  })
}

// ─── Services ────────────────────────────────────────────────────────────────

export function useManagedServices(params: ServiceListParams) {
  return useQuery({
    queryKey: catalogManagementKeys.serviceList(params as Record<string, unknown>),
    queryFn: ({ signal }) => fetchManagedServices(params, signal),
    meta: { requiresAuth: true },
    retry: false,
  })
}

export function useManagedService(id: string) {
  return useQuery({
    queryKey: catalogManagementKeys.serviceDetail(id),
    queryFn: ({ signal }) => fetchManagedServiceById(id, signal),
    meta: { requiresAuth: true },
    enabled: !!id,
  })
}

/** Loads a complete fresh snapshot only when the user asks to open/reload it. */
function useLoadCatalogRecord<T>(key: (id: string) => QueryKey, fetcher: (id: string, signal?: AbortSignal) => Promise<T>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.fetchQuery({
      queryKey: key(id), queryFn: ({ signal }) => fetcher(id, signal),
      meta: { requiresAuth: true }, staleTime: 0, retry: false,
    }),
    retry: false,
  })
}

export function useLoadDepartment() {
  return useLoadCatalogRecord(catalogManagementKeys.departmentDetail, fetchDepartmentById)
}
export function useLoadRoom() {
  return useLoadCatalogRecord(catalogManagementKeys.roomDetail, fetchRoomById)
}
export function useLoadSpecialty() {
  return useLoadCatalogRecord(catalogManagementKeys.specialtyDetail, fetchSpecialtyById)
}
export function useLoadManagedService() {
  return useLoadCatalogRecord(catalogManagementKeys.serviceDetail, fetchManagedServiceById)
}
export function useLoadMedicine() {
  return useLoadCatalogRecord(catalogManagementKeys.medicineDetail, fetchMedicineById)
}

export function useCreateManagedService() {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (dto: CreateServiceDto) => createManagedService(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogManagementKeys.serviceLists() })
      void queryClient.invalidateQueries({ queryKey: catalogKeys.clinicalServices() })
    },
  })
}

export function useUpdateManagedService(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (dto: UpdateServiceDto) => updateManagedService(id, dto),
    onSuccess: async (svc) => {
      queryClient.setQueryData(catalogManagementKeys.serviceDetail(id), svc)
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.serviceLists() })
      await queryClient.invalidateQueries({ queryKey: catalogKeys.clinicalServices() })
    },
  })
}

export function useDeactivateManagedService(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (rowVersion: number) => deactivateManagedService(id, rowVersion),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.serviceDetail(id) })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.serviceLists() })
      await queryClient.invalidateQueries({ queryKey: catalogKeys.clinicalServices() })
    },
  })
}

export function useReactivateManagedService(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (rowVersion: number) => reactivateManagedService(id, rowVersion),
    onSuccess: async (svc) => {
      queryClient.setQueryData(catalogManagementKeys.serviceDetail(id), svc)
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.serviceLists() })
      await queryClient.invalidateQueries({ queryKey: catalogKeys.clinicalServices() })
    },
  })
}

// ─── Medicines ───────────────────────────────────────────────────────────────

export function useMedicines(params: MedicineListParams) {
  return useQuery({
    queryKey: catalogManagementKeys.medicineList(params as Record<string, unknown>),
    queryFn: ({ signal }) => fetchMedicines(params, signal),
    meta: { requiresAuth: true },
    retry: false,
  })
}

export function useMedicine(id: string) {
  return useQuery({
    queryKey: catalogManagementKeys.medicineDetail(id),
    queryFn: ({ signal }) => fetchMedicineById(id, signal),
    meta: { requiresAuth: true },
    enabled: !!id,
  })
}

export function useCreateMedicine() {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (dto: CreateMedicineDto) => createMedicine(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogManagementKeys.medicineLists() })
    },
  })
}

export function useUpdateMedicine(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (dto: UpdateMedicineDto) => updateMedicine(id, dto),
    onSuccess: async (med) => {
      queryClient.setQueryData(catalogManagementKeys.medicineDetail(id), med)
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.medicineLists() })
    },
  })
}

export function useDeactivateMedicine(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (rowVersion: number) => deactivateMedicine(id, rowVersion),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.medicineDetail(id) })
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.medicineLists() })
    },
  })
}

export function useReactivateMedicine(id: string) {
  const queryClient = useQueryClient()
  return useCatalogMutation({
    mutationFn: (rowVersion: number) => reactivateMedicine(id, rowVersion),
    onSuccess: async (med) => {
      queryClient.setQueryData(catalogManagementKeys.medicineDetail(id), med)
      await queryClient.invalidateQueries({ queryKey: catalogManagementKeys.medicineLists() })
    },
  })
}
