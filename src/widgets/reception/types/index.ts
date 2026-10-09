import type { PatientGender } from "@/modules/patient"
import type { DiagnosticWorkflowStatus } from "./diagnostic-workflow-status"
import type { EncounterStatus } from "@/modules/encounter"
import type { PaymentStatus } from "@/modules/billing"
import type { ReceptionWorklistStage } from "../lib/reception-worklist-stage"

export type CheckInStatus = "NOT_CHECKED_IN" | "CHECKED_IN"

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
