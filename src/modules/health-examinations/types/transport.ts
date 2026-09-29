export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface BatchParticipantResponseDto {
  batchParticipantId: string
  participantId: string
  participantCode: string | null
  departmentName: string | null
  jobTitle: string | null
  occupation: string | null
  fullName: string
  dateOfBirth: string
  sex: string
  identificationNumber: string
  identificationNumberIssueDate: string | null
  identificationNumberIssuePlace: string | null
  ethnicity: string | null
  subjectType: string | null
  payerSource: string | null
  bloodGroup: string | null
  phone: string | null
  province: string | null
  ward: string | null
  addressDetail: string | null
  administrativeOccupation: string | null
  workplaceOrSchool: string | null
  healthExaminationReason: string | null
  status: string
  createdAt: string
}
