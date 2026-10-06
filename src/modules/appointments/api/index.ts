import { unavailableApi } from "@/shared/api/api-unavailable"
import type {
  Appointment,
  AppointmentCounters,
  AppointmentFilterParams,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from "../types"

export function fetchAppointments(params?: AppointmentFilterParams): Promise<Appointment[]> {
  void params
  return unavailableApi("danh sách lịch hẹn")
}

export function fetchAppointmentById(id: string): Promise<Appointment> {
  void id
  return unavailableApi("chi tiết lịch hẹn")
}

export function createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
  void dto
  return unavailableApi("tạo lịch hẹn")
}

export function updateAppointment(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
  void id
  void dto
  return unavailableApi("cập nhật lịch hẹn")
}

export function cancelAppointment(id: string, reason?: string): Promise<Appointment> {
  void id
  void reason
  return unavailableApi("hủy lịch hẹn")
}

export function confirmAppointmentArrived(id: string): Promise<Appointment> {
  void id
  return unavailableApi("xác nhận bệnh nhân đến khám")
}

export function confirmAppointmentCheckIn(id: string, encounterCode?: string): Promise<Appointment> {
  void id
  void encounterCode
  return unavailableApi("check-in lịch hẹn")
}

export function fetchAppointmentCounters(): Promise<AppointmentCounters> {
  return unavailableApi("thống kê lịch hẹn")
}
