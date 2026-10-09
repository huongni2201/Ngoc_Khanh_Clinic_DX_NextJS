import { unavailableApi } from "@/shared/api/api-unavailable"
import type { PatientCheckInRequest, AssignRoomDto } from "../types/encounter-actions"

export function checkInPatient(dto: PatientCheckInRequest): Promise<never> {
  void dto
  return unavailableApi("check-in bệnh nhân")
}

export function assignRoomAndDoctor(dto: AssignRoomDto): Promise<never> {
  void dto
  return unavailableApi("phân phòng và bác sĩ")
}

export function startDoctorEncounter(id: string): Promise<never> {
  void id
  return unavailableApi("bắt đầu lượt khám")
}
