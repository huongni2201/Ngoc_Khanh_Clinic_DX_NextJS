import { unavailableApi } from "@/shared/api/api-unavailable"
import type {
  AssignRoomDto,
  ClinicRoom,
  Encounter,
  PatientCheckInRequest,
  ReceptionCounters,
  ReceptionFilterParams,
} from "../types"

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

export function fetchEncounterById(encounterId: string): Promise<Encounter> {
  void encounterId
  return unavailableApi("chi tiết lượt khám")
}

export function checkInPatient(dto: PatientCheckInRequest): Promise<Encounter> {
  void dto
  return unavailableApi("check-in bệnh nhân")
}

export function assignRoomAndDoctor(dto: AssignRoomDto): Promise<Encounter> {
  void dto
  return unavailableApi("phân phòng và bác sĩ")
}
