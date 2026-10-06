import { unavailableApi } from "@/shared/api/api-unavailable"
import type {
  DoctorCounters,
  DoctorEncounter,
  DoctorFilterParams,
  DoctorWorklistResponse,
  NextDoctorAction,
} from "../types"

export function fetchDoctorWorklist(params?: DoctorFilterParams): Promise<DoctorWorklistResponse> {
  void params
  return unavailableApi("worklist bác sĩ")
}

export function fetchDoctorCounters(): Promise<DoctorCounters> {
  return unavailableApi("thống kê worklist bác sĩ")
}

export function fetchDoctorEncounterById(id: string): Promise<DoctorEncounter | null> {
  void id
  return unavailableApi("chi tiết lượt khám của bác sĩ")
}

export function fetchDoctorNextAction(doctorParam?: string): Promise<NextDoctorAction> {
  void doctorParam
  return unavailableApi("hành động tiếp theo của bác sĩ")
}

export function startDoctorEncounter(id: string): Promise<DoctorEncounter | null> {
  void id
  return unavailableApi("bắt đầu lượt khám")
}
