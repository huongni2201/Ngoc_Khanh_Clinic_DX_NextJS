import { unavailableDevelopmentApi } from "@/shared/api/development-fixture-error"

type PatientApi = typeof import("../__tests__/fixtures/api-fixtures")

export function searchPatients(
  ...args: Parameters<PatientApi["searchPatients"]>
): ReturnType<PatientApi["searchPatients"]> {
  void args
  return unavailableDevelopmentApi("tìm kiếm bệnh nhân")
}

export function fetchPatientById(
  ...args: Parameters<PatientApi["fetchPatientById"]>
): ReturnType<PatientApi["fetchPatientById"]> {
  void args
  return unavailableDevelopmentApi("chi tiết bệnh nhân")
}

export function createPatient(
  ...args: Parameters<PatientApi["createPatient"]>
): ReturnType<PatientApi["createPatient"]> {
  void args
  return unavailableDevelopmentApi("tạo hồ sơ bệnh nhân")
}

export function updatePatient(
  ...args: Parameters<PatientApi["updatePatient"]>
): ReturnType<PatientApi["updatePatient"]> {
  void args
  return unavailableDevelopmentApi("cập nhật hồ sơ bệnh nhân")
}

export function fetchPatientCounters(
  ...args: Parameters<PatientApi["fetchPatientCounters"]>
): ReturnType<PatientApi["fetchPatientCounters"]> {
  void args
  return unavailableDevelopmentApi("thống kê bệnh nhân")
}
