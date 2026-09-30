import { unavailableDevelopmentApi } from "@/shared/api/development-fixture-error"

type AppointmentApi = typeof import("../__tests__/fixtures/api-fixtures")

export function fetchAppointments(
  ...args: Parameters<AppointmentApi["fetchAppointments"]>
): ReturnType<AppointmentApi["fetchAppointments"]> {
  void args
  return unavailableDevelopmentApi("danh sách lịch hẹn")
}

export function fetchAppointmentById(
  ...args: Parameters<AppointmentApi["fetchAppointmentById"]>
): ReturnType<AppointmentApi["fetchAppointmentById"]> {
  void args
  return unavailableDevelopmentApi("chi tiết lịch hẹn")
}

export function createAppointment(
  ...args: Parameters<AppointmentApi["createAppointment"]>
): ReturnType<AppointmentApi["createAppointment"]> {
  void args
  return unavailableDevelopmentApi("tạo lịch hẹn")
}

export function updateAppointment(
  ...args: Parameters<AppointmentApi["updateAppointment"]>
): ReturnType<AppointmentApi["updateAppointment"]> {
  void args
  return unavailableDevelopmentApi("cập nhật lịch hẹn")
}

export function cancelAppointment(
  ...args: Parameters<AppointmentApi["cancelAppointment"]>
): ReturnType<AppointmentApi["cancelAppointment"]> {
  void args
  return unavailableDevelopmentApi("hủy lịch hẹn")
}

export function confirmAppointmentArrived(
  ...args: Parameters<AppointmentApi["confirmAppointmentArrived"]>
): ReturnType<AppointmentApi["confirmAppointmentArrived"]> {
  void args
  return unavailableDevelopmentApi("xác nhận bệnh nhân đến khám")
}

export function confirmAppointmentCheckIn(
  ...args: Parameters<AppointmentApi["confirmAppointmentCheckIn"]>
): ReturnType<AppointmentApi["confirmAppointmentCheckIn"]> {
  void args
  return unavailableDevelopmentApi("check-in lịch hẹn")
}

export function fetchAppointmentCounters(
  ...args: Parameters<AppointmentApi["fetchAppointmentCounters"]>
): ReturnType<AppointmentApi["fetchAppointmentCounters"]> {
  void args
  return unavailableDevelopmentApi("thống kê lịch hẹn")
}
