import {
  Encounter,
  ReceptionCounters,
  ClinicRoom,
  LegacyReceptionEncounter,
  LegacyReceptionInvoice,
  ReceptionFilterParams,
  PatientCheckInRequest,
  AssignRoomDto,
  ProcessPaymentDto,
} from "../types"
import { fetchPatientById } from "@/modules/patients"
import type { EncounterStatus } from "@/modules/encounters/types"
import { deriveReceptionWorklistStage } from "../lib/reception-worklist-stage"

function mapLegacyEncounter(legacy: LegacyReceptionEncounter): Encounter {
  const { status, ...encounterFields } = legacy
  const checkInStatus = status === "WAITING_RECEPTION" ? "NOT_CHECKED_IN" : "CHECKED_IN"
  const encounterStatus: EncounterStatus =
    status === "EXAMINING"
      ? "IN_PROGRESS"
      : status === "CANCELLED"
        ? "CANCELLED"
        : status === "WAITING_RECEPTION" || status === "RECEIVED" || status === "WAITING_EXAM"
          ? "PLANNED"
          : "COMPLETED"
  const paymentStatus = status === "WAITING_PAYMENT" ? "PENDING" : undefined
  const diagnosticWorkflowStatus = status === "WAITING_RESULT" ? "IN_PROGRESS" : undefined

  return {
    ...encounterFields,
    checkInStatus,
    encounterStatus,
    paymentStatus,
    diagnosticWorkflowStatus,
    worklistStage: deriveReceptionWorklistStage({
      checkInStatus,
      encounterStatus,
      paymentStatus,
      diagnosticWorkflowStatus,
    }),
  }
}

export const initialRooms: ClinicRoom[] = [
  {
    id: "room-101",
    name: "Phòng 101",
    department: "Khám Nội tổng quát",
    physicianName: "BS.CKI Trần Văn Minh",
    physicianId: "doc-01",
    status: "ACTIVE",
    waitingCount: 3,
    estimatedWaitTime: "~15 phút",
  },
  {
    id: "room-102",
    name: "Phòng 102",
    department: "Khám Cơ xương khớp",
    physicianName: "BS. Lê Đức Anh",
    physicianId: "doc-02",
    status: "ACTIVE",
    waitingCount: 2,
    estimatedWaitTime: "~10 phút",
  },
  {
    id: "room-103",
    name: "Phòng 103",
    department: "Khám Hô hấp - Tai Mũi Họng",
    physicianName: "BS. Phạm Quang Huy",
    physicianId: "doc-03",
    status: "ACTIVE",
    waitingCount: 1,
    estimatedWaitTime: "~5 phút",
  },
  {
    id: "room-104",
    name: "Phòng 104",
    department: "Khám Tổng quát",
    physicianName: "BS. Nguyễn Thị Lan",
    physicianId: "doc-04",
    status: "ACTIVE",
    waitingCount: 0,
    estimatedWaitTime: "Sẵn sàng",
  },
  {
    id: "room-105",
    name: "Phòng 105",
    department: "Sản phụ khoa",
    physicianName: "ThS.BS Đỗ Mỹ Linh",
    physicianId: "doc-05",
    status: "ACTIVE",
    waitingCount: 2,
    estimatedWaitTime: "~10 phút",
  },
]

const initialLegacyEncounters: LegacyReceptionEncounter[] = [
  {
    id: "enc-001",
    encounterCode: "LK-260924-001",
    patientId: "pat-001",
    patientCode: "BN001256",
    patientName: "Nguyễn Văn Minh",
    birthYear: 1985,
    dateOfBirth: "1985-05-15",
    gender: "MALE",
    phoneNumber: "0912 345 678",
    identificationNumber: "001085002456",
    arrivalTime: "08:15",
    examinationType: "Khám tổng quát",
    status: "WAITING_RECEPTION",
    printFormOnCheckIn: true,
    createdAt: "2026-09-24T08:15:00Z",
  },
  {
    id: "enc-002",
    encounterCode: "LK-260924-002",
    patientId: "pat-002",
    patientCode: "BN001245",
    patientName: "Trần Thị Mai",
    birthYear: 1993,
    dateOfBirth: "1993-08-22",
    gender: "FEMALE",
    phoneNumber: "0987 654 321",
    identificationNumber: "001193005872",
    arrivalTime: "08:30",
    examinationType: "Khám nội tổng quát",
    roomId: "room-101",
    roomName: "Phòng 101 - Khám Nội tổng quát",
    physicianId: "doc-01",
    physicianName: "BS.CKI Trần Văn Minh",
    status: "EXAMINING",
    printFormOnCheckIn: true,
    createdAt: "2026-09-24T08:30:00Z",
  },
  {
    id: "enc-003",
    encounterCode: "LK-260924-003",
    patientId: "pat-003",
    patientCode: "BN001312",
    patientName: "Lê Đức Anh",
    birthYear: 1978,
    dateOfBirth: "1978-11-10",
    gender: "MALE",
    phoneNumber: "0901 234 567",
    identificationNumber: "001078009123",
    arrivalTime: "08:45",
    examinationType: "Khám cơ xương khớp",
    roomId: "room-102",
    roomName: "Phòng 102 - Khám Cơ xương khớp",
    physicianId: "doc-02",
    physicianName: "BS. Lê Đức Anh",
    status: "WAITING_PAYMENT",
    printFormOnCheckIn: true,
    createdAt: "2026-09-24T08:45:00Z",
  },
  {
    id: "enc-004",
    encounterCode: "LK-260924-004",
    patientId: "pat-004",
    patientCode: "BN001276",
    patientName: "Phạm Thị Hường",
    birthYear: 1990,
    dateOfBirth: "1990-04-18",
    gender: "FEMALE",
    phoneNumber: "0933 678 901",
    identificationNumber: "001190004312",
    arrivalTime: "09:00",
    examinationType: "Khám thai",
    status: "WAITING_RECEPTION",
    printFormOnCheckIn: true,
    createdAt: "2026-09-24T09:00:00Z",
  },
  {
    id: "enc-005",
    encounterCode: "LK-260924-005",
    patientId: "pat-005",
    patientCode: "BN001233",
    patientName: "Hoàng Văn Long",
    birthYear: 1982,
    dateOfBirth: "1982-12-05",
    gender: "MALE",
    phoneNumber: "0919 876 543",
    identificationNumber: "001082007845",
    arrivalTime: "08:20",
    examinationType: "Khám hô hấp",
    roomId: "room-103",
    roomName: "Phòng 103 - Khám Hô hấp",
    physicianId: "doc-03",
    physicianName: "BS. Phạm Quang Huy",
    status: "WAITING_RESULT",
    printFormOnCheckIn: true,
    createdAt: "2026-09-24T08:20:00Z",
  },
  {
    id: "enc-006",
    encounterCode: "LK-260924-006",
    patientId: "pat-006",
    patientCode: "BN001289",
    patientName: "Đỗ Thị Thu Hà",
    birthYear: 1996,
    dateOfBirth: "1996-03-30",
    gender: "FEMALE",
    phoneNumber: "0945 123 987",
    identificationNumber: "001196001289",
    arrivalTime: "08:05",
    examinationType: "Khám nội tổng quát",
    roomId: "room-101",
    roomName: "Phòng 101 - Khám Nội tổng quát",
    physicianId: "doc-01",
    physicianName: "BS.CKI Trần Văn Minh",
    status: "WAITING_EXAM",
    printFormOnCheckIn: true,
    createdAt: "2026-09-24T08:05:00Z",
  },
  {
    id: "enc-007",
    encounterCode: "LK-260924-007",
    patientId: "pat-007",
    patientCode: "BN001290",
    patientName: "Vũ Đình Tuấn",
    birthYear: 1988,
    dateOfBirth: "1988-07-14",
    gender: "MALE",
    phoneNumber: "0978 234 561",
    identificationNumber: "001088006543",
    arrivalTime: "07:50",
    examinationType: "Khám tổng quát",
    roomId: "room-104",
    roomName: "Phòng 104 - Khám Tổng quát",
    physicianId: "doc-04",
    physicianName: "BS. Nguyễn Thị Lan",
    status: "COMPLETED",
    printFormOnCheckIn: true,
    createdAt: "2026-09-24T07:50:00Z",
  },
  {
    id: "enc-008",
    encounterCode: "LK-260924-008",
    patientId: "pat-008",
    patientCode: "BN001295",
    patientName: "Nguyễn Thu Thủy",
    birthYear: 1995,
    dateOfBirth: "1995-09-20",
    gender: "FEMALE",
    phoneNumber: "0966 456 789",
    identificationNumber: "001195007788",
    arrivalTime: "08:55",
    examinationType: "Khám da liễu",
    status: "RECEIVED",
    printFormOnCheckIn: true,
    createdAt: "2026-09-24T08:55:00Z",
  },
]

export const initialEncounters: Encounter[] = initialLegacyEncounters.map(mapLegacyEncounter)

let encountersStore: Encounter[] = [...initialEncounters]
let roomsStore: ClinicRoom[] = [...initialRooms]

const initialInvoices: LegacyReceptionInvoice[] = [
  {
    id: "inv-001",
    encounterId: "enc-003",
    encounterCode: "LK-260924-003",
    patientId: "pat-003",
    patientCode: "BN001312",
    patientName: "Lê Đức Anh",
    items: [
      {
        id: "bi-01",
        name: "Khám chuyên khoa Cơ xương khớp",
        unitPrice: 200000,
        quantity: 1,
        amount: 200000,
        category: "Khám bệnh",
      },
      {
        id: "bi-02",
        name: "Chụp X-quang khớp gối thẳng/nghiêng (Chỉ định bác sĩ)",
        unitPrice: 250000,
        quantity: 1,
        amount: 250000,
        category: "Chẩn đoán hình ảnh",
      },
    ],
    subtotal: 450000,
    discount: 0,
    total: 450000,
    paymentMethod: "CASH",
    isPaid: false,
  },
]

let invoicesStore: LegacyReceptionInvoice[] = [...initialInvoices]

function withWorklistStage(encounter: Encounter): Encounter {
  const invoice = invoicesStore.find((item) => item.encounterId === encounter.id)

  return {
    ...encounter,
    worklistStage: deriveReceptionWorklistStage({
      checkInStatus: encounter.checkInStatus,
      encounterStatus: encounter.encounterStatus,
      paymentStatus: invoice ? (invoice.isPaid ? "PAID" : encounter.paymentStatus ?? "PENDING") : encounter.paymentStatus,
      diagnosticWorkflowStatus: encounter.diagnosticWorkflowStatus,
    }),
  }
}

export async function fetchReceptionCounters(): Promise<ReceptionCounters> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const staged = encountersStore.map(withWorklistStage)
  const waitingReception = staged.filter((e) => e.worklistStage === "WAITING_CHECK_IN").length
  const examining = staged.filter((e) => e.worklistStage === "IN_EXAMINATION").length
  const waitingPayment = staged.filter((e) => e.worklistStage === "WAITING_PAYMENT").length
  const waitingResult = staged.filter((e) => e.worklistStage === "WAITING_DIAGNOSTIC_RESULTS").length
  const completedToday = staged.filter((e) => e.worklistStage === "COMPLETED").length + 27 // Seeded offset to display 28

  return {
    waitingReception: waitingReception > 0 ? waitingReception + 5 : 8,
    examining: examining > 0 ? examining + 2 : 3,
    waitingPayment: waitingPayment > 0 ? waitingPayment + 1 : 2,
    waitingResult: waitingResult > 0 ? waitingResult : 1,
    completedToday,
  }
}

export async function fetchClinicRooms(): Promise<ClinicRoom[]> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return [...roomsStore]
}

export async function fetchReceptionWorklist(
  params?: ReceptionFilterParams
): Promise<Encounter[]> {
  await new Promise((resolve) => setTimeout(resolve, 80))

  let list = [...encountersStore]

  list = list.map(withWorklistStage)

  if (params?.tab && params.tab !== "ALL") {
    list = list.filter((e) => e.worklistStage === params.tab)
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase()
    list = list.filter((e) => {
      const matchName = e.patientName.toLowerCase().includes(q)
      const matchCode = e.patientCode.toLowerCase().includes(q)
      const matchPhone = e.phoneNumber.toLowerCase().includes(q)
      const matchId = e.identificationNumber.toLowerCase().includes(q)
      const matchEncounter = e.encounterCode.toLowerCase().includes(q)
      return matchName || matchCode || matchPhone || matchId || matchEncounter
    })
  }

  if (params?.roomId) {
    list = list.filter((e) => e.roomId === params.roomId)
  }

  if (params?.physicianId) {
    list = list.filter((e) => e.physicianId === params.physicianId)
  }

  return list.map(withWorklistStage)
}

export async function fetchEncounterById(encounterId: string): Promise<Encounter> {
  await new Promise((resolve) => setTimeout(resolve, 40))
  const enc = encountersStore.find(
    (e) => e.id === encounterId || e.encounterCode === encounterId
  )
  if (!enc) {
    throw new Error(`Không tìm thấy lượt khám với mã: ${encounterId}`)
  }
  return withWorklistStage(enc)
}

export async function checkInPatient(dto: PatientCheckInRequest): Promise<Encounter> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const patient = await fetchPatientById(dto.patientId)
  const room = dto.roomId
    ? roomsStore.find((r) => r.id === dto.roomId)
    : undefined

  const now = new Date()
  const hours = String(now.getHours()).padStart(2, "0")
  const mins = String(now.getMinutes()).padStart(2, "0")
  const arrivalTime = `${hours}:${mins}`

  const nextCodeNum = encountersStore.length + 1
  const encounterCode = `LK-260924-${String(nextCodeNum).padStart(3, "0")}`

  const newEncounter: Encounter = {
    id: `enc-${Date.now()}`,
    encounterCode,
    patientId: patient.id,
    patientCode: patient.patientCode,
    patientName: patient.fullName,
    birthYear: patient.birthYear,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    phoneNumber: patient.phoneNumber,
    identificationNumber: patient.identificationNumber,
    arrivalTime,
    examinationType: dto.examinationType,
    roomId: room?.id,
    roomName: room ? `${room.name} - ${room.department}` : undefined,
    physicianId: room?.physicianId || dto.physicianId,
    physicianName: room?.physicianName,
    reasonForVisit: dto.reasonForVisit,
    notes: dto.notes,
    checkInStatus: "CHECKED_IN",
    encounterStatus: "PLANNED",
    worklistStage: "WAITING_EXAMINATION",
    printFormOnCheckIn: dto.printAfterReception ?? true,
    createdAt: new Date().toISOString(),
  }

  encountersStore = [newEncounter, ...encountersStore]

  // Create default initial fee item for check-in
  const defaultFee = 150000
  const invoice: LegacyReceptionInvoice = {
    id: `inv-${Date.now()}`,
    encounterId: newEncounter.id,
    encounterCode: newEncounter.encounterCode,
    patientId: patient.id,
    patientCode: patient.patientCode,
    patientName: patient.fullName,
    items: [
      {
        id: `bi-${Date.now()}`,
        name: `Phí ${dto.examinationType}`,
        unitPrice: defaultFee,
        quantity: 1,
        amount: defaultFee,
        category: "Khám ban đầu",
      },
    ],
    subtotal: defaultFee,
    discount: 0,
    total: defaultFee,
    paymentMethod: "CASH",
    isPaid: false,
  }
  invoicesStore = [invoice, ...invoicesStore]

  return withWorklistStage(newEncounter)
}

export async function assignRoomAndDoctor(
  dto: AssignRoomDto
): Promise<Encounter> {
  await new Promise((resolve) => setTimeout(resolve, 80))

  const index = encountersStore.findIndex((e) => e.id === dto.encounterId)
  if (index === -1) {
    throw new Error(`Không tìm thấy lượt khám với ID: ${dto.encounterId}`)
  }

  const room = roomsStore.find((r) => r.id === dto.roomId)
  if (!room) {
    throw new Error(`Không tìm thấy phòng khám với ID: ${dto.roomId}`)
  }

  const updated: Encounter = {
    ...encountersStore[index],
    roomId: room.id,
    roomName: `${room.name} - ${room.department}`,
    physicianId: dto.physicianId || room.physicianId,
    physicianName: room.physicianName,
    encounterStatus: "PLANNED",
    worklistStage: "WAITING_EXAMINATION",
  }

  encountersStore[index] = updated
  return withWorklistStage(updated)
}

export async function fetchInvoiceByEncounter(
  encounterId: string
): Promise<LegacyReceptionInvoice> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const invoice = invoicesStore.find((i) => i.encounterId === encounterId)
  if (invoice) {
    return invoice
  }

  const encounter = encountersStore.find((e) => e.id === encounterId)
  if (!encounter) {
    throw new Error(`Không tìm thấy dữ liệu lượt khám: ${encounterId}`)
  }

  // Generate standard invoice for encounter
  const standardFee = 150000
  const newInvoice: LegacyReceptionInvoice = {
    id: `inv-${Date.now()}`,
    encounterId: encounter.id,
    encounterCode: encounter.encounterCode,
    patientId: encounter.patientId,
    patientCode: encounter.patientCode,
    patientName: encounter.patientName,
    items: [
      {
        id: `bi-${Date.now()}`,
        name: `Phí ${encounter.examinationType}`,
        unitPrice: standardFee,
        quantity: 1,
        amount: standardFee,
        category: "Khám ban đầu",
      },
    ],
    subtotal: standardFee,
    discount: 0,
    total: standardFee,
    paymentMethod: "CASH",
    isPaid: false,
  }

  invoicesStore = [newInvoice, ...invoicesStore]
  return newInvoice
}

/** Read-only adapter seam for billing; the store remains owned by reception until the API is wired. */
export async function fetchReceptionInvoices(): Promise<LegacyReceptionInvoice[]> {
  await new Promise((resolve) => setTimeout(resolve, 30))
  return [...invoicesStore]
}

export async function processPayment(dto: ProcessPaymentDto): Promise<LegacyReceptionInvoice> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const invoiceIndex = invoicesStore.findIndex(
    (i) => i.encounterId === dto.encounterId
  )
  if (invoiceIndex === -1) {
    throw new Error(`Không tìm thấy hóa đơn cho lượt khám: ${dto.encounterId}`)
  }

  const currentInvoice = invoicesStore[invoiceIndex]
  const discount = dto.discount || 0
  const total = Math.max(0, currentInvoice.subtotal - discount)

  const updatedInvoice: LegacyReceptionInvoice = {
    ...currentInvoice,
    discount,
    total,
    paymentMethod: dto.paymentMethod,
    isPaid: true,
    paidAt: new Date().toISOString(),
    cashierName: "Nguyễn Thị Lan (Lễ tân)",
  }

  invoicesStore[invoiceIndex] = updatedInvoice

  // Update encounter status if it was waiting payment
  const encounterIndex = encountersStore.findIndex(
    (e) => e.id === dto.encounterId
  )
  if (encounterIndex !== -1) {
    const enc = encountersStore[encounterIndex]
    if (enc.paymentStatus === "PENDING") {
      encountersStore[encounterIndex] = {
        ...enc,
        paymentStatus: "PAID",
        diagnosticWorkflowStatus: "IN_PROGRESS",
        worklistStage: "WAITING_DIAGNOSTIC_RESULTS",
      }
    }
  }

  return updatedInvoice
}

export function resetReceptionStore() {
  encountersStore = [...initialEncounters]
  roomsStore = [...initialRooms]
  invoicesStore = [...initialInvoices]
}
