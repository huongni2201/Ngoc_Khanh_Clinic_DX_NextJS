import {
  MasterExaminationItem,
  HealthExaminationBatch,
  CreateHealthExaminationBatchRequest,
  HealthExaminationBatchFilterParams,
  HealthExaminationBatchListResponse,
  EmployeeInBatch,
  EmployeeListFilterParams,
  EmployeeListResponse,
  EmployeeMatrixItem,
  EmployeeMatrixFilterParams,
  EmployeeMatrixResponse,
  HealthExaminationBatchReportSummary,
  HealthExaminationBatchReportItem,
  ExamItemCompletionStatus,
} from "../types"

// Master catalog of clinic's examination items (matching reference image)
export const masterExaminationCatalog: MasterExaminationItem[] = [
  {
    id: "item-kntq",
    code: "HM001",
    name: "Khám nội tổng quát",
    defaultPrice: 180000,
    description: "Đo sinh hiệu, khám tim mạch, hô hấp, tiêu hóa",
  },
  {
    id: "item-xnm",
    code: "HM002",
    name: "Xét nghiệm máu",
    defaultPrice: 220000,
    description: "Tổng phân tích tế bào máu 18 thông số",
  },
  {
    id: "item-xnnt",
    code: "HM003",
    name: "Xét nghiệm nước tiểu",
    defaultPrice: 80000,
    description: "Tổng phân tích nước tiểu 10 chỉ số",
  },
  {
    id: "item-saob",
    code: "HM004",
    name: "Siêu âm ổ bụng",
    defaultPrice: 150000,
    description: "Siêu âm màu tổng quát các tạng trong ổ bụng",
  },
  {
    id: "item-xqp",
    code: "HM005",
    name: "X-quang phổi",
    defaultPrice: 120000,
    description: "Chụp X-quang tim phổi thẳng kỹ thuật số",
  },
  {
    id: "item-km",
    code: "HM006",
    name: "Khám mắt",
    defaultPrice: 60000,
    description: "Kiểm tra thị lực, sắc giác, nhãn áp sơ bộ",
  },
  {
    id: "item-tmh",
    code: "HM007",
    name: "Tai mũi họng",
    defaultPrice: 70000,
    description: "Nội soi tai mũi họng tổng quát",
  },
]

// In-memory store for batches
let healthExaminationBatchesStore: HealthExaminationBatch[] = [
  {
    id: "batch-1",
    code: "DK001",
    enterpriseId: "ent-2",
    name: "Khám sức khỏe định kỳ 2026",
    examDate: "18/09/2026",
    location: "Tòa nhà FPT, Cầu Giấy, Hà Nội",
    employeeCount: 50,
    status: "IN_PROGRESS",
    note: "Đợt khám sức khỏe định kỳ CBNV 2026",
    items: [
      {
        examinationItemId: "item-kntq",
        name: "Khám nội tổng quát",
        unitPrice: 100000,
      },
      {
        examinationItemId: "item-xnm",
        name: "Xét nghiệm máu",
        unitPrice: 220000,
      },
      {
        examinationItemId: "item-xnnt",
        name: "Xét nghiệm nước tiểu",
        unitPrice: 80000,
      },
      {
        examinationItemId: "item-saob",
        name: "Siêu âm ổ bụng",
        unitPrice: 150000,
      },
      {
        examinationItemId: "item-xqp",
        name: "X-quang phổi",
        unitPrice: 120000,
      },
      {
        examinationItemId: "item-km",
        name: "Khám mắt",
        unitPrice: 60000,
      },
      {
        examinationItemId: "item-tmh",
        name: "Tai mũi họng",
        unitPrice: 70000,
      },
    ],
    createdAt: "10/09/2026",
    updatedAt: "18/09/2026",
  },
  {
    id: "batch-2",
    code: "DK002",
    enterpriseId: "ent-2",
    name: "Khám sức khỏe định kỳ CBNV 2025",
    examDate: "15/10/2025",
    location: "140 Xã Đàn, Đống Đa, Hà Nội",
    employeeCount: 420,
    status: "COMPLETED",
    note: "Đã hoàn tất kết luận và trả sổ Mẫu 03",
    items: [
      {
        examinationItemId: "item-kntq",
        name: "Khám nội tổng quát",
        unitPrice: 100000,
      },
      {
        examinationItemId: "item-xnm",
        name: "Xét nghiệm máu",
        unitPrice: 200000,
      },
    ],
    createdAt: "01/10/2025",
    updatedAt: "20/10/2025",
  },
  {
    id: "batch-3",
    code: "DK003",
    enterpriseId: "ent-2",
    name: "Khám tuyển dụng nhân sự mới Q2/2026",
    examDate: "10/05/2026",
    location: "140 Xã Đàn, Đống Đa, Hà Nội",
    employeeCount: 45,
    status: "COMPLETED",
    items: [
      {
        examinationItemId: "item-kntq",
        name: "Khám nội tổng quát",
        unitPrice: 100000,
      },
    ],
    createdAt: "01/05/2026",
    updatedAt: "12/05/2026",
  },
  {
    id: "batch-4",
    code: "DK004",
    enterpriseId: "ent-2",
    name: "Khám chuyên khoa mắt & TMH 2025",
    examDate: "20/11/2025",
    location: "Tòa nhà FPT, Cầu Giấy, Hà Nội",
    employeeCount: 310,
    status: "COMPLETED",
    items: [
      {
        examinationItemId: "item-km",
        name: "Khám mắt",
        unitPrice: 60000,
      },
      {
        examinationItemId: "item-tmh",
        name: "Tai mũi họng",
        unitPrice: 70000,
      },
    ],
    createdAt: "10/11/2025",
    updatedAt: "22/11/2025",
  },
]

// Base 10 employees strictly matching the reference image
const referenceEmployees: Omit<EmployeeInBatch, "batchId">[] = [
  {
    id: "emp-001",
    employeeCode: "FPT001",
    fullName: "Trần Minh Đức",
    dob: "14/03/1990",
    gender: "Nam",
    cccd: "090312345678",
    phone: "0901 234 567",
    department: "Kỹ thuật",
    jobTitle: "Kỹ sư",
    address: "Hà Nội",
    joinDate: "01/06/2018",
    contractType: "HĐLĐ",
    profileStatus: "VALID",
    note: "",
  },
  {
    id: "emp-002",
    employeeCode: "FPT002",
    fullName: "Nguyễn Thu Hà",
    dob: "22/08/1992",
    gender: "Nữ",
    cccd: "001189012345",
    phone: "0987 654 321",
    department: "Nhân sự",
    jobTitle: "Chuyên viên",
    address: "Hà Nội",
    joinDate: "15/03/2019",
    contractType: "HĐLĐ",
    profileStatus: "VALID",
    note: "",
  },
  {
    id: "emp-003",
    employeeCode: "FPT003",
    fullName: "Lê Quang Huy",
    dob: "05/01/1988",
    gender: "Nam",
    cccd: "012398765432",
    phone: "0912 345 678",
    department: "Kinh doanh",
    jobTitle: "Trưởng nhóm",
    address: "Hồ Chí Minh",
    joinDate: "20/07/2017",
    contractType: "HĐLĐ",
    profileStatus: "MISSING_CCCD",
    note: "",
  },
  {
    id: "emp-004",
    employeeCode: "FPT004",
    fullName: "Phạm Thị Mai",
    dob: "12/11/1993",
    gender: "Nữ",
    cccd: "022301234567",
    phone: "0934 567 890",
    department: "Tài chính",
    jobTitle: "Kế toán",
    address: "Đà Nẵng",
    joinDate: "01/12/2020",
    contractType: "HĐLĐ",
    profileStatus: "VALID",
    note: "",
  },
  {
    id: "emp-005",
    employeeCode: "FPT005",
    fullName: "Đặng Hoàng Nam",
    dob: "28/06/1991",
    gender: "Nam",
    cccd: "034567890123",
    phone: "0965 432 109",
    department: "Kinh doanh",
    jobTitle: "Chuyên viên",
    address: "Hà Nội",
    joinDate: "10/05/2019",
    contractType: "HĐLĐ",
    profileStatus: "MISSING_SIGNATURE",
    note: "",
  },
  {
    id: "emp-006",
    employeeCode: "FPT006",
    fullName: "Nguyễn Văn Long",
    dob: "17/09/1989",
    gender: "Nam",
    cccd: "028912345678",
    phone: "0909 876 543",
    department: "Công nghệ",
    jobTitle: "Chuyên viên",
    address: "Hà Nội",
    joinDate: "03/11/2018",
    contractType: "HĐLĐ",
    profileStatus: "VALID",
    note: "",
  },
  {
    id: "emp-007",
    employeeCode: "FPT007",
    fullName: "Vũ Thị Thanh Huyền",
    dob: "03/04/1994",
    gender: "Nữ",
    cccd: "031234567890",
    phone: "0918 765 432",
    department: "Nhân sự",
    jobTitle: "Chuyên viên",
    address: "Hải Phòng",
    joinDate: "21/01/2021",
    contractType: "HĐ thử việc",
    profileStatus: "MISSING_CCCD",
    note: "",
  },
  {
    id: "emp-008",
    employeeCode: "FPT008",
    fullName: "Hoàng Anh Tuấn",
    dob: "19/12/1990",
    gender: "Nam",
    cccd: "040123456789",
    phone: "0977 111 222",
    department: "Sản xuất",
    jobTitle: "Kỹ thuật viên",
    address: "Bắc Ninh",
    joinDate: "18/09/2018",
    contractType: "HĐLĐ",
    profileStatus: "VALID",
    note: "",
  },
  {
    id: "emp-009",
    employeeCode: "FPT009",
    fullName: "Đỗ Thị Kim Ngân",
    dob: "27/05/1992",
    gender: "Nữ",
    cccd: "045678901234",
    phone: "0983 222 111",
    department: "Marketing",
    jobTitle: "Chuyên viên",
    address: "Hà Nội",
    joinDate: "12/03/2020",
    contractType: "HĐLĐ",
    profileStatus: "MISSING_SIGNATURE",
    note: "",
  },
  {
    id: "emp-010",
    employeeCode: "FPT010",
    fullName: "Bùi Văn Duy",
    dob: "09/10/1987",
    gender: "Nam",
    cccd: "052345678901",
    phone: "0968 333 444",
    department: "Kỹ thuật",
    jobTitle: "Tổ trưởng",
    address: "Hưng Yên",
    joinDate: "01/08/2016",
    contractType: "HĐLĐ",
    profileStatus: "VALID",
    note: "",
  },
]

// Generate remaining 40 employees to reach exactly 50 employees
const generateSeedEmployees = (batchId: string): EmployeeInBatch[] => {
  const result: EmployeeInBatch[] = referenceEmployees.map((e) => ({
    ...e,
    batchId,
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
    const profileStatus = i % 5 === 0 ? "MISSING_CCCD" : i % 7 === 0 ? "MISSING_SIGNATURE" : "VALID"

    result.push({
      id: `emp-${String(idx).padStart(3, "0")}`,
      batchId,
      employeeCode: code,
      fullName: extraNames[i] || `Nhân viên ${code}`,
      dob: `${String((i % 28) + 1).padStart(2, "0")}/${String((i % 12) + 1).padStart(2, "0")}/${1988 + (i % 12)}`,
      gender: isFemale ? "Nữ" : "Nam",
      cccd: `0${String(10000000000 + i * 12345678).slice(0, 11)}`,
      phone: `09${String(10000000 + i * 98765).slice(0, 8)}`,
      department: depts[i % depts.length],
      jobTitle: i % 4 === 0 ? "Kỹ sư" : i % 3 === 0 ? "Trưởng nhóm" : "Chuyên viên",
      address: cities[i % cities.length],
      joinDate: `01/${String((i % 12) + 1).padStart(2, "0")}/${2017 + (i % 7)}`,
      contractType: i === 38 ? "HĐ thử việc" : "HĐLĐ",
      profileStatus,
      note: "",
    })
  }

  return result
}

// In-memory employee store
let employeesStore: EmployeeInBatch[] = generateSeedEmployees("batch-1")

// Completed examination items by employee to match Tab 2 & Tab 3:
// - Khám nội tổng quát: 50
// - Xét nghiệm máu: 48
// - Xét nghiệm nước tiểu: 46
// - Siêu âm ổ bụng: 42
// - X-quang phổi: 40
// - Khám mắt: 38
// - Tai mũi họng: 35
export const getCompletedItemsForEmployee = (employeeIndex: number): string[] => {
  const completed: string[] = []
  if (employeeIndex < 50) completed.push("item-kntq")
  if (employeeIndex < 48) completed.push("item-xnm")
  if (employeeIndex < 46) completed.push("item-xnnt")
  if (employeeIndex < 42) completed.push("item-saob")
  if (employeeIndex < 40) completed.push("item-xqp")
  if (employeeIndex < 38) completed.push("item-km")
  if (employeeIndex < 35) completed.push("item-tmh")
  return completed
}

// ----------------------------------------------------
// Public API Functions
// ----------------------------------------------------

export async function fetchMasterExaminationCatalog(): Promise<MasterExaminationItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return [...masterExaminationCatalog]
}

export async function fetchHealthExaminationBatchesByEnterprise(
  enterpriseId: string,
  params?: HealthExaminationBatchFilterParams
): Promise<HealthExaminationBatchListResponse> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  let filtered = healthExaminationBatchesStore.filter(
    (b) =>
      b.enterpriseId.toLowerCase() === enterpriseId.toLowerCase() ||
      (enterpriseId.toLowerCase() === "dn002" && b.enterpriseId === "ent-2")
  )

  if (params?.search && params.search.trim() !== "") {
    const keyword = params.search.trim().toLowerCase()
    filtered = filtered.filter(
      (b) =>
        b.name.toLowerCase().includes(keyword) ||
        b.code.toLowerCase().includes(keyword) ||
        b.location.toLowerCase().includes(keyword)
    )
  }

  if (params?.status && params.status !== "ALL") {
    filtered = filtered.filter((b) => b.status === params.status)
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 8
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return {
    data: filtered.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function fetchHealthExaminationBatchById(batchId: string): Promise<HealthExaminationBatch | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  const found = healthExaminationBatchesStore.find((b) => b.id === batchId)
  return found ? { ...found } : null
}

export async function createHealthExaminationBatch(request: CreateHealthExaminationBatchRequest): Promise<HealthExaminationBatch> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const newCodeIndex = healthExaminationBatchesStore.length + 1
  const code = `DK${String(newCodeIndex).padStart(3, "0")}`
  const now = new Date()
  const todayStr = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`

  const mappedItems = request.items.map((item) => {
    const catalogItem = masterExaminationCatalog.find(
      (c) => c.id === item.examinationItemId
    )
    return {
      examinationItemId: item.examinationItemId,
      name: catalogItem ? catalogItem.name : "Hạng mục khám",
      unitPrice: item.unitPrice,
    }
  })

  const newBatch: HealthExaminationBatch = {
    id: `batch-${Date.now()}`,
    code,
    enterpriseId: request.enterpriseId,
    name: request.name,
    examDate: request.examDate,
    location: request.location,
    employeeCount: 0,
    status: "IN_PROGRESS",
    note: request.note,
    items: mappedItems,
    createdAt: todayStr,
    updatedAt: todayStr,
  }

  healthExaminationBatchesStore = [newBatch, ...healthExaminationBatchesStore]
  return { ...newBatch }
}

// ----------------------------------------------------
// Screen 04: Fetch Employee Roster (Tab 1)
// ----------------------------------------------------
export async function fetchHealthExaminationBatchEmployees(
  batchId: string,
  params?: EmployeeListFilterParams
): Promise<EmployeeListResponse> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  let filtered = employeesStore.filter((e) => e.batchId === batchId)

  // Search by code, name, CCCD, phone
  if (params?.search && params.search.trim() !== "") {
    const keyword = params.search.trim().toLowerCase()
    filtered = filtered.filter(
      (e) =>
        e.employeeCode.toLowerCase().includes(keyword) ||
        e.fullName.toLowerCase().includes(keyword) ||
        e.cccd.toLowerCase().includes(keyword) ||
        e.phone.toLowerCase().includes(keyword)
    )
  }

  // Filter by department
  if (params?.department && params.department !== "ALL") {
    filtered = filtered.filter((e) => e.department === params.department)
  }

  // Filter by profile status
  if (params?.profileStatus && params.profileStatus !== "ALL") {
    filtered = filtered.filter((e) => e.profileStatus === params.profileStatus)
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return {
    data: filtered.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    totalPages,
  }
}

// ----------------------------------------------------
// Screen 04/05: Fetch Examination Matrix (Tab 2)
// ----------------------------------------------------
export async function fetchHealthExaminationBatchMatrix(
  batchId: string,
  params?: EmployeeMatrixFilterParams
): Promise<EmployeeMatrixResponse> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const batch = healthExaminationBatchesStore.find((b) => b.id === batchId)
  const batchItems = (batch?.items || []).map((item) => {
    let shortName = item.name
    if (item.examinationItemId === "item-kntq") shortName = "Khám nội"
    else if (item.examinationItemId === "item-xnm") shortName = "XN máu"
    else if (item.examinationItemId === "item-xnnt") shortName = "XN nước tiểu"
    else if (item.examinationItemId === "item-saob") shortName = "Siêu âm"
    else if (item.examinationItemId === "item-xqp") shortName = "X-quang"
    else if (item.examinationItemId === "item-km") shortName = "Khám mắt"
    else if (item.examinationItemId === "item-tmh") shortName = "TMH"

    return {
      id: item.examinationItemId,
      name: shortName,
    }
  })

  const allEmployees = employeesStore.filter((e) => e.batchId === batchId)

  // Map each employee to matrix item with completed items and examinations record
  const matrixItems: EmployeeMatrixItem[] = allEmployees.map((e, index) => {
    const completedItemIds = getCompletedItemsForEmployee(index)
    const examinations: Record<string, ExamItemCompletionStatus> = {}

    batchItems.forEach((bItem) => {
      examinations[bItem.id] = completedItemIds.includes(bItem.id)
        ? "COMPLETED"
        : "PENDING"
    })

    const totalConfigured = batchItems.length
    let examStatus: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED" = "NOT_STARTED"
    if (totalConfigured > 0 && completedItemIds.length >= totalConfigured) {
      examStatus = "COMPLETED"
    } else if (completedItemIds.length > 0) {
      examStatus = "IN_PROGRESS"
    }

    const note =
      e.note ||
      (index === 2 || index === 6 || index === 8
        ? "Khám bù"
        : index === 4
        ? "Thiếu chữ ký"
        : e.profileStatus === "MISSING_CCCD"
        ? "Khám bù"
        : e.profileStatus === "MISSING_SIGNATURE"
        ? "Thiếu chữ ký"
        : "Đủ hồ sơ")
    const noteType: "success" | "warning" =
      note === "Đủ hồ sơ" ? "success" : "warning"

    return {
      id: e.id,
      employeeCode: e.employeeCode,
      fullName: e.fullName,
      department: e.department,
      cccd: e.cccd,
      examinations,
      completedItemIds,
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
        m.employeeCode.toLowerCase().includes(keyword) ||
        m.fullName.toLowerCase().includes(keyword) ||
        (m.cccd && m.cccd.toLowerCase().includes(keyword))
    )
  }

  // Filter by department
  if (params?.department && params.department !== "ALL") {
    const targetDept = params.department.toLowerCase()
    filtered = filtered.filter(
      (m) =>
        m.department.toLowerCase() === targetDept ||
        m.department.toLowerCase() === `khối ${targetDept}` ||
        targetDept === `khối ${m.department}`.toLowerCase()
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
    items: batchItems,
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

  const items = batch.items || []

  // If batch has no items or 0 employees, return empty items
  if (items.length === 0 || batch.employeeCount === 0) {
    return {
      batchId,
      items: [],
      totalAmount: 0,
    }
  }

  const allEmployees = employeesStore.filter((e) => e.batchId === batchId)

  // Dynamically count completed items from employees:
  const countMap: Record<string, number> = {}
  allEmployees.forEach((_, idx) => {
    const completed = getCompletedItemsForEmployee(idx)
    completed.forEach((id) => {
      countMap[id] = (countMap[id] || 0) + 1
    })
  })

  const reportItems: HealthExaminationBatchReportItem[] = items.map((item) => {
    const examinedCount = countMap[item.examinationItemId] ?? 0
    const totalAmount = examinedCount * item.unitPrice

    return {
      examinationItemId: item.examinationItemId,
      name: item.name,
      examinedCount,
      unitPrice: item.unitPrice,
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
export async function fetchExamDetailExportData(batchId: string) {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const batch = healthExaminationBatchesStore.find((b) => b.id === batchId)
  if (!batch) {
    throw new Error(`Đợt khám với mã "${batchId}" không tồn tại`)
  }

  const allEmployees = employeesStore.filter((e) => e.batchId === batchId)
  const columns = (batch.items || []).map((item) => ({
    id: item.examinationItemId,
    name: item.name,
  }))

  const rows = allEmployees.map((e, index) => ({
    employeeCode: e.employeeCode,
    fullName: e.fullName,
    cccd: e.cccd,
    department: e.department,
    completedItemIds: getCompletedItemsForEmployee(index),
  }))

  return {
    batchName: batch.name,
    batchCode: batch.code,
    columns,
    rows,
  }
}

export async function fetchExamSummaryExportData(batchId: string) {
  const report = await fetchHealthExaminationBatchReport(batchId)
  const batch = healthExaminationBatchesStore.find((b) => b.id === batchId)

  return {
    batchName: batch?.name || "Bao-cao-tong-hop",
    batchCode: batch?.code || "DK",
    items: report.items,
    totalAmount: report.totalAmount,
  }
}

// ----------------------------------------------------
// Screen 04: Import Employees Mutation
// ----------------------------------------------------
export async function importEmployeesToBatch(
  batchId: string,
  employees: EmployeeInBatch[]
): Promise<{ count: number }> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Replace or append employees
  const otherEmployees = employeesStore.filter((e) => e.batchId !== batchId)
  employeesStore = [...otherEmployees, ...employees]

  // Update batch employee count
  const batch = healthExaminationBatchesStore.find((b) => b.id === batchId)
  if (batch) {
    batch.employeeCount = employees.length
  }

  return { count: employees.length }
}

export async function populateSampleEmployeesForBatch(
  batchId: string
): Promise<{ count: number }> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const newEmployees = generateSeedEmployees(batchId)
  return importEmployeesToBatch(batchId, newEmployees)
}
