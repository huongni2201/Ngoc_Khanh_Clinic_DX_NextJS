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

export interface PrescriptionDetails {
  items: PrescriptionItem[]
  doctorNotes: string
  prescriptionCode: string
  prescribedAt: string
}

export interface PrescriptionPrintData {
  prescriptions: PrescriptionDetails
  patient: {
    fullName: string
    dateOfBirth: string
    age: number
    genderLabel: string
    patientCode: string
    phoneNumber: string
    address?: string
  }
  encounter: {
    encounterCode: string
    primaryDiagnosis: string
    physicianName: string
  }
}
