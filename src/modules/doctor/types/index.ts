export type DoctorEncounterStatus =
  | "WAITING_EXAM"
  | "EXAMINING"
  | "WAITING_CLS"
  | "WAITING_CONCLUSION"
  | "COMPLETED"

export interface PrescribedItem {
  id: string
  code: string
  name: string
  category: "XÉT_NGHIỆM" | "CHẨN_ĐOÁN_HÌNH_ẢNH" | "THĂM_DÒ_CHỨC_NĂNG" | "KHÁM_CHUYÊN_KHOA"
  status: "COMPLETED" | "WAITING_RESULT" | "IN_PROGRESS"
  resultSummary?: string
  orderTime?: string
}

export interface VitalSigns {
  bp?: string
  pulse?: number
  temp?: number
  spO2?: number
  weight?: number
  height?: number
  bmi?: number
}

export interface DoctorEncounter {
  id: string
  stt: number
  encounterCode: string
  patientId: string
  patientName: string
  birthYear: number
  gender: "Nam" | "Nữ"
  checkinTime: string
  roomName: string
  chiefComplaint: string
  prescribedItemsCount: number
  status: DoctorEncounterStatus
  assignedDoctor: string
  phoneNumber?: string
  identificationNumber?: string
  address?: string
  priority?: "NORMAL" | "PRIORITY" | "EMERGENCY"
  vitalSigns?: VitalSigns
  prescribedItems?: PrescribedItem[]
  diagnosis?: string
  treatmentPlan?: string
  notes?: string
}

export interface DoctorCounters {
  waitingExam: number
  examining: number
  waitingCls: number
  waitingConclusion: number
  completed: number
}

export interface DoctorFilterParams {
  search?: string
  room?: string
  status?: DoctorEncounterStatus | "ALL"
  doctor?: string
  date?: string
  page?: number
  pageSize?: number
  sortDirection?: "asc" | "desc"
  priority?: string
  examType?: string
}

export interface DoctorWorklistResponse {
  items: DoctorEncounter[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  counters: DoctorCounters
}
