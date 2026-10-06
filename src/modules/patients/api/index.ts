import { unavailableApi } from "@/shared/api/api-unavailable"
import type {
  CreatePatientDto,
  Patient,
  PatientCounters,
  PatientFilterParams,
  UpdatePatientDto,
} from "../types"

export function searchPatients(query?: string, params?: PatientFilterParams): Promise<Patient[]> {
  void query
  void params
  return unavailableApi("tìm kiếm bệnh nhân")
}

export function fetchPatientById(id: string): Promise<Patient> {
  void id
  return unavailableApi("chi tiết bệnh nhân")
}

export function createPatient(dto: CreatePatientDto): Promise<Patient> {
  void dto
  return unavailableApi("tạo hồ sơ bệnh nhân")
}

export function updatePatient(id: string, dto: UpdatePatientDto): Promise<Patient> {
  void id
  void dto
  return unavailableApi("cập nhật hồ sơ bệnh nhân")
}

export function fetchPatientCounters(): Promise<PatientCounters> {
  return unavailableApi("thống kê bệnh nhân")
}
