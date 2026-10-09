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
