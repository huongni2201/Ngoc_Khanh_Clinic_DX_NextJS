import type { PatientGender } from "@/modules/patients"
import type { DiagnosticWorkflowStatus, EncounterStatus } from "@/modules/encounters/types"
import type { PaymentStatus } from "@/modules/billing/types"
import type { ReceptionWorklistStage } from "../lib/reception-worklist-stage"

export type CheckInStatus = "NOT_CHECKED_IN" | "CHECKED_IN"

/** Transport-only status used while the reception mock/API is migrated. */
export type LegacyReceptionStatus =
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
  | "WAITING_CHECK_IN"
  | "WAITING_EXAMINATION"
  | "IN_EXAMINATION"
  | "WAITING_PAYMENT"
  | "WAITING_DIAGNOSTIC_RESULTS"
  | "READY_FOR_CONCLUSION"
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
  checkInStatus: CheckInStatus
  encounterStatus: EncounterStatus
  paymentStatus?: PaymentStatus
  diagnosticWorkflowStatus?: DiagnosticWorkflowStatus
  worklistStage?: ReceptionWorklistStage
  printFormOnCheckIn?: boolean
  createdAt: string
}

export type LegacyReceptionEncounter = Omit<
  Encounter,
  "checkInStatus" | "encounterStatus" | "paymentStatus" | "diagnosticWorkflowStatus" | "worklistStage"
> & {
  status: LegacyReceptionStatus
}

export interface ClinicRoom {
  id: string
  name: string
  department: string
  physicianName: string
  physicianId: string
  status: "ACTIVE" | "BUSY" | "OFF"
  waitingCount: number
  estimatedWaitTime: string
}

/** Legacy billing payload owned by the reception transport adapter. */
export interface LegacyBillableItem {
  id: string
  name: string
  unitPrice: number
  quantity: number
  amount: number
  category?: string
}

export interface LegacyReceptionInvoice {
  id: string
  encounterId: string
  encounterCode: string
  patientId: string
  patientName: string
  patientCode: string
  items: LegacyBillableItem[]
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
}

export interface PatientCheckInRequest {
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
