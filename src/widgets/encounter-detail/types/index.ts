import type { EncounterSummary } from "@/modules/encounter"
import type { EncounterClinicalRecord, DiagnosisItem, DiagnosticServiceRequest } from "@/modules/clinical"
import type { LaboratoryReport, ImagingReport } from "@/modules/diagnostics"
import type { PrescriptionDetails } from "@/modules/prescription"
import type { EncounterDocument } from "@/modules/document"

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
  prescriptions: PrescriptionDetails
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
