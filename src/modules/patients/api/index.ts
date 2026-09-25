import {
  Patient,
  CreatePatientDto,
  UpdatePatientDto,
  PatientFilterParams,
  PatientCounters,
} from "../types"

const initialPatients: Patient[] = [
  {
    id: "pat-mock-01",
    patientCode: "BN000123",
    fullName: "Nguyễn Văn Hùng",
    dateOfBirth: "1985-03-12",
    birthYear: 1985,
    gender: "MALE",
    identificationNumber: "012345678901",
    phoneNumber: "0909 123 456",
    email: "hung.nguyen@gmail.com",
    address: "Số 12 Liễu Giai, Ba Đình, Hà Nội",
    lastExamDate: "2024-09-16",
    createdAt: "2026-09-24T07:00:00Z",
  },
  {
    id: "pat-mock-02",
    patientCode: "BN000124",
    fullName: "Trần Thị Mai",
    dateOfBirth: "1990-07-25",
    birthYear: 1990,
    gender: "FEMALE",
    identificationNumber: "012345678902",
    phoneNumber: "0912 345 678",
    email: "mai.tran@gmail.com",
    address: "Số 88 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội",
    lastExamDate: "2024-06-12",
    createdAt: "2026-09-24T07:15:00Z",
  },
  {
    id: "pat-mock-03",
    patientCode: "BN000125",
    fullName: "Lê Văn Nam",
    dateOfBirth: "1978-02-20",
    birthYear: 1978,
    gender: "MALE",
    identificationNumber: "012345678903",
    phoneNumber: "0987 654 321",
    email: "nam.le@gmail.com",
    address: "Số 102 Hoàng Hoa Thám, Tây Hồ, Hà Nội",
    lastExamDate: "2024-02-20",
    createdAt: "2026-09-24T07:30:00Z",
  },
  {
    id: "pat-mock-04",
    patientCode: "BN000126",
    fullName: "Phạm Thị Mai",
    dateOfBirth: "1992-12-05",
    birthYear: 1992,
    gender: "FEMALE",
    identificationNumber: "012345678904",
    phoneNumber: "0903 222 333",
    email: "mai.pham@gmail.com",
    address: "Số 36 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
    lastExamDate: "2023-12-05",
    createdAt: "2026-09-24T07:45:00Z",
  },
  {
    id: "pat-mock-05",
    patientCode: "BN000127",
    fullName: "Nguyễn Thị Hoa",
    dateOfBirth: "1988-08-18",
    birthYear: 1988,
    gender: "FEMALE",
    identificationNumber: "012345678905",
    phoneNumber: "0911 234 567",
    email: "hoa.nguyen@gmail.com",
    address: "Tây Hồ, Hà Nội",
    lastExamDate: "2023-08-18",
    createdAt: "2026-09-24T08:00:00Z",
  },
  {
    id: "pat-mock-06",
    patientCode: "BN000128",
    fullName: "Trần Minh Đức",
    dateOfBirth: "1995-04-03",
    birthYear: 1995,
    gender: "MALE",
    identificationNumber: "012345678906",
    phoneNumber: "0906 789 012",
    email: "duc.tran@gmail.com",
    address: "Hoàn Kiếm, Hà Nội",
    lastExamDate: "2023-04-03",
    createdAt: "2026-09-24T08:15:00Z",
  },
  {
    id: "pat-mock-07",
    patientCode: "BN000129",
    fullName: "Vũ Thị Hương",
    dateOfBirth: "1980-11-14",
    birthYear: 1980,
    gender: "FEMALE",
    identificationNumber: "012345678907",
    phoneNumber: "0982 345 678",
    email: "huong.vu@gmail.com",
    address: "Số 12 Chùa Bộc, Đống Đa, Hà Nội",
    lastExamDate: "2023-01-12",
    createdAt: "2026-09-24T08:30:00Z",
  },
  {
    id: "pat-mock-08",
    patientCode: "BN000130",
    fullName: "Hoàng Văn Dũng",
    dateOfBirth: "1973-09-28",
    birthYear: 1973,
    gender: "MALE",
    identificationNumber: "012345678908",
    phoneNumber: "0915 678 901",
    email: "dung.hoang@gmail.com",
    address: "Số 74 Kim Mã, Ba Đình, Hà Nội",
    lastExamDate: "2022-10-20",
    createdAt: "2026-09-24T08:45:00Z",
  },
  {
    id: "pat-001",
    patientCode: "BN001256",
    fullName: "Nguyễn Văn Minh",
    dateOfBirth: "1985-05-15",
    birthYear: 1985,
    gender: "MALE",
    identificationNumber: "001085002456",
    phoneNumber: "0912345678",
    email: "minh.nguyen@gmail.com",
    address: "Số 15, Ngõ 42 Liễu Giai, Ba Đình, Hà Nội",
    lastExamDate: "2024-05-10",
    createdAt: "2026-09-24T07:30:00Z",
  },
  {
    id: "pat-003",
    patientCode: "BN001312",
    fullName: "Lê Đức Anh",
    dateOfBirth: "1978-11-10",
    birthYear: 1978,
    gender: "MALE",
    identificationNumber: "001078009123",
    phoneNumber: "0901234567",
    email: "ducanh.le@gmail.com",
    address: "Số 102 Hoàng Hoa Thám, Tây Hồ, Hà Nội",
    lastExamDate: "2023-11-15",
    createdAt: "2026-09-24T08:00:00Z",
  },
  {
    id: "pat-004",
    patientCode: "BN001276",
    fullName: "Phạm Thị Hường",
    dateOfBirth: "1990-04-18",
    birthYear: 1990,
    gender: "FEMALE",
    identificationNumber: "001190004312",
    phoneNumber: "0933678901",
    email: "huong.pham@gmail.com",
    address: "Số 36 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
    lastExamDate: "2024-01-20",
    createdAt: "2026-09-24T08:15:00Z",
  },
  {
    id: "pat-005",
    patientCode: "BN001233",
    fullName: "Hoàng Văn Long",
    dateOfBirth: "1982-12-05",
    birthYear: 1982,
    gender: "MALE",
    identificationNumber: "001082007845",
    phoneNumber: "0919876543",
    email: "long.hoang@gmail.com",
    address: "Số 74 Kim Mã, Ba Đình, Hà Nội",
    lastExamDate: "2023-09-12",
    createdAt: "2026-09-24T08:20:00Z",
  },
  {
    id: "pat-006",
    patientCode: "BN001289",
    fullName: "Đỗ Thị Thu Hà",
    dateOfBirth: "1996-03-30",
    birthYear: 1996,
    gender: "FEMALE",
    identificationNumber: "001196001289",
    phoneNumber: "0945123987",
    email: "thuha.do@gmail.com",
    address: "Tòa B Ecolife, 58 Tố Hữu, Nam Từ Liêm, Hà Nội",
    createdAt: "2026-09-24T08:25:00Z",
  },
  {
    id: "pat-007",
    patientCode: "BN001290",
    fullName: "Vũ Đình Tuấn",
    dateOfBirth: "1988-07-14",
    birthYear: 1988,
    gender: "MALE",
    identificationNumber: "001088006543",
    phoneNumber: "0978234561",
    email: "tuan.vu@gmail.com",
    address: "Số 12 Chùa Bộc, Đống Đa, Hà Nội",
    createdAt: "2026-09-24T08:30:00Z",
  },
  {
    id: "pat-008",
    patientCode: "BN001295",
    fullName: "Nguyễn Thu Thủy",
    dateOfBirth: "1995-09-20",
    birthYear: 1995,
    gender: "FEMALE",
    identificationNumber: "001195007788",
    phoneNumber: "0966456789",
    email: "thuy.nguyen@gmail.com",
    address: "Số 55 Nguyễn Chí Thanh, Láng Hạ, Đống Đa, Hà Nội",
    createdAt: "2026-09-24T08:35:00Z",
  },
  {
    id: "pat-101",
    patientCode: "BN001421",
    fullName: "Nguyễn Thị Hoa",
    dateOfBirth: "1992-04-12",
    birthYear: 1992,
    gender: "FEMALE",
    identificationNumber: "001192004561",
    phoneNumber: "0987 654 321",
    address: "Cầu Giấy, Hà Nội",
    createdAt: "2026-09-23T14:30:00Z",
  },
  {
    id: "pat-102",
    patientCode: "BN001422",
    fullName: "Phạm Quang Huy",
    dateOfBirth: "1986-10-15",
    birthYear: 1986,
    gender: "MALE",
    identificationNumber: "001086001234",
    phoneNumber: "0912 345 678",
    address: "Nam Từ Liêm, Hà Nội",
    createdAt: "2026-09-24T07:15:00Z",
  },
  {
    id: "pat-103",
    patientCode: "BN001423",
    fullName: "Lê Thị Mai",
    dateOfBirth: "1990-05-10",
    birthYear: 1990,
    gender: "FEMALE",
    identificationNumber: "001190007890",
    phoneNumber: "0901 234 567",
    address: "Hà Đông, Hà Nội",
    createdAt: "2026-09-22T10:00:00Z",
  },
  {
    id: "pat-104",
    patientCode: "BN001424",
    fullName: "Trần Văn Nam",
    dateOfBirth: "1979-08-05",
    birthYear: 1979,
    gender: "MALE",
    identificationNumber: "001079009876",
    phoneNumber: "0933 678 901",
    address: "Thanh Xuân, Hà Nội",
    createdAt: "2026-09-23T16:00:00Z",
  },
]

let patientsStore: Patient[] = [...initialPatients]

export async function searchPatients(
  query?: string,
  params?: PatientFilterParams
): Promise<Patient[]> {
  await new Promise((resolve) => setTimeout(resolve, 80))

  let results = [...patientsStore]

  if (query && query.trim()) {
    const q = query.trim().toLowerCase()
    const cleanQ = q.replace(/[\s.-]/g, "")
    results = results.filter((p) => {
      const matchName = p.fullName.toLowerCase().includes(q)
      const matchCode = p.patientCode.toLowerCase().includes(q)
      const cleanPhone = p.phoneNumber.replace(/[\s.-]/g, "")
      const matchPhone = p.phoneNumber.includes(q) || cleanPhone.includes(cleanQ)
      const cleanId = p.identificationNumber.replace(/[\s.-]/g, "")
      const matchId = p.identificationNumber.includes(q) || cleanId.includes(cleanQ)
      return matchName || matchCode || matchPhone || matchId
    })
  }

  if (params?.gender && params.gender !== "ALL") {
    results = results.filter((p) => p.gender === params.gender)
  }

  if (params?.ageGroup && params.ageGroup !== "ALL") {
    const currentYear = new Date().getFullYear()
    results = results.filter((p) => {
      const age = p.birthYear ? currentYear - p.birthYear : 0
      if (params.ageGroup === "<18") return age < 18
      if (params.ageGroup === "18-40") return age >= 18 && age <= 40
      if (params.ageGroup === "41-60") return age >= 41 && age <= 60
      if (params.ageGroup === ">60") return age > 60
      return true
    })
  }

  return results
}

export async function fetchPatientById(id: string): Promise<Patient> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  const patient = patientsStore.find((p) => p.id === id || p.patientCode === id)
  if (!patient) {
    throw new Error(`Không tìm thấy thông tin bệnh nhân với mã hoặc ID: ${id}`)
  }
  return patient
}

export async function createPatient(dto: CreatePatientDto): Promise<Patient> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Check duplicate identificationNumber
  const duplicateId = patientsStore.find(
    (p) => p.identificationNumber === dto.identificationNumber
  )
  if (duplicateId) {
    throw new Error(
      `Số định danh "${dto.identificationNumber}" đã tồn tại trên hệ thống (Bệnh nhân: ${duplicateId.fullName} - ${duplicateId.patientCode})`
    )
  }

  const birthDate = new Date(dto.dateOfBirth)
  const birthYear = !isNaN(birthDate.getFullYear())
    ? birthDate.getFullYear()
    : new Date().getFullYear()

  const nextCodeNum = patientsStore.length + 1257
  const newPatient: Patient = {
    id: `pat-${Date.now()}`,
    patientCode: `BN00${nextCodeNum}`,
    fullName: dto.fullName.trim(),
    dateOfBirth: dto.dateOfBirth,
    birthYear,
    gender: dto.gender,
    identificationNumber: dto.identificationNumber.trim(),
    phoneNumber: dto.phoneNumber.trim(),
    email: dto.email?.trim() || undefined,
    address: dto.address?.trim() || undefined,
    createdAt: new Date().toISOString(),
  }

  patientsStore = [newPatient, ...patientsStore]
  return newPatient
}

export async function updatePatient(
  id: string,
  dto: UpdatePatientDto
): Promise<Patient> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const index = patientsStore.findIndex((p) => p.id === id || p.patientCode === id)
  if (index === -1) {
    throw new Error(`Không tìm thấy bệnh nhân để cập nhật: ${id}`)
  }

  const current = patientsStore[index]
  const updated: Patient = {
    ...current,
    ...dto,
    birthYear: dto.dateOfBirth
      ? new Date(dto.dateOfBirth).getFullYear()
      : current.birthYear,
  }

  patientsStore[index] = updated
  return updated
}

export function resetPatientsStore() {
  patientsStore = [...initialPatients]
}

export async function fetchPatientCounters(): Promise<PatientCounters> {
  await new Promise((resolve) => setTimeout(resolve, 80))
  const currentYear = new Date().getFullYear()
  const total = patientsStore.length
  // Estimated visits today
  const todayVisits = Math.min(24, Math.round(total * 0.4))
  const maleCount = patientsStore.filter((p) => p.gender === "MALE").length
  const femaleCount = patientsStore.filter((p) => p.gender === "FEMALE").length
  const elderlyCount = patientsStore.filter(
    (p) => currentYear - (p.birthYear || new Date(p.dateOfBirth).getFullYear()) > 60
  ).length

  return {
    total,
    todayVisits,
    maleCount,
    femaleCount,
    elderlyCount,
  }
}
