export type PatientGender = "MALE" | "FEMALE" | "OTHER"

export type PatientAgeGroup = "ALL" | "<18" | "18-40" | "41-60" | ">60"

export interface Patient {
  id: string
  patientCode: string
  fullName: string
  dateOfBirth: string
  birthYear: number
  gender: PatientGender
  identificationNumber: string
  phoneNumber: string
  email?: string
  address?: string
  lastExamDate?: string
  createdAt?: string
}

export interface CreatePatientDto {
  fullName: string
  dateOfBirth: string
  gender: PatientGender
  identificationNumber: string
  phoneNumber: string
  email?: string
  address?: string
}

export interface UpdatePatientDto {
  fullName?: string
  dateOfBirth?: string
  gender?: PatientGender
  identificationNumber?: string
  phoneNumber?: string
  email?: string
  address?: string
  lastExamDate?: string
}

export interface PatientFilterParams {
  search?: string
  gender?: PatientGender | "ALL"
  ageGroup?: PatientAgeGroup
  page?: number
  pageSize?: number
}

export interface PatientCounters {
  total: number
  todayVisits: number
  maleCount: number
  femaleCount: number
  elderlyCount: number
}

export * from "./encounter"
