export type EncounterStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED"

export interface EncounterSummary {
  id: string
  encounterCode: string
  patientId: string
  encounterDate: string
  serviceName: string
  physicianName: string
  room: string
  status: EncounterStatus
  statusLabel: string
  primaryDiagnosis: string
}

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

export interface PrescriptionItem {
  id: string
  sequence: number
  medicationName: string
  strength: string
  dosage: string
  route: string
  quantity: string
  instructions: string
}

export type ServiceRequestStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED"

export type DiagnosticWorkflowStatus =
  | "NOT_ORDERED"
  | "ORDERED"
  | "IN_PROGRESS"
  | "RESULTS_AVAILABLE"

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

export interface LabResult {
  sequence: number
  analyteName: string
  code: string
  value: string
  unit: string
  referenceRange: string
  interpretation: "NORMAL" | "HIGH" | "LOW" | "ABNORMAL"
  interpretationLabel: string
}

export interface LaboratoryReport {
  orderCode: string
  serviceName: string
  sampleCollector: string
  sampledAt: string
  resultReportedAt: string
  orderingPhysician: string
  approvingPhysician: string
  statusLabel: string
  indicators: LabResult[]
  conclusion: string
  notes: string
}

export interface ImagingReport {
  orderCode: string
  serviceName: string
  technique: string
  performedAt: string
  orderingPhysician: string
  radiologist: string
  device: string
  imageUrl: string
  findings: string[]
  impression: string
  recommendation: string
}

export interface EncounterDocument {
  id: string
  sequence: number
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
  diagnosticServiceRequests: DiagnosticServiceRequest[]
  laboratoryReport: LaboratoryReport
  imagingReport: ImagingReport
  documents: EncounterDocument[]
  assessmentAndPlan: {
    conclusion: string
    treatmentPlan: string
    patientInstructions: string
    followUpDate: string
  }
}
