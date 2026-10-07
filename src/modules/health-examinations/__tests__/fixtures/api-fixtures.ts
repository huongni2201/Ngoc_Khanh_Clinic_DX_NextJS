import { ApiClientError } from "@/shared/api/api-client"
import {
  ClinicalService,
  HealthExaminationBatch,
  HealthExaminationBatchStatus,
  CreateHealthExaminationBatchRequest,
  DeleteHealthExaminationBatchRequest,
  UpdateHealthExaminationBatchRequest,
  HealthExaminationBatchFilterParams,
  HealthExaminationBatchListResponse,
  ParticipantExaminationProgress,
  ExaminationProgressFilterParams,
  ExaminationProgressResponse,
  HealthExaminationBatchReportSummary,
  HealthExaminationServiceSummary,
  ServiceCompletionStatus,
} from "../../types"

export * from "../../api/participants"
export * from "../../api/examination-details"
export * from "../../api/reports"

// Master catalog of clinic's examination items (matching reference image)
export const clinicalServiceCatalog: ClinicalService[] = [
  {
    id: "item-kntq",
    code: "HM001",
    name: "Khám nội tổng quát",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
  {
    id: "item-xnm",
    code: "HM002",
    name: "Xét nghiệm máu",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
  {
    id: "item-xnnt",
    code: "HM003",
    name: "Xét nghiệm nước tiểu",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
  {
    id: "item-saob",
    code: "HM004",
    name: "Siêu âm ổ bụng",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
  {
    id: "item-xqp",
    code: "HM005",
    name: "X-quang phổi",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
  {
    id: "item-km",
    code: "HM006",
    name: "Khám mắt",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
  {
    id: "item-tmh",
    code: "HM007",
    name: "Tai mũi họng",
    serviceType: "GENERAL",
    unitPrice: 100000,
  },
]

interface SeedBatch {
  id: string
  code: string
  organizationId: string
  name: string
  startDate: string | null
  endDate: string | null
  status: HealthExaminationBatchStatus
  services: { serviceId: string; name: string; unitPrice: number }[]
  createdAt: string
  updatedAt: string
}

function toBatch(seed: SeedBatch): HealthExaminationBatch {
  return {
    id: seed.id,
    organizationId: seed.organizationId,
    code: seed.code,
    name: seed.name,
    startDate: seed.startDate,
    endDate: seed.endDate,
    status: seed.status,
    createdAt: seed.createdAt,
    updatedAt: seed.updatedAt,
    rowVersion: 0,
    examinationDates: seed.startDate ? [seed.startDate] : [],
    examinationSiteType: "CLINIC",
    examinationSiteName: "Phòng khám Ngọc Khánh",
    examinationSiteAddress: "1 Đường A, Hà Nội",
    createdBy: "staff-1",
    services: seed.services.map((service, index) => ({
      id: `${seed.id}-${service.serviceId}`,
      serviceId: service.serviceId,
      code: clinicalServiceCatalog.find((item) => item.id === service.serviceId)?.code ?? null,
      name: service.name,
      referencePrice: service.unitPrice,
      negotiatedPrice: service.unitPrice,
      displayOrder: index + 1,
    })),
  }
}

// In-memory store for batches
const seedBatches: SeedBatch[] = [
  {
    id: "batch-1",
    code: "DK001",
    organizationId: "ent-2",
    name: "Khám sức khỏe định kỳ 2026",
    startDate: "2026-09-18",
    endDate: null,
    status: "READY",
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
    id: "batch-2",
    code: "DK002",
    organizationId: "ent-2",
    name: "Khám sức khỏe định kỳ CBNV 2025",
    startDate: "2025-10-15",
    endDate: null,
    status: "FINALIZED",
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
    id: "batch-3",
    code: "DK003",
    organizationId: "ent-2",
    name: "Khám tuyển dụng nhân sự mới Q2/2026",
    startDate: "2026-05-10",
    endDate: null,
    status: "FINALIZED",
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
    id: "batch-4",
    code: "DK004",
    organizationId: "ent-2",
    name: "Khám chuyên khoa mắt & TMH 2025",
    startDate: "2025-11-20",
    endDate: null,
    status: "FINALIZED",
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

let healthExaminationBatchesStore: HealthExaminationBatch[] = seedBatches.map(toBatch)

// Fixture-only profile completeness used to derive matrix notes; not part of the participant model.
type SeedProfileStatus = "VALID" | "MISSING_IDENTIFICATION_NUMBER" | "MISSING_SIGNATURE"
// Legacy roster shape kept only so these fixtures can derive matrix and report rows; it is not the
// transport or view model of the participant list endpoint.
interface SeedRosterParticipant {
  id: string
  batchId: string
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
  batchParticipantStatus?: string
  note?: string
}
type SeedParticipant = SeedRosterParticipant & { profileStatus: SeedProfileStatus }

// Base 10 participant rows matching the reference image
const referenceParticipants: Omit<SeedParticipant, "batchId" | "participantType">[] = [
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
const generateSeedParticipants = (batchId: string): SeedParticipant[] => {
  const result: SeedParticipant[] = referenceParticipants.map((row) => ({
    ...row,
    batchId,
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
      batchId,
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
const participantsStore: SeedParticipant[] = generateSeedParticipants("batch-1")

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

// ----------------------------------------------------
// Public API Functions
// ----------------------------------------------------

export async function fetchClinicalServiceCatalog(): Promise<ClinicalService[]> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return [...clinicalServiceCatalog]
}

export async function fetchHealthExaminationBatchesByOrganization(
  organizationId: string,
  params?: HealthExaminationBatchFilterParams
): Promise<HealthExaminationBatchListResponse> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  let filtered = healthExaminationBatchesStore.filter(
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

export async function fetchHealthExaminationBatchById(
  organizationId: string,
  batchId: string
): Promise<HealthExaminationBatch> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  const found = healthExaminationBatchesStore.find(
    (batch) => batch.id === batchId && batch.organizationId === organizationId
  )
  if (!found) {
    throw new ApiClientError("Không tìm thấy hoặc đã bị xóa/ngừng hoạt động.", 404)
  }
  return { ...found }
}

function buildServices(
  batchId: string,
  inputs: CreateHealthExaminationBatchRequest["services"]
): HealthExaminationBatch["services"] {
  return inputs.map((input, index) => {
    const catalogItem = clinicalServiceCatalog.find((item) => item.id === input.serviceId)
    return {
      id: `${batchId}-${input.serviceId}`,
      serviceId: input.serviceId,
      code: catalogItem?.code ?? null,
      name: catalogItem?.name ?? null,
      referencePrice: catalogItem?.unitPrice ?? 0,
      negotiatedPrice: input.negotiatedPrice,
      displayOrder: index + 1,
    }
  })
}

export async function createHealthExaminationBatch(request: CreateHealthExaminationBatchRequest): Promise<HealthExaminationBatch> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const now = new Date().toISOString()
  const id = `batch-${Date.now()}`
  const dates = [...request.examinationDates].sort()

  const newBatch: HealthExaminationBatch = {
    id,
    code: request.batchCode,
    organizationId: request.organizationId,
    name: request.batchName,
    startDate: dates[0] ?? null,
    endDate: dates[dates.length - 1] ?? null,
    status: "DRAFT",
    rowVersion: 0,
    examinationDates: dates,
    examinationSiteType: request.examinationSiteType,
    examinationSiteName: request.examinationSiteName,
    examinationSiteAddress: request.examinationSiteAddress,
    createdBy: "staff-1",
    services: buildServices(id, request.services),
    createdAt: now,
    updatedAt: now,
  }

  healthExaminationBatchesStore = [newBatch, ...healthExaminationBatchesStore]
  return { ...newBatch }
}

export async function updateHealthExaminationBatch(
  request: UpdateHealthExaminationBatchRequest
): Promise<HealthExaminationBatch> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const current = healthExaminationBatchesStore.find(
    (batch) => batch.id === request.batchId && batch.organizationId === request.organizationId
  )
  if (!current) {
    throw new ApiClientError("Không tìm thấy hoặc đã bị xóa/ngừng hoạt động.", 404)
  }
  if (current.rowVersion !== request.rowVersion) {
    throw new ApiClientError("Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ. Vui lòng tải lại.", 409)
  }

  const dates = [...request.examinationDates].sort()
  const updated: HealthExaminationBatch = {
    ...current,
    name: request.batchName,
    startDate: dates[0] ?? null,
    endDate: dates[dates.length - 1] ?? null,
    examinationDates: dates,
    examinationSiteType: request.examinationSiteType,
    examinationSiteName: request.examinationSiteName,
    examinationSiteAddress: request.examinationSiteAddress,
    services: buildServices(current.id, request.services),
    rowVersion: current.rowVersion + 1,
    updatedAt: new Date().toISOString(),
  }
  healthExaminationBatchesStore = healthExaminationBatchesStore.map((batch) =>
    batch.id === updated.id ? updated : batch
  )
  return { ...updated }
}

export async function deleteHealthExaminationBatch(
  request: DeleteHealthExaminationBatchRequest
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const current = healthExaminationBatchesStore.find(
    (batch) => batch.id === request.batchId && batch.organizationId === request.organizationId
  )
  if (!current) {
    throw new ApiClientError("Không tìm thấy hoặc đã bị xóa/ngừng hoạt động.", 404)
  }
  if (current.rowVersion !== request.rowVersion || current.status !== "DRAFT") {
    throw new ApiClientError("Dữ liệu đã thay đổi hoặc không thỏa quy tắc nghiệp vụ. Vui lòng tải lại.", 409)
  }
  healthExaminationBatchesStore = healthExaminationBatchesStore.filter((batch) => batch.id !== current.id)
}

// ----------------------------------------------------
// Screen 04/05: Fetch Examination Matrix (Tab 2)
// ----------------------------------------------------
export async function fetchHealthExaminationBatchMatrix(
  batchId: string,
  params?: ExaminationProgressFilterParams
): Promise<ExaminationProgressResponse> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const batch = healthExaminationBatchesStore.find((b) => b.id === batchId)
  const batchItems = (batch?.services || []).map((item) => {
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

  const allParticipants = participantsStore.filter((e) => e.batchId === batchId)

  // Map each participant to matrix item with completed items and examinations record
  const matrixItems: ParticipantExaminationProgress[] = allParticipants.map((e, index) => {
    const completedServiceIds = getCompletedItemsForParticipant(index)
    const examinations: Record<string, ServiceCompletionStatus> = {}

    batchItems.forEach((bItem) => {
      examinations[bItem.id] = completedServiceIds.includes(bItem.id)
        ? "COMPLETED"
        : "PENDING"
    })

    const totalConfigured = batchItems.length
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
    services: batchItems,
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
export async function fetchHealthExaminationBatchReport(batchId: string): Promise<HealthExaminationBatchReportSummary> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const batch = healthExaminationBatchesStore.find((b) => b.id === batchId)
  if (!batch) {
    throw new Error(`Đợt khám với mã "${batchId}" không tồn tại`)
  }

  const items = batch.services || []

  if (items.length === 0) {
    return {
      batchId,
      items: [],
      totalAmount: 0,
    }
  }

  const allParticipants = participantsStore.filter((e) => e.batchId === batchId)

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
    batchId,
    items: reportItems,
    totalAmount,
  }
}

// ----------------------------------------------------
// Export Data Fetchers (Excel Horizontal Matrix & Vertical Summary)
// ----------------------------------------------------
export async function fetchExaminationDetailExportData(batchId: string) {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const batch = healthExaminationBatchesStore.find((b) => b.id === batchId)
  if (!batch) {
    throw new Error(`Đợt khám với mã "${batchId}" không tồn tại`)
  }

  const allParticipants = participantsStore.filter((e) => e.batchId === batchId)
  const columns = (batch.services || []).map((item) => ({
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
    batchName: batch.name,
    batchCode: batch.code,
    columns,
    rows,
  }
}

export async function fetchExaminationSummaryExportData(batchId: string) {
  const report = await fetchHealthExaminationBatchReport(batchId)
  const batch = healthExaminationBatchesStore.find((b) => b.id === batchId)

  return {
    batchName: batch?.name || "Bao-cao-tong-hop",
    batchCode: batch?.code || "DK",
    items: report.items,
    totalAmount: report.totalAmount,
  }
}
