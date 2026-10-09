export interface VitalSigns {
  heartRate: number
  bloodPressure: string
  temperature: number
  respiratoryRate: number
  weight: number
  height: number
  bmi: number
  bmiClassification: string
  spo2: number
}

export interface PhysicalExamFindings {
  throat: string
  lungs: string
  heart: string
  abdomen: string
  otherFindings?: string
}

export interface EncounterClinicalRecord {
  chiefComplaint: string
  onsetDuration: string
  historyOfPresentIllness: string
  pastMedicalHistory: string
  vitalSigns: VitalSigns
  physicalExamFindings: PhysicalExamFindings
  clinicalNotes: string
}

export interface DiagnosisItem {
  id: string
  sequence: number
  type: "PRIMARY" | "SECONDARY" | "DIFFERENTIAL"
  typeLabel: string
  icdCode: string
  diagnosisName: string
  clinicalNotes: string
}

export type ServiceRequestStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED"

export interface DiagnosticServiceRequest {
  id: string
  sequence: number
  code: string
  category: "LAB" | "IMAGING" | "FUNCTIONAL" | "ENDOSCOPY"
  serviceName: string
  performedAt: string
  status: ServiceRequestStatus
  statusLabel: string
  summaryResult: string
  actionType: "detail" | "pdf"
  detailViewKey?: string
}
