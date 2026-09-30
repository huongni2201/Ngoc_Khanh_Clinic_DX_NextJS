import { unavailableDevelopmentApi } from "@/shared/api/development-fixture-error"

type DoctorApi = typeof import("../__tests__/fixtures/api-fixtures")

export function fetchDoctorWorklist(
  ...args: Parameters<DoctorApi["fetchDoctorWorklist"]>
): ReturnType<DoctorApi["fetchDoctorWorklist"]> {
  void args
  return unavailableDevelopmentApi("worklist bác sĩ")
}

export function fetchDoctorCounters(
  ...args: Parameters<DoctorApi["fetchDoctorCounters"]>
): ReturnType<DoctorApi["fetchDoctorCounters"]> {
  void args
  return unavailableDevelopmentApi("thống kê worklist bác sĩ")
}

export function fetchDoctorEncounterById(
  ...args: Parameters<DoctorApi["fetchDoctorEncounterById"]>
): ReturnType<DoctorApi["fetchDoctorEncounterById"]> {
  void args
  return unavailableDevelopmentApi("chi tiết lượt khám của bác sĩ")
}

export function fetchDoctorNextAction(
  ...args: Parameters<DoctorApi["fetchDoctorNextAction"]>
): ReturnType<DoctorApi["fetchDoctorNextAction"]> {
  void args
  return unavailableDevelopmentApi("hành động tiếp theo của bác sĩ")
}

export function startDoctorEncounter(
  ...args: Parameters<DoctorApi["startDoctorEncounter"]>
): ReturnType<DoctorApi["startDoctorEncounter"]> {
  void args
  return unavailableDevelopmentApi("bắt đầu lượt khám")
}
