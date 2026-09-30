import { unavailableDevelopmentApi } from "@/shared/api/development-fixture-error"

type EncounterApi = typeof import("../__tests__/fixtures/api-fixtures")

export function fetchEncounterDetail(
  ...args: Parameters<EncounterApi["fetchEncounterDetail"]>
): ReturnType<EncounterApi["fetchEncounterDetail"]> {
  void args
  return unavailableDevelopmentApi("chi tiết lượt khám")
}

export function fetchPatientEncounters(
  ...args: Parameters<EncounterApi["fetchPatientEncounters"]>
): ReturnType<EncounterApi["fetchPatientEncounters"]> {
  void args
  return unavailableDevelopmentApi("lịch sử lượt khám")
}
