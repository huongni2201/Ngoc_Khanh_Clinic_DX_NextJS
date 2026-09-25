import { PatientGender } from "@/modules/patients"

export type ReceptionStatus =
  | "WAITING_RECEPTION"
  | "RECEIVED"
  | "WAITING_EXAM"
  | "EXAMINING"
  | "WAITING_PAYMENT"
  | "WAITING_RESULT"
  | "COMPLETED"
  | "CANCELLED"

export type ReceptionTab =
  | "ALL"
  | "WAITING_RECEPTION"
  | "WAITING_EXAM"
  | "EXAMINING"
  | "WAITING_PAYMENT"
  | "WAITING_RESULT"
  | "COMPLETED"

export interface Encounter {
  id: string
  encounterCode: string
  patientId: string
  patientCode: string
  patientName: string
  birthYear: number
  dateOfBirth: string
  gender: PatientGender
  phoneNumber: string
  identificationNumber: string
  arrivalTime: string
  examinationType: string
  roomId?: string
  roomName?: string
  physicianId?: string
  physicianName?: string
  reasonForVisit?: string
  notes?: string
  status: ReceptionStatus
  printFormOnCheckIn?: boolean
  createdAt: string
}

export interface ExaminationRoom {
  id: string
  name: string
  department: string
  physicianName: string
  physicianId: string
  status: "ACTIVE" | "BUSY" | "OFF"
  waitingCount: number
  estimatedWaitTime: string
}

export interface BillableItem {
  id: string
  name: string
  unitPrice: number
  quantity: number
  amount: number
  category?: string
}

export interface Invoice {
  id: string
  encounterId: string
  encounterCode: string
  patientId: string
  patientName: string
  patientCode: string
  items: BillableItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: "CASH" | "TRANSFER"
  isPaid: boolean
  paidAt?: string
  cashierName?: string
}

export interface ReceptionCounters {
  waitingReception: number
  examining: number
  waitingPayment: number
  waitingResult: number
  completedToday: number
}

export interface ReceptionFilterParams {
  tab?: ReceptionTab
  search?: string
  roomId?: string
  physicianId?: string
  status?: ReceptionStatus
}

export interface ReceivePatientDto {
  patientId: string
  examinationType: string
  roomId?: string
  physicianId?: string
  reasonForVisit?: string
  notes?: string
  printAfterReception?: boolean
}

export interface AssignRoomDto {
  encounterId: string
  roomId: string
  physicianId: string
}

export interface ProcessPaymentDto {
  encounterId: string
  paymentMethod: "CASH" | "TRANSFER"
  discount?: number
  printReceipt?: boolean
}
