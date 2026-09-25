import { PatientGender } from "@/modules/patients"

export type AppointmentStatus =
  | "BOOKED"
  | "CONFIRMED"
  | "ARRIVED"
  | "CHECKED_IN"
  | "EXAMINED"
  | "CANCELLED"
  | "NO_SHOW"

export type AppointmentType = "INDIVIDUAL" | "ENTERPRISE"

export type AppointmentSource = "RECEPTION" | "ONLINE" | "ENTERPRISE"

export type AppointmentTab =
  | "ALL"
  | "TODAY"
  | "UPCOMING"
  | "ARRIVED"
  | "EXAMINED"
  | "CANCELLED"

export interface AppointmentCounters {
  today: number
  confirmed: number
  arrived: number
  enterprise: number
  examined: number
}

export interface Appointment {
  id: string
  appointmentCode: string
  patientId: string
  patientCode: string
  patientName: string
  phoneNumber: string
  gender: PatientGender
  birthYear: number
  date: string
  time: string
  examinationType: string
  physicianId: string
  physicianName: string
  roomId: string
  roomName: string
  source: AppointmentSource
  status: AppointmentStatus
  type?: AppointmentType
  enterpriseId?: string
  enterpriseName?: string
  batchId?: string
  batchName?: string
  employeeCode?: string
  notes?: string
  createdAt: string
}

export interface AppointmentFilterParams {
  tab?: AppointmentTab
  date?: string
  physicianId?: string
  examinationType?: string
  status?: AppointmentStatus
  search?: string
  type?: AppointmentType | "ALL"
  enterpriseId?: string
}

export interface CreateAppointmentDto {
  patientId: string
  examinationType: string
  physicianId: string
  roomId: string
  date: string
  time: string
  notes?: string
  source?: AppointmentSource
  type?: AppointmentType
  enterpriseId?: string
  enterpriseName?: string
  batchId?: string
  batchName?: string
  employeeCode?: string
}

export interface UpdateAppointmentDto {
  date?: string
  time?: string
  physicianId?: string
  roomId?: string
  examinationType?: string
  notes?: string
  status?: AppointmentStatus
}
