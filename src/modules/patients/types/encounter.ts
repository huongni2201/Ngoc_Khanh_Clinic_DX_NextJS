export type EncounterStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export interface EncounterSummary {
  id: string
  encounterCode: string
  patientId: string
  examDate: string
  examType: string
  physicianName: string
  room: string
  status: EncounterStatus
  statusLabel: string
  primaryDiagnosis: string
}

export interface VitalSigns {
  heartRate: number // bpm
  bloodPressure: string // mmHg (e.g. 120/80)
  temperature: number // °C (e.g. 37.8)
  respiratoryRate: number // breaths/min (e.g. 18)
  weight: number // kg (e.g. 68)
  height: number // cm (e.g. 172)
  bmi: number // e.g. 23.0
  bmiClassification: string // e.g. "Bình thường"
  spo2: number // % (e.g. 98)
}

export interface ClinicalExamFindings {
  throat: string
  lungs: string
  heart: string
  abdomen: string
  otherFindings?: string
}

export interface EncounterClinicalRecord {
  chiefComplaint: string
  onsetDuration: string
  medicalHistory: string
  vitals: VitalSigns
  clinicalFindings: ClinicalExamFindings
  clinicalNotes: string
}

export interface DiagnosisItem {
  id: string
  stt: number
  type: "PRIMARY" | "SECONDARY" | "DIFFERENTIAL"
  typeLabel: string
  icdCode: string
  diseaseName: string
  clinicalNotes: string
}

export interface PrescriptionItem {
  id: string
  stt: number
  medicationName: string
  strength: string
  dosage: string
  route: string
  quantity: string
  instructions: string
}

export type LabOrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED"

export interface LabOrderItem {
  id: string
  stt: number
  code: string
  category: "LAB" | "IMAGING" | "FUNCTIONAL" | "ENDOSCOPY"
  serviceName: string
  performedAt: string
  status: LabOrderStatus
  statusLabel: string
  summaryResult: string
  actionType: "detail" | "pdf"
  detailViewKey?: string
}

export interface LabIndicatorResult {
  stt: number
  indicatorName: string
  shortCode: string
  value: string
  unit: string
  referenceRange: string
  evaluation: "NORMAL" | "HIGH" | "LOW" | "ABNORMAL"
  evaluationLabel: string
}

export interface LaboratoryReportDetail {
  orderCode: string
  serviceName: string
  sampleCollector: string
  sampledAt: string
  resultReportedAt: string
  orderingPhysician: string
  approvingPhysician: string
  statusLabel: string
  indicators: LabIndicatorResult[]
  conclusion: string
  notes: string
}

export interface DiagnosticReportDetail {
  orderCode: string
  serviceName: string
  technique: string
  performedAt: string
  orderingPhysician: string
  radiologist: string
  device: string
  imageUrl: string
  descriptionPoints: string[]
  conclusion: string
  recommendation: string
}

export interface EncounterDocument {
  id: string
  stt: number
  name: string
  type: string
  sizeFormat: string
  createdAt: string
  createdBy: string
}

export interface EncounterDetailData {
  encounter: EncounterSummary
  patient: {
    id: string
    patientCode: string
    fullName: string
    dateOfBirth: string
    age: number
    gender: "MALE" | "FEMALE" | "OTHER"
    genderLabel: string
    identificationNumber: string
    phoneNumber: string
    email?: string
    address?: string
  }
  clinicalRecord: EncounterClinicalRecord
  diagnoses: DiagnosisItem[]
  prescriptions: {
    items: PrescriptionItem[]
    doctorNotes: string
    prescriptionCode: string
    prescribedAt: string
  }
  labOrders: LabOrderItem[]
  laboratoryReportCBC: LaboratoryReportDetail
  labDetailCBC?: LaboratoryReportDetail
  diagnosticReportXRay: DiagnosticReportDetail
  imagingDetailXRay?: DiagnosticReportDetail
  documents: EncounterDocument[]
  treatmentSummary: {
    conclusion: string
    treatmentPlan: string
    doctorAdvice: string
    followUpDate: string
  }
}
