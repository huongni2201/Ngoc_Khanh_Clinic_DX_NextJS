import { clinicalServiceCatalog } from "@/modules/catalog/__tests__/fixtures/api-fixtures"
import { ApiClientError } from "@/shared/api/api-client"
import { HealthExaminationAgreement, HealthExaminationAgreementStatus, CreateHealthExaminationAgreementRequest, DeleteHealthExaminationAgreementRequest, ActivateHealthExaminationAgreementRequest, EndHealthExaminationAgreementRequest, UpdateHealthExaminationAgreementRequest, HealthExaminationAgreementFilterParams, HealthExaminationAgreementListResponse, ParticipantExaminationProgress, ExaminationProgressFilterParams, ExaminationProgressResponse, HealthExaminationAgreementReportSummary, HealthExaminationServiceSummary, ServiceCompletionStatus } from "../../types"

export * from "../../api/participants"
export * from "../../api/examination-details"
export * from "../../api/reports"
export * from "../../api/examination-forms"
export * from "../../api/sessions"

interface SeedAgreement {
  id: string
  code: string
  organizationId: string
  name: string
  validFrom: string | null
  validTo: string | null
  status: HealthExaminationAgreementStatus
  services: { serviceId: string; name: string; unitPrice: number }[]
  createdAt: string
  updatedAt: string
}

function toAgreement(seed: SeedAgreement): HealthExaminationAgreement {
  return {
    id: seed.id,
    organizationId: seed.organizationId,
    code: seed.code,
    name: seed.name,
    validFrom: seed.validFrom,
    validTo: seed.validTo,
    status: seed.status,
    createdAt: seed.createdAt,
    updatedAt: seed.updatedAt,
    rowVersion: 0,
    createdBy: "staff-1",
    services: seed.services.map((service, index) => ({
      id: `${seed.id}-${service.serviceId}`,
      serviceId: service.serviceId,
      code: clinicalServiceCatalog.find((item) => item.id === service.serviceId)?.code ?? null,
      name: service.name,
      referencePrice: service.unitPrice,
      negotiatedPrice: service.unitPrice,
      displayOrder: index + 1,
      active: true,
    })),
  }
}

// In-memory store for agreements
const seedAgreements: SeedAgreement[] = [
  {
    id: "agreement-1",
    code: "DK001",
    organizationId: "ent-2",
    name: "Khám sức khỏe định kỳ 2026",
    validFrom: "2026-09-18",
    validTo: null,
    status: "ACTIVE",
    services: [
      {
        serviceId: "item-kntq",
        name: "Khám nội tổng quát",
        unitPrice: 100000,
      },
      {
        serviceId: "item-xnm",
        name: "Xét nghiệm máu",
        unitPrice: 220000,
      },
      {
        serviceId: "item-xnnt",
        name: "Xét nghiệm nước tiểu",
        unitPrice: 80000,
      },
      {
        serviceId: "item-saob",
        name: "Siêu âm ổ bụng",
        unitPrice: 150000,
      },
      {
        serviceId: "item-xqp",
        name: "X-quang phổi",
        unitPrice: 120000,
      },
      {
        serviceId: "item-km",
        name: "Khám mắt",
        unitPrice: 60000,
      },
      {
        serviceId: "item-tmh",
        name: "Tai mũi họng",
        unitPrice: 70000,
      },
    ],
    createdAt: "2026-09-10T00:00:00Z",
    updatedAt: "2026-09-18T00:00:00Z",
  },
  {
    id: "agreement-2",
    code: "DK002",
    organizationId: "ent-2",
    name: "Khám sức khỏe định kỳ CBNV 2025",
    validFrom: "2025-10-15",
    validTo: null,
    status: "ENDED",
    services: [
      {
        serviceId: "item-kntq",
        name: "Khám nội tổng quát",
        unitPrice: 100000,
      },
      {
        serviceId: "item-xnm",
        name: "Xét nghiệm máu",
        unitPrice: 200000,
      },
    ],
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2025-10-20T00:00:00Z",
  },
  {
    id: "agreement-3",
    code: "DK003",
    organizationId: "ent-2",
    name: "Khám tuyển dụng nhân sự mới Q2/2026",
    validFrom: "2026-05-10",
    validTo: null,
    status: "ENDED",
    services: [
      {
        serviceId: "item-kntq",
        name: "Khám nội tổng quát",
        unitPrice: 100000,
      },
    ],
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: "2026-05-12T00:00:00Z",
  },
  {
    id: "agreement-4",
    code: "DK004",
    organizationId: "ent-2",
    name: "Khám chuyên khoa mắt & TMH 2025",
    validFrom: "2025-11-20",
    validTo: null,
    status: "ENDED",
    services: [
      {
        serviceId: "item-km",
        name: "Khám mắt",
        unitPrice: 60000,
      },
      {
        serviceId: "item-tmh",
        name: "Tai mũi họng",
        unitPrice: 70000,
      },
    ],
    createdAt: "2025-11-10T00:00:00Z",
    updatedAt: "2025-11-22T00:00:00Z",
  },
]

let healthExaminationAgreementsStore: HealthExaminationAgreement[] = seedAgreements.map(toAgreement)

// Fixture-only profile completeness used to derive matrix notes; not part of the participant model.
type SeedProfileStatus = "VALID" | "MISSING_IDENTIFICATION_NUMBER" | "MISSING_SIGNATURE"
// Legacy roster shape kept only so these fixtures can derive matrix and report rows; it is not the
// transport or view model of the participant list endpoint.
interface SeedRosterParticipant {
  id: string
  agreementId: string
  participantCode?: string
  participantType?: string
  fullName: string
  dateOfBirth?: string
  gender?: "Nam" | "Nữ" | "OTHER"
  identificationNumber?: string
  phoneNumber?: string
  organizationUnit?: string
  jobTitle?: string
  address?: string
  agreementParticipantStatus?: string
  note?: string
}
type SeedParticipant = SeedRosterParticipant & { profileStatus: SeedProfileStatus }

// Base 10 participant rows matching the reference image
const referenceParticipants: Omit<SeedParticipant, "agreementId" | "participantType">[] = [
  {
    id: "emp-001",
    participantCode: "FPT001",
    fullName: "Trần Minh Đức",
    dateOfBirth: "14/03/1990",
    gender: "Nam",
    identificationNumber: "090312345678",
    phoneNumber: "0901 234 567",
    organizationUnit: "Kỹ thuật",
    jobTitle: "Kỹ sư",
    address: "Hà Nội",
    profileStatus: "VALID",
    note: "",
  },
  {
    id: "emp-002",
    participantCode: "FPT002",
    fullName: "Nguyễn Thu Hà",
    dateOfBirth: "22/08/1992",
    gender: "Nữ",
    identificationNumber: "001189012345",
    phoneNumber: "0987 654 321",
    organizationUnit: "Nhân sự",
    jobTitle: "Chuyên viên",
    address: "Hà Nội",
    profileStatus: "VALID",
    note: "",
  },
  {
    id: "emp-003",
    participantCode: "FPT003",
    fullName: "Lê Quang Huy",
    dateOfBirth: "05/01/1988",
    gender: "Nam",
    identificationNumber: "012398765432",
    phoneNumber: "0912 345 678",
    organizationUnit: "Kinh doanh",
    jobTitle: "Trưởng nhóm",
    address: "Hồ Chí Minh",
    profileStatus: "MISSING_IDENTIFICATION_NUMBER",
    note: "",
  },
  {
    id: "emp-004",
    participantCode: "FPT004",
    fullName: "Phạm Thị Mai",
    dateOfBirth: "12/11/1993",
    gender: "Nữ",
    identificationNumber: "022301234567",
    phoneNumber: "0934 567 890",
    organizationUnit: "Tài chính",
    jobTitle: "Kế toán",
    address: "Đà Nẵng",
    profileStatus: "VALID",
    note: "",
  },
  {
    id: "emp-005",
    participantCode: "FPT005",
    fullName: "Đặng Hoàng Nam",
    dateOfBirth: "28/06/1991",
    gender: "Nam",
    identificationNumber: "034567890123",
    phoneNumber: "0965 432 109",
    organizationUnit: "Kinh doanh",
    jobTitle: "Chuyên viên",
    address: "Hà Nội",
    profileStatus: "MISSING_SIGNATURE",
    note: "",
  },
  {
    id: "emp-006",
    participantCode: "FPT006",
    fullName: "Nguyễn Văn Long",
    dateOfBirth: "17/09/1989",
    gender: "Nam",
    identificationNumber: "028912345678",
    phoneNumber: "0909 876 543",
    organizationUnit: "Công nghệ",
    jobTitle: "Chuyên viên",
    address: "Hà Nội",
    profileStatus: "VALID",
    note: "",
  },
  {
    id: "emp-007",
    participantCode: "FPT007",
    fullName: "Vũ Thị Thanh Huyền",
    dateOfBirth: "03/04/1994",
    gender: "Nữ",
    identificationNumber: "031234567890",
    phoneNumber: "0918 765 432",
    organizationUnit: "Nhân sự",
    jobTitle: "Chuyên viên",
    address: "Hải Phòng",
    profileStatus: "MISSING_IDENTIFICATION_NUMBER",
    note: "",
  },
  {
    id: "emp-008",
    participantCode: "FPT008",
    fullName: "Hoàng Anh Tuấn",
    dateOfBirth: "19/12/1990",
    gender: "Nam",
    identificationNumber: "040123456789",
    phoneNumber: "0977 111 222",
    organizationUnit: "Sản xuất",
    jobTitle: "Kỹ thuật viên",
    address: "Bắc Ninh",
    profileStatus: "VALID",
    note: "",
  },
  {
    id: "emp-009",
    participantCode: "FPT009",
    fullName: "Đỗ Thị Kim Ngân",
    dateOfBirth: "27/05/1992",
    gender: "Nữ",
    identificationNumber: "045678901234",
    phoneNumber: "0983 222 111",
    organizationUnit: "Marketing",
    jobTitle: "Chuyên viên",
    address: "Hà Nội",
    profileStatus: "MISSING_SIGNATURE",
    note: "",
  },
  {
    id: "emp-010",
    participantCode: "FPT010",
    fullName: "Bùi Văn Duy",
    dateOfBirth: "09/10/1987",
    gender: "Nam",
    identificationNumber: "052345678901",
    phoneNumber: "0968 333 444",
    organizationUnit: "Kỹ thuật",
    jobTitle: "Tổ trưởng",
    address: "Hưng Yên",
    profileStatus: "VALID",
    note: "",
  },
]

// Generate remaining 40 participants to reach exactly 50 participants
const generateSeedParticipants = (agreementId: string): SeedParticipant[] => {
  const result: SeedParticipant[] = referenceParticipants.map((row) => ({
    ...row,
    agreementId,
    participantType: "EMPLOYEE",
  }))

  const extraNames = [
    "Ngô Bảo Châu", "Đinh Tiến Dũng", "Phan Thanh Hùng", "Lý Hải Đăng", "Dương Thu Thảo",
    "Trịnh Văn Quyết", "Tạ Đình Phong", "Mai Phương Thúy", "Lâm Khánh Chi", "Hồ Ngọc Hà",
    "Nguyễn Trọng Hoàng", "Đoàn Văn Hậu", "Quế Ngọc Hải", "Nguyễn Quang Hải", "Vũ Văn Thanh",
    "Nguyễn Công Phượng", "Nguyễn Văn Toàn", "Phan Văn Đức", "Lương Xuân Trường", "Nguyễn Tuấn Anh",
    "Đỗ Hùng Dũng", "Bùi Tiến Dũng", "Nguyễn Thành Chung", "Trần Đình Trọng", "Bùi Tấn Trường",
    "Đặng Văn Lâm", "Nguyễn Phong Hồng Duy", "Hà Đức Chinh", "Hồ Tấn Tài", "Trần Văn Kiên",
    "Phạm Đức Huy", "Nguyễn Hoàng Đức", "Tô Văn Vũ", "Châu Ngọc Quang", "Dụng Quang Nho",
    "Phan Tuấn Tài", "Nhâm Mạnh Dũng", "Khuất Văn Khang", "Nguyễn Thanh Nhân", "Vũ Tiến Long"
  ]

  const depts = [
    "Công nghệ", "Nhân sự", "Kinh doanh", "Tài chính",
    "Sản xuất", "Marketing", "Kỹ thuật"
  ]

  const cities = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Bắc Ninh", "Hưng Yên"]

  for (let i = 0; i < 40; i++) {
    const idx = 11 + i
    const code = `FPT${String(idx).padStart(3, "0")}`
    const isFemale = i % 3 === 0
    const profileStatus = i % 5 === 0 ? "MISSING_IDENTIFICATION_NUMBER" : i % 7 === 0 ? "MISSING_SIGNATURE" : "VALID"

    result.push({
      id: `emp-${String(idx).padStart(3, "0")}`,
      agreementId,
      participantCode: code,
      participantType: "EMPLOYEE",
      fullName: extraNames[i] || `Người khám ${code}`,
      dateOfBirth: `${String((i % 28) + 1).padStart(2, "0")}/${String((i % 12) + 1).padStart(2, "0")}/${1988 + (i % 12)}`,
      gender: isFemale ? "Nữ" : "Nam",
      identificationNumber: `0${String(10000000000 + i * 12345678).slice(0, 11)}`,
      phoneNumber: `09${String(10000000 + i * 98765).slice(0, 8)}`,
      organizationUnit: depts[i % depts.length],
      jobTitle: i % 4 === 0 ? "Kỹ sư" : i % 3 === 0 ? "Trưởng nhóm" : "Chuyên viên",
      address: cities[i % cities.length],
      profileStatus,
      note: "",
    })
  }

  return result
}

// In-memory participant store
const participantsStore: SeedParticipant[] = generateSeedParticipants("agreement-1")

// Completed examination items by participant to match Tab 2 & Tab 3:
// - Khám nội tổng quát: 50
// - Xét nghiệm máu: 48
// - Xét nghiệm nước tiểu: 46
// - Siêu âm ổ bụng: 42
// - X-quang phổi: 40
// - Khám mắt: 38
// - Tai mũi họng: 35
export const getCompletedItemsForParticipant = (participantIndex: number): string[] => {
  const completed: string[] = []
  if (participantIndex < 50) completed.push("item-kntq")
  if (participantIndex < 48) completed.push("item-xnm")
  if (participantIndex < 46) completed.push("item-xnnt")
  if (participantIndex < 42) completed.push("item-saob")
  if (participantIndex < 40) completed.push("item-xqp")
  if (participantIndex < 38) completed.push("item-km")
  if (participantIndex < 35) completed.push("item-tmh")
  return completed
}

export async function fetchHealthExaminationAgreementsByOrganization(
  organizationId: string,
  params?: HealthExaminationAgreementFilterParams
): Promise<HealthExaminationAgreementListResponse> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  let filtered = healthExaminationAgreementsStore.filter(
    (b) =>
      b.organizationId.toLowerCase() === organizationId.toLowerCase() ||
      (organizationId.toLowerCase() === "dn002" && b.organizationId === "ent-2")
  )

  if (params?.search && params.search.trim() !== "") {
    const keyword = params.search.trim().toLowerCase()
    filtered = filtered.filter(
      (b) =>
        b.name.toLowerCase().includes(keyword) ||
        b.code.toLowerCase().includes(keyword)
    )
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: filtered.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function fetchHealthExaminationAgreementById(
  organizationId: string,
  agreementId: string
): Promise<HealthExaminationAgreement> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  const found = healthExaminationAgreementsStore.find(
    (agreement) => agreement.id === agreementId && agreement.organizationId === organizationId
  )
  if (!found) {
    throw new ApiClientError("Không tìm thấy hoặc đã bị xóa/ngừng hoạt động.", 404)
  }
  return { ...found }
}

function buildServices(
  agreementId: string,
  inputs: CreateHealthExaminationAgreementRequest["services"]
): HealthExaminationAgreement["services"] {
  return inputs.map((input, index) => {
    const catalogItem = clinicalServiceCatalog.find((item) => item.id === input.serviceId)
    return {
      id: `${agreementId}-${input.serviceId}`,
      serviceId: input.serviceId,
      code: catalogItem?.code ?? null,
      name: catalogItem?.name ?? null,
      referencePrice: catalogItem?.unitPrice ?? 0,
      negotiatedPrice: input.negotiatedPrice,
      displayOrder: index + 1,
      active: true,
    }
  })
}

/** Mirrors the backend: `KSK-<year>-<running number>`, continuing after the highest one used. */
function nextAgreementCode(): string {
  const prefix = `KSK-${new Date().getFullYear()}-`
  const highest = healthExaminationAgreementsStore.reduce((max, agreement) => {
    const sequence = agreement.code.startsWith(prefix) ? Number(agreement.code.slice(prefix.length)) : NaN
    return Number.isInteger(sequence) ? Math.max(max, sequence) : max
  }, 0)
  return `${prefix}${String(highest + 1).padStart(3, "0")}`
}

export async function createHealthExaminationAgreement(request: CreateHealthExaminationAgreementRequest): Promise<HealthExaminationAgreement> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const now = new Date().toISOString()
  const id = `agreement-${Date.now()}`
  const newAgreement: HealthExaminationAgreement = {
    id,
    code: nextAgreementCode(),
    organizationId: request.organizationId,
    name: request.agreementName,
    validFrom: request.validFrom,
    validTo: request.validTo,
    status: "DRAFT",
    rowVersion: 0,
    createdBy: "staff-1",
    services: buildServices(id, request.services),
    createdAt: now,
    updatedAt: now,
  }

  healthExaminationAgreementsStore = [newAgreement, ...healthExaminationAgreementsStore]
  return { ...newAgreement }
}

export async function updateHealthExaminationAgreement(
  request: UpdateHealthExaminationAgreementRequest
): Promise<HealthExaminationAgreement> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const current = healthExaminationAgreementsStore.find(
    (agreement) => agreement.id === request.agreementId && agreement.organizationId === request.organizationId
  )
  if (!current) {
    throw new ApiClientError("Không tìm thấy hoặc đã bị xóa/ngừng hoạt động.", 404)
  }
  if (current.rowVersion !== request.rowVersion) {
    throw new ApiClientError("Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ. Vui lòng tải lại.", 409)
  }

  const updated: HealthExaminationAgreement = {
    ...current,
    name: request.agreementName,
    validFrom: request.validFrom,
    validTo: request.validTo,
    services: buildServices(current.id, request.services),
    rowVersion: current.rowVersion + 1,
    updatedAt: new Date().toISOString(),
  }
  healthExaminationAgreementsStore = healthExaminationAgreementsStore.map((agreement) =>
    agreement.id === updated.id ? updated : agreement
  )
  return { ...updated }
}

export async function deleteHealthExaminationAgreement(
  request: DeleteHealthExaminationAgreementRequest
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const current = healthExaminationAgreementsStore.find(
    (agreement) => agreement.id === request.agreementId && agreement.organizationId === request.organizationId
  )
  if (!current) {
    throw new ApiClientError("Không tìm thấy hoặc đã bị xóa/ngừng hoạt động.", 404)
  }
  if (current.rowVersion !== request.rowVersion || current.status !== "DRAFT") {
    throw new ApiClientError("Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ. Vui lòng tải lại.", 409)
  }
  healthExaminationAgreementsStore = healthExaminationAgreementsStore.filter((agreement) => agreement.id !== current.id)
}

export function buildHealthExaminationAgreementActivateUrl(organizationId: string, agreementId: string) {
  return `/api/v1/organizations/${encodeURIComponent(organizationId)}/agreements/${encodeURIComponent(agreementId)}/activate`
}

export function buildHealthExaminationAgreementEndUrl(organizationId: string, agreementId: string) {
  return `/api/v1/organizations/${encodeURIComponent(organizationId)}/agreements/${encodeURIComponent(agreementId)}/end`
}

function changeAgreement(
  request: { organizationId: string; agreementId: string; rowVersion: number },
  expectedStatuses: HealthExaminationAgreementStatus[],
  change: (current: HealthExaminationAgreement) => Partial<HealthExaminationAgreement>
): HealthExaminationAgreement {
  const current = healthExaminationAgreementsStore.find(
    (agreement) => agreement.id === request.agreementId && agreement.organizationId === request.organizationId
  )
  if (!current) {
    throw new ApiClientError("Không tìm thấy hoặc đã bị xóa/ngừng hoạt động.", 404)
  }
  if (current.rowVersion !== request.rowVersion || !expectedStatuses.includes(current.status)) {
    throw new ApiClientError("Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ. Vui lòng tải lại.", 409)
  }
  const changed: HealthExaminationAgreement = {
    ...current,
    ...change(current),
    rowVersion: current.rowVersion + 1,
    updatedAt: new Date().toISOString(),
  }
  healthExaminationAgreementsStore = healthExaminationAgreementsStore.map((agreement) =>
    agreement.id === changed.id ? changed : agreement
  )
  return { ...changed }
}

export async function activateHealthExaminationAgreement(
  request: ActivateHealthExaminationAgreementRequest
): Promise<HealthExaminationAgreement> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return changeAgreement(request, ["DRAFT"], () => ({ status: "ACTIVE" }))
}

export async function endHealthExaminationAgreement(
  request: EndHealthExaminationAgreementRequest
): Promise<HealthExaminationAgreement> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return changeAgreement(request, ["ACTIVE"], () => ({ status: "ENDED" }))
}

// ----------------------------------------------------
// Screen 04/05: Fetch Examination Matrix (Tab 2)
// ----------------------------------------------------
export async function fetchHealthExaminationAgreementMatrix(
  agreementId: string,
  params?: ExaminationProgressFilterParams
): Promise<ExaminationProgressResponse> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const agreement = healthExaminationAgreementsStore.find((b) => b.id === agreementId)
  const agreementItems = (agreement?.services || []).map((item) => {
    let shortName = item.name ?? ""
    if (item.serviceId === "item-kntq") shortName = "Khám nội"
    else if (item.serviceId === "item-xnm") shortName = "XN máu"
    else if (item.serviceId === "item-xnnt") shortName = "XN nước tiểu"
    else if (item.serviceId === "item-saob") shortName = "Siêu âm"
    else if (item.serviceId === "item-xqp") shortName = "X-quang"
    else if (item.serviceId === "item-km") shortName = "Khám mắt"
    else if (item.serviceId === "item-tmh") shortName = "TMH"

    return {
      id: item.serviceId,
      name: shortName,
    }
  })

  const allParticipants = participantsStore.filter((e) => e.agreementId === agreementId)

  // Map each participant to matrix item with completed items and examinations record
  const matrixItems: ParticipantExaminationProgress[] = allParticipants.map((e, index) => {
    const completedServiceIds = getCompletedItemsForParticipant(index)
    const examinations: Record<string, ServiceCompletionStatus> = {}

    agreementItems.forEach((bItem) => {
      examinations[bItem.id] = completedServiceIds.includes(bItem.id)
        ? "COMPLETED"
        : "PENDING"
    })

    const totalConfigured = agreementItems.length
    let examStatus: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED" = "NOT_STARTED"
    if (totalConfigured > 0 && completedServiceIds.length >= totalConfigured) {
      examStatus = "COMPLETED"
    } else if (completedServiceIds.length > 0) {
      examStatus = "IN_PROGRESS"
    }

    const note =
      e.note ||
      (index === 2 || index === 6 || index === 8
        ? "Khám bù"
        : index === 4
        ? "Thiếu chữ ký"
        : e.profileStatus === "MISSING_IDENTIFICATION_NUMBER"
        ? "Khám bù"
        : e.profileStatus === "MISSING_SIGNATURE"
        ? "Thiếu chữ ký"
        : "Đủ hồ sơ")
    const noteType: "success" | "warning" =
      note === "Đủ hồ sơ" ? "success" : "warning"

    return {
      id: e.id,
      participantCode: e.participantCode,
      fullName: e.fullName,
      organizationUnit: e.organizationUnit,
      identificationNumber: e.identificationNumber,
      examinations,
      completedServiceIds,
      examStatus,
      note,
      noteType,
    }
  })

  let filtered = matrixItems

  // Search by code, name, CCCD
  if (params?.search && params.search.trim() !== "") {
    const keyword = params.search.trim().toLowerCase()
    filtered = filtered.filter(
      (m) =>
        (m.participantCode?.toLowerCase().includes(keyword) ?? false) ||
        m.fullName.toLowerCase().includes(keyword) ||
        (m.identificationNumber && m.identificationNumber.toLowerCase().includes(keyword))
    )
  }

  // Filter by organizationUnit
  if (params?.organizationUnit && params.organizationUnit !== "ALL") {
    const targetDept = params.organizationUnit.toLowerCase()
    filtered = filtered.filter(
      (m) =>
        (m.organizationUnit?.toLowerCase() ?? "") === targetDept ||
        (m.organizationUnit?.toLowerCase() ?? "") === `khối ${targetDept}` ||
        targetDept === `khối ${m.organizationUnit ?? ""}`.toLowerCase()
    )
  }

  // Filter by exam status
  if (params?.examStatus && params.examStatus !== "ALL") {
    filtered = filtered.filter((m) => m.examStatus === params.examStatus)
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return {
    services: agreementItems,
    data: filtered.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    totalPages,
  }
}

// ----------------------------------------------------
// Screen 04/05: Fetch Payment & Category Report (Tab 3)
// ----------------------------------------------------
export async function fetchHealthExaminationAgreementReport(agreementId: string): Promise<HealthExaminationAgreementReportSummary> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const agreement = healthExaminationAgreementsStore.find((b) => b.id === agreementId)
  if (!agreement) {
    throw new Error(`Thỏa thuận với mã "${agreementId}" không tồn tại`)
  }

  const items = agreement.services || []

  if (items.length === 0) {
    return {
      agreementId,
      items: [],
      totalAmount: 0,
    }
  }

  const allParticipants = participantsStore.filter((e) => e.agreementId === agreementId)

  // Dynamically count completed services from participants:
  const countMap: Record<string, number> = {}
  allParticipants.forEach((_, idx) => {
    const completed = getCompletedItemsForParticipant(idx)
    completed.forEach((id) => {
      countMap[id] = (countMap[id] || 0) + 1
    })
  })

  const reportItems: HealthExaminationServiceSummary[] = items.map((item) => {
    const examinedCount = countMap[item.serviceId] ?? 0
    const totalAmount = examinedCount * item.negotiatedPrice

    return {
      serviceId: item.serviceId,
      name: item.name ?? "",
      examinedCount,
      unitPrice: item.negotiatedPrice,
      totalAmount,
    }
  })

  const totalAmount = reportItems.reduce((acc, curr) => acc + curr.totalAmount, 0)

  return {
    agreementId,
    items: reportItems,
    totalAmount,
  }
}

// ----------------------------------------------------
// Export Data Fetchers (Excel Horizontal Matrix & Vertical Summary)
// ----------------------------------------------------
export async function fetchExaminationDetailExportData(agreementId: string) {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const agreement = healthExaminationAgreementsStore.find((b) => b.id === agreementId)
  if (!agreement) {
    throw new Error(`Thỏa thuận với mã "${agreementId}" không tồn tại`)
  }

  const allParticipants = participantsStore.filter((e) => e.agreementId === agreementId)
  const columns = (agreement.services || []).map((item) => ({
    id: item.serviceId,
    name: item.name ?? "",
  }))

  const rows = allParticipants.map((e, index) => ({
      participantCode: e.participantCode ?? "",
      fullName: e.fullName,
      identificationNumber: e.identificationNumber ?? "",
      organizationUnit: e.organizationUnit ?? "",
    completedServiceIds: getCompletedItemsForParticipant(index),
  }))

  return {
    agreementName: agreement.name,
    agreementCode: agreement.code,
    columns,
    rows,
  }
}

export async function fetchExaminationSummaryExportData(agreementId: string) {
  const report = await fetchHealthExaminationAgreementReport(agreementId)
  const agreement = healthExaminationAgreementsStore.find((b) => b.id === agreementId)

  return {
    agreementName: agreement?.name || "Bao-cao-tong-hop",
    agreementCode: agreement?.code || "DK",
    items: report.items,
    totalAmount: report.totalAmount,
  }
}
