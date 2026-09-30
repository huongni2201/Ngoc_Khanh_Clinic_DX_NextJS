import { unavailableDevelopmentApi } from "@/shared/api/development-fixture-error"

type ReceptionApi = typeof import("../__tests__/fixtures/api-fixtures")

export function fetchReceptionCounters(
  ...args: Parameters<ReceptionApi["fetchReceptionCounters"]>
): ReturnType<ReceptionApi["fetchReceptionCounters"]> {
  void args
  return unavailableDevelopmentApi("thống kê tiếp đón")
}

export function fetchClinicRooms(
  ...args: Parameters<ReceptionApi["fetchClinicRooms"]>
): ReturnType<ReceptionApi["fetchClinicRooms"]> {
  void args
  return unavailableDevelopmentApi("danh sách phòng khám")
}

export function fetchReceptionWorklist(
  ...args: Parameters<ReceptionApi["fetchReceptionWorklist"]>
): ReturnType<ReceptionApi["fetchReceptionWorklist"]> {
  void args
  return unavailableDevelopmentApi("worklist tiếp đón")
}

export function fetchEncounterById(
  ...args: Parameters<ReceptionApi["fetchEncounterById"]>
): ReturnType<ReceptionApi["fetchEncounterById"]> {
  void args
  return unavailableDevelopmentApi("chi tiết lượt khám")
}

export function checkInPatient(
  ...args: Parameters<ReceptionApi["checkInPatient"]>
): ReturnType<ReceptionApi["checkInPatient"]> {
  void args
  return unavailableDevelopmentApi("check-in bệnh nhân")
}

export function assignRoomAndDoctor(
  ...args: Parameters<ReceptionApi["assignRoomAndDoctor"]>
): ReturnType<ReceptionApi["assignRoomAndDoctor"]> {
  void args
  return unavailableDevelopmentApi("phân phòng và bác sĩ")
}

export function fetchInvoiceByEncounter(
  ...args: Parameters<ReceptionApi["fetchInvoiceByEncounter"]>
): ReturnType<ReceptionApi["fetchInvoiceByEncounter"]> {
  void args
  return unavailableDevelopmentApi("hóa đơn lượt khám")
}

export function fetchReceptionInvoices(
  ...args: Parameters<ReceptionApi["fetchReceptionInvoices"]>
): ReturnType<ReceptionApi["fetchReceptionInvoices"]> {
  void args
  return unavailableDevelopmentApi("danh sách hóa đơn tiếp đón")
}

export function processPayment(
  ...args: Parameters<ReceptionApi["processPayment"]>
): ReturnType<ReceptionApi["processPayment"]> {
  void args
  return unavailableDevelopmentApi("thu phí")
}
