import type { PatientGender } from "@/modules/patients"

export type AppointmentStatus =
  | "BOOKED"
  | "CONFIRMED"
  | "ARRIVED"
  | "CHECKED_IN"
  | "EXAMINED"
  | "CANCELLED"
  | "NO_SHOW"

export type CareProgram = "INDIVIDUAL" | "ORGANIZATION_HEALTH_EXAMINATION"
export type BookingChannel = "FRONT_DESK" | "ONLINE" | "IMPORT" | "OTHER"

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
  organization: number
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
  bookingChannel: BookingChannel
  careProgram: CareProgram
  status: AppointmentStatus
  organizationId?: string
  organizationName?: string
  healthExaminationBatchId?: string
  healthExaminationBatchName?: string
  participantCode?: string
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
  careProgram?: CareProgram | "ALL"
  organizationId?: string
}

export interface CreateAppointmentDto {
  patientId: string
  examinationType: string
  physicianId: string
  roomId: string
  date: string
  time: string
  notes?: string
  bookingChannel?: BookingChannel
  careProgram?: CareProgram
  organizationId?: string
  organizationName?: string
  healthExaminationBatchId?: string
  healthExaminationBatchName?: string
  participantCode?: string
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
