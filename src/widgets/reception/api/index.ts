import { unavailableApi } from "@/shared/api/api-unavailable"
import type { ClinicRoom, Encounter, ReceptionCounters, ReceptionFilterParams } from "../types"

export function fetchReceptionCounters(): Promise<ReceptionCounters> {
  return unavailableApi("thống kê tiếp đón")
}

export function fetchClinicRooms(): Promise<ClinicRoom[]> {
  return unavailableApi("danh sách phòng khám")
}

export function fetchReceptionWorklist(params?: ReceptionFilterParams): Promise<Encounter[]> {
  void params
  return unavailableApi("worklist tiếp đón")
}
