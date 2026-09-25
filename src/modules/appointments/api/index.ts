import {
  Appointment,
  AppointmentFilterParams,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentCounters,
} from "../types"
import { fetchPatientById } from "@/modules/patients"
import { initialRooms } from "@/modules/reception"

const todayStr = "2026-09-24"

const initialAppointments: Appointment[] = [
  {
    id: "apt-001",
    appointmentCode: "LH-260924-001",
    patientId: "pat-101",
    patientCode: "BN001421",
    patientName: "Nguyễn Thị Hoa",
    phoneNumber: "0987 654 321",
    gender: "FEMALE",
    birthYear: 1992,
    date: todayStr,
    time: "08:00",
    examinationType: "Khám tổng quát",
    physicianId: "doc-04",
    physicianName: "BS. Nguyễn Thị Lan",
    roomId: "room-104",
    roomName: "Phòng 104 - Khám Tổng quát",
    source: "ONLINE",
    type: "INDIVIDUAL",
    status: "ARRIVED",
    notes: "Đặt qua website phòng khám",
    createdAt: "2026-09-23T14:30:00Z",
  },
  {
    id: "apt-002",
    appointmentCode: "LH-260924-002",
    patientId: "pat-102",
    patientCode: "BN001422",
    patientName: "Phạm Quang Huy",
    phoneNumber: "0912 345 678",
    gender: "MALE",
    birthYear: 1986,
    date: todayStr,
    time: "08:30",
    examinationType: "Nội tổng quát",
    physicianId: "doc-01",
    physicianName: "BS.CKI Trần Văn Minh",
    roomId: "room-101",
    roomName: "Phòng 101 - Khám Nội tổng quát",
    source: "RECEPTION",
    type: "INDIVIDUAL",
    status: "BOOKED",
    notes: "Tái khám định kỳ",
    createdAt: "2026-09-24T07:15:00Z",
  },
  {
    id: "apt-003",
    appointmentCode: "LH-260924-003",
    patientId: "pat-103",
    patientCode: "BN001423",
    patientName: "Lê Thị Mai",
    phoneNumber: "0901 234 567",
    gender: "FEMALE",
    birthYear: 1990,
    date: todayStr,
    time: "09:00",
    examinationType: "Tim mạch",
    physicianId: "doc-02",
    physicianName: "BS. Lê Đức Anh",
    roomId: "room-102",
    roomName: "Phòng 102 - Khám Cơ xương khớp / Tim mạch",
    source: "ONLINE",
    type: "INDIVIDUAL",
    status: "CONFIRMED",
    notes: "Khám theo dõi huyết áp",
    createdAt: "2026-09-22T10:00:00Z",
  },
  {
    id: "apt-004",
    appointmentCode: "LH-260924-004",
    patientId: "pat-104",
    patientCode: "BN001424",
    patientName: "Trần Văn Nam",
    phoneNumber: "0933 678 901",
    gender: "MALE",
    birthYear: 1979,
    date: todayStr,
    time: "10:00",
    examinationType: "Khám sức khỏe doanh nghiệp",
    physicianId: "doc-02",
    physicianName: "BS. Lê Đức Anh",
    roomId: "room-102",
    roomName: "Phòng 102 - Khám Cơ xương khớp",
    source: "ENTERPRISE",
    type: "ENTERPRISE",
    enterpriseId: "ent-2",
    enterpriseName: "Công ty Cổ phần FPT",
    batchId: "batch-1",
    batchName: "Khám sức khỏe định kỳ 2026",
    employeeCode: "FPT004",
    status: "CONFIRMED",
    notes: "Khám đoàn FPT đợt 1",
    createdAt: "2026-09-23T16:00:00Z",
  },
  {
    id: "apt-005",
    appointmentCode: "LH-260924-005",
    patientId: "pat-105",
    patientCode: "BN001425",
    patientName: "Nguyễn Thị Thu Hà",
    phoneNumber: "0919 876 543",
    gender: "FEMALE",
    birthYear: 1995,
    date: todayStr,
    time: "10:30",
    examinationType: "Khám da liễu",
    physicianId: "doc-05",
    physicianName: "ThS.BS Đỗ Mỹ Linh",
    roomId: "room-105",
    roomName: "Phòng 105 - Khám Chuyên khoa",
    source: "ONLINE",
    type: "INDIVIDUAL",
    status: "BOOKED",
    notes: "Dị ứng mẩn đỏ",
    createdAt: "2026-09-24T06:00:00Z",
  },
  {
    id: "apt-006",
    appointmentCode: "LH-260924-006",
    patientId: "pat-106",
    patientCode: "BN001426",
    patientName: "Lê Văn Thành",
    phoneNumber: "0945 123 987",
    gender: "MALE",
    birthYear: 1983,
    date: todayStr,
    time: "11:00",
    examinationType: "Khám sức khỏe doanh nghiệp",
    physicianId: "doc-04",
    physicianName: "BS. Nguyễn Thị Lan",
    roomId: "room-104",
    roomName: "Phòng 104 - Khám Tổng quát",
    source: "ENTERPRISE",
    type: "ENTERPRISE",
    enterpriseId: "ent-1",
    enterpriseName: "Samsung Electronics Việt Nam",
    batchId: "batch-samsung-1",
    batchName: "Đợt khám sức khỏe cán bộ 2026",
    employeeCode: "SS0106",
    status: "CONFIRMED",
    notes: "Khám gói VIP Samsung",
    createdAt: "2026-09-23T11:20:00Z",
  },
  {
    id: "apt-007",
    appointmentCode: "LH-260924-007",
    patientId: "pat-107",
    patientCode: "BN001427",
    patientName: "Hoàng Văn Long",
    phoneNumber: "0978 234 561",
    gender: "MALE",
    birthYear: 1988,
    date: todayStr,
    time: "13:30",
    examinationType: "Hô hấp",
    physicianId: "doc-03",
    physicianName: "BS. Phạm Quang Huy",
    roomId: "room-103",
    roomName: "Phòng 103 - Khám Hô hấp",
    source: "ONLINE",
    type: "INDIVIDUAL",
    status: "CONFIRMED",
    notes: "Ho khan kéo dài",
    createdAt: "2026-09-21T09:00:00Z",
  },
  {
    id: "apt-008",
    appointmentCode: "LH-260924-008",
    patientId: "pat-108",
    patientCode: "BN001428",
    patientName: "Trần Thị Lan",
    phoneNumber: "0966 456 789",
    gender: "FEMALE",
    birthYear: 1991,
    date: todayStr,
    time: "14:00",
    examinationType: "Nội tiết",
    physicianId: "doc-01",
    physicianName: "BS.CKI Trần Văn Minh",
    roomId: "room-101",
    roomName: "Phòng 101 - Khám Nội tổng quát",
    source: "RECEPTION",
    type: "INDIVIDUAL",
    status: "CONFIRMED",
    notes: "Kiểm tra chỉ số đường huyết",
    createdAt: "2026-09-23T08:00:00Z",
  },
]

let appointmentsStore: Appointment[] = [...initialAppointments]

export async function fetchAppointments(
  params?: AppointmentFilterParams
): Promise<Appointment[]> {
  await new Promise((resolve) => setTimeout(resolve, 80))

  let list = [...appointmentsStore]

  if (params?.tab && params.tab !== "ALL") {
    if (params.tab === "TODAY") {
      list = list.filter((a) => a.date === todayStr)
    } else if (params.tab === "UPCOMING") {
      list = list.filter(
        (a) =>
          a.status === "BOOKED" ||
          a.status === "CONFIRMED" ||
          a.status === "ARRIVED"
      )
    } else if (params.tab === "ARRIVED") {
      list = list.filter((a) => a.status === "ARRIVED")
    } else if (params.tab === "EXAMINED") {
      list = list.filter(
        (a) => a.status === "EXAMINED" || a.status === "CHECKED_IN"
      )
    } else if (params.tab === "CANCELLED") {
      list = list.filter(
        (a) => a.status === "CANCELLED" || a.status === "NO_SHOW"
      )
    }
  }

  if (params?.type && params.type !== "ALL") {
    list = list.filter((a) => (a.type || "INDIVIDUAL") === params.type)
  }

  if (params?.enterpriseId) {
    list = list.filter((a) => a.enterpriseId === params.enterpriseId)
  }

  if (params?.date) {
    list = list.filter((a) => a.date === params.date)
  }

  if (params?.physicianId) {
    list = list.filter((a) => a.physicianId === params.physicianId)
  }

  if (params?.examinationType) {
    list = list.filter((a) => a.examinationType === params.examinationType)
  }

  if (params?.status) {
    list = list.filter((a) => a.status === params.status)
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase()
    list = list.filter((a) => {
      const matchName = a.patientName.toLowerCase().includes(q)
      const matchCode = a.patientCode.toLowerCase().includes(q)
      const matchPhone = a.phoneNumber.includes(q)
      const matchApptCode = a.appointmentCode.toLowerCase().includes(q)
      const matchEnterprise = a.enterpriseName?.toLowerCase().includes(q) || false
      const matchBatch = a.batchName?.toLowerCase().includes(q) || false
      const matchEmpCode = a.employeeCode?.toLowerCase().includes(q) || false
      return (
        matchName ||
        matchCode ||
        matchPhone ||
        matchApptCode ||
        matchEnterprise ||
        matchBatch ||
        matchEmpCode
      )
    })
  }

  return list
}

export async function fetchAppointmentById(id: string): Promise<Appointment> {
  await new Promise((resolve) => setTimeout(resolve, 40))
  const found = appointmentsStore.find(
    (a) => a.id === id || a.appointmentCode === id
  )
  if (!found) {
    throw new Error(`Không tìm thấy lịch hẹn với mã: ${id}`)
  }
  return found
}

export async function createAppointment(
  dto: CreateAppointmentDto
): Promise<Appointment> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const patient = await fetchPatientById(dto.patientId)
  const room = initialRooms.find((r) => r.id === dto.roomId)
  const nextNum = appointmentsStore.length + 1
  const appointmentCode = `LH-260924-${String(nextNum).padStart(3, "0")}`

  const newAppt: Appointment = {
    id: `apt-${Date.now()}`,
    appointmentCode,
    patientId: patient.id,
    patientCode: patient.patientCode,
    patientName: patient.fullName,
    phoneNumber: patient.phoneNumber,
    gender: patient.gender,
    birthYear: patient.birthYear,
    date: dto.date,
    time: dto.time,
    examinationType: dto.examinationType,
    physicianId: dto.physicianId,
    physicianName: room?.physicianName || "BS. Phụ trách",
    roomId: dto.roomId,
    roomName: room ? `${room.name} - ${room.department}` : "Phòng khám",
    source: dto.source || "RECEPTION",
    status: "CONFIRMED",
    type: dto.type || (dto.enterpriseId ? "ENTERPRISE" : "INDIVIDUAL"),
    enterpriseId: dto.enterpriseId,
    enterpriseName: dto.enterpriseName,
    batchId: dto.batchId,
    batchName: dto.batchName,
    employeeCode: dto.employeeCode,
    notes: dto.notes,
    createdAt: new Date().toISOString(),
  }

  appointmentsStore = [newAppt, ...appointmentsStore]
  return newAppt
}

export async function updateAppointment(
  id: string,
  dto: UpdateAppointmentDto
): Promise<Appointment> {
  await new Promise((resolve) => setTimeout(resolve, 80))

  const index = appointmentsStore.findIndex((a) => a.id === id)
  if (index === -1) {
    throw new Error(`Không tìm thấy lịch hẹn: ${id}`)
  }

  const current = appointmentsStore[index]
  const room = dto.roomId
    ? initialRooms.find((r) => r.id === dto.roomId)
    : undefined

  const updated: Appointment = {
    ...current,
    ...dto,
    roomName: room
      ? `${room.name} - ${room.department}`
      : current.roomName,
    physicianName: room?.physicianName || current.physicianName,
  }

  appointmentsStore[index] = updated
  return updated
}

export async function cancelAppointment(
  id: string,
  reason?: string
): Promise<Appointment> {
  await new Promise((resolve) => setTimeout(resolve, 80))

  const index = appointmentsStore.findIndex((a) => a.id === id)
  if (index === -1) {
    throw new Error(`Không tìm thấy lịch hẹn: ${id}`)
  }

  const updated: Appointment = {
    ...appointmentsStore[index],
    status: "CANCELLED",
    notes: reason
      ? `${appointmentsStore[index].notes ? appointmentsStore[index].notes + " | " : ""}Lý do hủy: ${reason}`
      : appointmentsStore[index].notes,
  }

  appointmentsStore[index] = updated
  return updated
}

export async function confirmAppointmentArrived(
  id: string
): Promise<Appointment> {
  await new Promise((resolve) => setTimeout(resolve, 80))

  const index = appointmentsStore.findIndex((a) => a.id === id)
  if (index === -1) {
    throw new Error(`Không tìm thấy lịch hẹn: ${id}`)
  }

  const updated: Appointment = {
    ...appointmentsStore[index],
    status: "ARRIVED",
  }

  appointmentsStore[index] = updated
  return updated
}

export async function confirmAppointmentCheckIn(
  id: string,
  encounterCode?: string
): Promise<Appointment> {
  await new Promise((resolve) => setTimeout(resolve, 80))

  const index = appointmentsStore.findIndex(
    (a) => a.id === id || a.appointmentCode === id
  )
  if (index === -1) {
    throw new Error(`Không tìm thấy lịch hẹn: ${id}`)
  }

  const current = appointmentsStore[index]
  const updated: Appointment = {
    ...current,
    status: "CHECKED_IN",
    notes: encounterCode
      ? `${current.notes ? current.notes + " | " : ""}Đã tiếp nhận: ${encounterCode}`
      : current.notes,
  }

  appointmentsStore[index] = updated
  return updated
}

export async function fetchAppointmentCounters(): Promise<AppointmentCounters> {
  await new Promise((resolve) => setTimeout(resolve, 40))
  const todayList = appointmentsStore.filter((a) => a.date === todayStr)
  const confirmedList = appointmentsStore.filter((a) => a.status === "CONFIRMED")
  const arrivedList = appointmentsStore.filter((a) => a.status === "ARRIVED")
  const enterpriseList = appointmentsStore.filter(
    (a) => a.type === "ENTERPRISE" || a.source === "ENTERPRISE"
  )
  const examinedList = appointmentsStore.filter(
    (a) => a.status === "EXAMINED" || a.status === "CHECKED_IN"
  )

  return {
    today: todayList.length,
    confirmed: confirmedList.length,
    arrived: arrivedList.length,
    enterprise: enterpriseList.length,
    examined: examinedList.length,
  }
}

export function resetAppointmentsStore() {
  appointmentsStore = [...initialAppointments]
}
