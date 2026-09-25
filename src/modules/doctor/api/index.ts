import {
  DoctorEncounter,
  DoctorCounters,
  DoctorFilterParams,
  DoctorWorklistResponse,
  NextDoctorAction,
} from "../types"

export const initialDoctorEncounters: DoctorEncounter[] = [
  {
    id: "enc-001",
    stt: 1,
    encounterCode: "LK-2026-0913",
    patientId: "pat-001",
    patientName: "Trần Thị Hương",
    birthYear: 1989,
    gender: "Nữ",
    checkinTime: "08:15",
    checkinDate: "25/09/2026",
    examType: "SERVICE",
    roomName: "Nội tổng quát",
    chiefComplaint: "Tái khám tăng huyết áp",
    prescribedItemsCount: 4,
    status: "WAITING_EXAM",
    assignedDoctor: "BS. Trần Minh Khoa",
    phoneNumber: "0912 345 678",
    identificationNumber: "001189004567",
    address: "Ba Đình, Hà Nội",
    priority: "NORMAL",
    vitalSigns: {
      bp: "140/90 mmHg",
      pulse: 82,
      temp: 36.8,
      spO2: 98,
      weight: 56,
      height: 158,
      bmi: 22.4,
    },
    prescribedItems: [
      { id: "p-1", code: "XN-01", name: "Tổng phân tích tế bào máu ngoại vi", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
      { id: "p-2", code: "XN-02", name: "Định lượng Glucose máu", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
      { id: "p-3", code: "XN-03", name: "Định lượng Cholesterol toàn phần", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
      { id: "p-4", code: "TD-01", name: "Điện tim vi tính (ECG)", category: "THĂM_DÒ_CHỨC_NĂNG", status: "WAITING_RESULT" },
    ],
  },
  {
    id: "enc-002",
    stt: 2,
    encounterCode: "LK-2026-0914",
    patientId: "pat-002",
    patientName: "Nguyễn Văn Bình",
    birthYear: 1978,
    gender: "Nam",
    checkinTime: "08:25",
    checkinDate: "25/09/2026",
    examType: "SERVICE",
    roomName: "Tim mạch",
    chiefComplaint: "Đau ngực, khó thở nhẹ",
    prescribedItemsCount: 5,
    status: "EXAMINING",
    assignedDoctor: "BS. Trần Minh Khoa",
    phoneNumber: "0983 112 233",
    identificationNumber: "001078009876",
    address: "Cầu Giấy, Hà Nội",
    priority: "PRIORITY",
    vitalSigns: {
      bp: "135/85 mmHg",
      pulse: 90,
      temp: 36.9,
      spO2: 97,
      weight: 72,
      height: 170,
      bmi: 24.9,
    },
    prescribedItems: [
      { id: "p-5", code: "TD-01", name: "Điện tim vi tính (ECG)", category: "THĂM_DÒ_CHỨC_NĂNG", status: "COMPLETED", resultSummary: "Nhịp xoang nhanh 90ck/p" },
      { id: "p-6", code: "CDHA-01", name: "Siêu âm Doppler tim mầu", category: "CHẨN_ĐOÁN_HÌNH_ẢNH", status: "IN_PROGRESS" },
      { id: "p-7", code: "XN-04", name: "Định lượng Troponin T hs", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
      { id: "p-8", code: "XN-05", name: "Điện giải đồ (Na, K, Cl)", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
      { id: "p-9", code: "CDHA-02", name: "X-Quang ngực thẳng", category: "CHẨN_ĐOÁN_HÌNH_ẢNH", status: "WAITING_RESULT" },
    ],
  },
  {
    id: "enc-003",
    stt: 3,
    encounterCode: "LK-2026-0915",
    patientId: "pat-003",
    patientName: "Phạm Thu Trang",
    birthYear: 1995,
    gender: "Nữ",
    checkinTime: "08:40",
    checkinDate: "25/09/2026",
    examType: "SERVICE",
    roomName: "Nội tổng quát",
    chiefComplaint: "Đau bụng, rối loạn tiêu hóa",
    prescribedItemsCount: 3,
    status: "WAITING_CLS",
    assignedDoctor: "BS. Trần Minh Khoa",
    phoneNumber: "0974 556 778",
    identificationNumber: "001195003421",
    address: "Đống Đa, Hà Nội",
    priority: "NORMAL",
    vitalSigns: {
      bp: "110/70 mmHg",
      pulse: 76,
      temp: 37.2,
      spO2: 99,
      weight: 50,
      height: 160,
      bmi: 19.5,
    },
    prescribedItems: [
      { id: "p-10", code: "CDHA-03", name: "Siêu âm ổ bụng tổng quát", category: "CHẨN_ĐOÁN_HÌNH_ẢNH", status: "WAITING_RESULT" },
      { id: "p-11", code: "XN-01", name: "Tổng phân tích tế bào máu ngoại vi", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
      { id: "p-12", code: "XN-06", name: "Định lượng Amylase máu", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
    ],
  },
  {
    id: "enc-004",
    stt: 4,
    encounterCode: "LK-2026-0916",
    patientId: "pat-004",
    patientName: "Lê Minh Anh",
    birthYear: 2001,
    gender: "Nam",
    checkinTime: "09:00",
    checkinDate: "25/09/2026",
    examType: "SERVICE",
    roomName: "Tai mũi họng",
    chiefComplaint: "Viêm họng, sốt",
    prescribedItemsCount: 2,
    status: "WAITING_CONCLUSION",
    assignedDoctor: "BS. Trần Minh Khoa",
    phoneNumber: "0934 889 900",
    identificationNumber: "001201007890",
    address: "Tây Hồ, Hà Nội",
    priority: "NORMAL",
    vitalSigns: {
      bp: "120/80 mmHg",
      pulse: 84,
      temp: 38.3,
      spO2: 98,
      weight: 65,
      height: 172,
      bmi: 22.0,
    },
    prescribedItems: [
      { id: "p-13", code: "XN-01", name: "Tổng phân tích máu ngoại vi (WBC 11.2)", category: "XÉT_NGHIỆM", status: "COMPLETED", resultSummary: "Bạch cầu tăng nhẹ (11.2 G/L)" },
      { id: "p-14", code: "CK-01", name: "Nội soi tai mũi họng dải tần hẹp (NBI)", category: "KHÁM_CHUYÊN_KHOA", status: "COMPLETED", resultSummary: "Niêm mạc họng đỏ, amidan quá phát độ II có giả mạc mủ" },
    ],
    diagnosis: "Viêm amidan cấp mủ / Sốt nhiễm khuẩn",
  },
  {
    id: "enc-005",
    stt: 5,
    encounterCode: "LK-2026-0917",
    patientId: "pat-005",
    patientName: "Vũ Thị Hoa",
    birthYear: 1968,
    gender: "Nữ",
    checkinTime: "09:10",
    checkinDate: "25/09/2026",
    examType: "ORGANIZATION",
    roomName: "Nội tổng quát",
    chiefComplaint: "Khám sức khỏe định kỳ",
    prescribedItemsCount: 6,
    status: "COMPLETED",
    assignedDoctor: "BS. Trần Minh Khoa",
    phoneNumber: "0904 223 344",
    identificationNumber: "001168001234",
    address: "Hoàn Kiếm, Hà Nội",
    priority: "NORMAL",
    vitalSigns: {
      bp: "125/80 mmHg",
      pulse: 74,
      temp: 36.6,
      spO2: 99,
      weight: 54,
      height: 155,
      bmi: 22.5,
    },
    prescribedItems: [
      { id: "p-15", code: "XN-01", name: "Tổng phân tích tế bào máu", category: "XÉT_NGHIỆM", status: "COMPLETED", resultSummary: "Bình thường" },
      { id: "p-16", code: "XN-02", name: "Đường huyết đói (Glucose)", category: "XÉT_NGHIỆM", status: "COMPLETED", resultSummary: "5.4 mmol/L (Bình thường)" },
      { id: "p-17", code: "XN-07", name: "Men gan (AST, ALT)", category: "XÉT_NGHIỆM", status: "COMPLETED", resultSummary: "AST 24 U/L, ALT 22 U/L" },
      { id: "p-18", code: "CDHA-03", name: "Siêu âm ổ bụng tổng quát", category: "CHẨN_ĐOÁN_HÌNH_ẢNH", status: "COMPLETED", resultSummary: "Nang thận phải kích thước nhỏ (12mm)" },
      { id: "p-19", code: "CDHA-02", name: "X-Quang ngực thẳng kỹ thuật số", category: "CHẨN_ĐOÁN_HÌNH_ẢNH", status: "COMPLETED", resultSummary: "Hai phế trường sáng đều, bóng tim không to" },
      { id: "p-20", code: "TD-01", name: "Điện tâm đồ (ECG)", category: "THĂM_DÒ_CHỨC_NĂNG", status: "COMPLETED", resultSummary: "Nhịp xoang đều 74 lần/phút" },
    ],
    diagnosis: "Sức khỏe loại I - Theo dõi nang thận phải lành tính",
  },
  {
    id: "enc-006",
    stt: 6,
    encounterCode: "LK-2026-0918",
    patientId: "pat-006",
    patientName: "Đỗ Quang Huy",
    birthYear: 1984,
    gender: "Nam",
    checkinTime: "09:20",
    checkinDate: "25/09/2026",
    examType: "SERVICE",
    roomName: "Cơ xương khớp",
    chiefComplaint: "Đau lưng kéo dài",
    prescribedItemsCount: 4,
    status: "WAITING_EXAM",
    assignedDoctor: "BS. Trần Minh Khoa",
    phoneNumber: "0915 667 788",
    identificationNumber: "001084005678",
    address: "Hà Đông, Hà Nội",
    priority: "NORMAL",
    vitalSigns: {
      bp: "130/80 mmHg",
      pulse: 78,
      temp: 36.7,
      spO2: 98,
      weight: 68,
      height: 168,
      bmi: 24.1,
    },
    prescribedItems: [
      { id: "p-21", code: "CDHA-04", name: "X-Quang cột sống thắt lưng thẳng nghiêng", category: "CHẨN_ĐOÁN_HÌNH_ẢNH", status: "WAITING_RESULT" },
      { id: "p-22", code: "XN-08", name: "Định lượng Calci ion hóa", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
      { id: "p-23", code: "XN-09", name: "Tốc độ máu lắng (VSS)", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
      { id: "p-24", code: "XN-10", name: "Định lượng CRP định lượng", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
    ],
  },
  {
    id: "enc-007",
    stt: 7,
    encounterCode: "LK-2026-0919",
    patientId: "pat-007",
    patientName: "Bùi Ngọc Lan",
    birthYear: 1992,
    gender: "Nữ",
    checkinTime: "09:30",
    checkinDate: "25/09/2026",
    examType: "SERVICE",
    roomName: "Nội tổng quát",
    chiefComplaint: "Chóng mặt, mệt mỏi",
    prescribedItemsCount: 3,
    status: "WAITING_CLS",
    assignedDoctor: "BS. Trần Minh Khoa",
    phoneNumber: "0962 334 455",
    identificationNumber: "001192008901",
    address: "Thanh Xuân, Hà Nội",
    priority: "NORMAL",
    vitalSigns: {
      bp: "105/65 mmHg",
      pulse: 70,
      temp: 36.5,
      spO2: 99,
      weight: 48,
      height: 156,
      bmi: 19.7,
    },
    prescribedItems: [
      { id: "p-25", code: "XN-01", name: "Tổng phân tích máu ngoại vi 24 thông số", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
      { id: "p-26", code: "XN-11", name: "Định lượng Sắt huyết thanh & Ferritin", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
      { id: "p-27", code: "CDHA-05", name: "Siêu âm Doppler mạch cảnh và đốt sống", category: "CHẨN_ĐOÁN_HÌNH_ẢNH", status: "IN_PROGRESS" },
    ],
  },
  {
    id: "enc-008",
    stt: 8,
    encounterCode: "LK-2026-0920",
    patientId: "pat-008",
    patientName: "Trần Đức Long",
    birthYear: 1975,
    gender: "Nam",
    checkinTime: "09:45",
    checkinDate: "25/09/2026",
    examType: "ORGANIZATION",
    roomName: "Tim mạch",
    chiefComplaint: "Kiểm tra sau điều trị",
    prescribedItemsCount: 5,
    status: "WAITING_EXAM",
    assignedDoctor: "BS. Trần Minh Khoa",
    phoneNumber: "0913 998 877",
    identificationNumber: "001075004321",
    address: "Hai Bà Trưng, Hà Nội",
    priority: "NORMAL",
    vitalSigns: {
      bp: "128/82 mmHg",
      pulse: 72,
      temp: 36.7,
      spO2: 98,
      weight: 70,
      height: 169,
      bmi: 24.5,
    },
    prescribedItems: [
      { id: "p-28", code: "TD-01", name: "Điện tâm đồ (ECG)", category: "THĂM_DÒ_CHỨC_NĂNG", status: "WAITING_RESULT" },
      { id: "p-29", code: "XN-03", name: "Lipid máu 4 chỉ số (Cholesterol, TG, HDL, LDL)", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
      { id: "p-30", code: "XN-12", name: "Định lượng Ure & Creatinin máu", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
      { id: "p-31", code: "CDHA-01", name: "Siêu âm tim Doppler", category: "CHẨN_ĐOÁN_HÌNH_ẢNH", status: "WAITING_RESULT" },
      { id: "p-32", code: "XN-13", name: "Tổng phân tích nước tiểu 10 thông số", category: "XÉT_NGHIỆM", status: "WAITING_RESULT" },
    ],
  },
  // Additional mock items up to 43 to fulfill realistic workload and pagination
  ...Array.from({ length: 35 }, (_, idx) => {
    const stt = idx + 9
    const pad = String(stt).padStart(4, "0")
    const code = `LK-2026-${stt + 912}`
    // Distribution matching counters:
    // waitingExam: 12 (rows 1, 6, 8, + 9 more = 12)
    // examining: 3 (row 2, + 2 more = 3)
    // waitingCls: 6 (rows 3, 7, + 4 more = 6)
    // waitingConclusion: 4 (row 4, + 3 more = 4)
    // completed: 18 (row 5, + 17 more = 18)
    let status: DoctorEncounter["status"] = "COMPLETED"
    if (idx < 9) {
      status = "WAITING_EXAM"
    } else if (idx < 11) {
      status = "EXAMINING"
    } else if (idx < 15) {
      status = "WAITING_CLS"
    } else if (idx < 18) {
      status = "WAITING_CONCLUSION"
    } else {
      status = "COMPLETED"
    }

    const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Phan", "Đặng"]
    const middleNames = ["Thị", "Văn", "Đức", "Minh", "Thu", "Ngọc", "Thanh", "Hữu"]
    const lastNames = ["Mai", "Tùng", "Dung", "Hải", "Lan", "Nam", "Quỳnh", "Thắng"]

    const name = `${firstNames[idx % firstNames.length]} ${middleNames[idx % middleNames.length]} ${lastNames[idx % lastNames.length]}`
    const isFemale = idx % 2 === 0
    const birthYear = 1970 + ((idx * 3) % 32)
    const minutes = 45 + (idx + 1) * 7
    const hours = 9 + Math.floor(minutes / 60)
    const remMinutes = minutes % 60
    const time = `${String(hours).padStart(2, "0")}:${String(remMinutes).padStart(2, "0")}`

    const rooms = ["Nội tổng quát", "Tim mạch", "Tai mũi họng", "Cơ xương khớp"]
    const room = rooms[idx % rooms.length]

    const complaints = [
      "Kiểm tra đường huyết",
      "Đau đầu mất ngủ",
      "Khám sức khỏe định kỳ",
      "Ho khan rát họng",
      "Tê bì tay chân",
      "Đau thượng vị",
      "Viêm mũi dị ứng",
    ]

    return {
      id: `enc-mock-${pad}`,
      stt,
      encounterCode: code,
      patientId: `pat-mock-${pad}`,
      patientName: name,
      birthYear,
      gender: (isFemale ? "Nữ" : "Nam") as "Nam" | "Nữ",
      checkinTime: time,
      checkinDate: "25/09/2026",
      examType: (idx % 3 === 0 ? "ORGANIZATION" : "SERVICE") as DoctorEncounter["examType"],
      roomName: room,
      chiefComplaint: complaints[idx % complaints.length],
      prescribedItemsCount: 2 + (idx % 4),
      status,
      assignedDoctor: "BS. Trần Minh Khoa",
      phoneNumber: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
      identificationNumber: `001${birthYear}00${String(idx + 10).padStart(4, "0")}`,
      address: "Hà Nội",
      priority: (idx === 12 ? "EMERGENCY" : idx % 4 === 0 ? "PRIORITY" : "NORMAL") as "NORMAL" | "PRIORITY" | "EMERGENCY",
      vitalSigns: {
        bp: "120/80 mmHg",
        pulse: 75,
        temp: 36.6,
        spO2: 99,
        weight: 60,
        height: 165,
        bmi: 22.0,
      },
    }
  }),
  // Encounters for other physicians to support realistic doctor filtering
  ...Array.from({ length: 4 }, (_, idx) => ({
    id: `enc-an-${idx + 1}`,
    stt: 44 + idx,
    encounterCode: `LK-2026-10${idx + 1}`,
    patientId: `pat-an-${idx + 1}`,
    patientName: `Nguyễn Hoàng ${idx + 1}`,
    birthYear: 1985 + idx,
    gender: "Nam" as const,
    checkinTime: `10:1${idx}`,
    checkinDate: "25/09/2026",
    examType: "SERVICE" as const,
    roomName: "Tim mạch",
    chiefComplaint: "Khám chuyên khoa Tim mạch",
    prescribedItemsCount: 2,
    status: "WAITING_EXAM" as const,
    assignedDoctor: "BS. Nguyễn Văn An",
    phoneNumber: "0912 333 444",
    identificationNumber: `00118500990${idx}`,
    address: "Hà Nội",
    priority: "NORMAL" as const,
    vitalSigns: { bp: "120/80 mmHg", pulse: 75, temp: 36.6, spO2: 99 },
  })),
  ...Array.from({ length: 4 }, (_, idx) => ({
    id: `enc-trang-${idx + 1}`,
    stt: 48 + idx,
    encounterCode: `LK-2026-10${idx + 5}`,
    patientId: `pat-trang-${idx + 1}`,
    patientName: `Lê Thúy ${idx + 1}`,
    birthYear: 1990 + idx,
    gender: "Nữ" as const,
    checkinTime: `10:3${idx}`,
    checkinDate: "25/09/2026",
    examType: "ORGANIZATION" as const,
    roomName: "Tai mũi họng",
    chiefComplaint: "Khám sức khỏe đơn vị",
    prescribedItemsCount: 3,
    status: "WAITING_EXAM" as const,
    assignedDoctor: "BS. Lê Thu Trang",
    phoneNumber: "0988 555 666",
    identificationNumber: `00119000880${idx}`,
    address: "Hà Nội",
    priority: "NORMAL" as const,
    vitalSigns: { bp: "115/75 mmHg", pulse: 72, temp: 36.5, spO2: 98 },
  })),
]

const DEFAULT_ENCOUNTERS_SNAPSHOT = JSON.stringify(initialDoctorEncounters)

export function resetMockDoctorEncounters() {
  const restored = JSON.parse(DEFAULT_ENCOUNTERS_SNAPSHOT)
  initialDoctorEncounters.length = 0
  initialDoctorEncounters.push(...restored)
}

export const initialCounters: DoctorCounters = {
  waitingExam: 12,
  examining: 3,
  waitingCls: 6,
  waitingConclusion: 4,
  completed: 18,
}

export async function fetchDoctorWorklist(
  params: DoctorFilterParams = {}
): Promise<DoctorWorklistResponse> {
  let filtered = [...initialDoctorEncounters]

  // Filter by search query
  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.encounterCode.toLowerCase().includes(q) ||
        item.patientName.toLowerCase().includes(q) ||
        (item.phoneNumber && item.phoneNumber.includes(q)) ||
        (item.identificationNumber && item.identificationNumber.includes(q))
    )
  }

  // Filter by room
  if (params.room && params.room !== "ALL") {
    filtered = filtered.filter((item) => item.roomName === params.room)
  }

  // Filter by status
  if (params.status && params.status !== "ALL") {
    filtered = filtered.filter((item) => item.status === params.status)
  }

  // Filter by doctor
  if (params.doctor && params.doctor !== "ALL") {
    if (params.doctor === "MY" || params.doctor === "Của tôi") {
      filtered = filtered.filter((item) => item.assignedDoctor.includes("Trần Minh Khoa"))
    } else {
      filtered = filtered.filter((item) => item.assignedDoctor === params.doctor)
    }
  }

  // Filter by date
  const checkinDate = params.date?.trim()
  if (checkinDate) {
    filtered = filtered.filter((item) => item.checkinDate === checkinDate)
  }

  // Filter by priority
  if (params.priority && params.priority !== "ALL") {
    filtered = filtered.filter((item) => item.priority === params.priority)
  }

  // Filter by examType
  if (params.examType && params.examType !== "ALL") {
    filtered = filtered.filter((item) => item.examType === params.examType)
  }

  // Sort by time
  if (params.sortDirection) {
    filtered.sort((a, b) => {
      const cmp = a.checkinTime.localeCompare(b.checkinTime)
      return params.sortDirection === "asc" ? cmp : -cmp
    })
  }

  const page = params.page || 1
  const pageSize = params.pageSize || 8
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startIndex = (page - 1) * pageSize
  const items = filtered.slice(startIndex, startIndex + pageSize)

  const counters = await fetchDoctorCounters()

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    counters,
  }
}

export async function fetchDoctorCounters(): Promise<DoctorCounters> {
  const myEncounters = initialDoctorEncounters.filter((e) => e.assignedDoctor.includes("Trần Minh Khoa"))
  const waitingExam = myEncounters.filter((e) => e.status === "WAITING_EXAM").length
  const examining = myEncounters.filter((e) => e.status === "EXAMINING").length
  const waitingCls = myEncounters.filter((e) => e.status === "WAITING_CLS").length
  const waitingConclusion = myEncounters.filter((e) => e.status === "WAITING_CONCLUSION").length
  const completed = myEncounters.filter((e) => e.status === "COMPLETED").length
  return { waitingExam, examining, waitingCls, waitingConclusion, completed }
}

export async function fetchDoctorEncounterById(id: string): Promise<DoctorEncounter | null> {
  return initialDoctorEncounters.find((item) => item.id === id || item.encounterCode === id) ?? null
}

export async function fetchDoctorNextAction(doctorParam?: string): Promise<NextDoctorAction> {
  let encounters = [...initialDoctorEncounters]
  if (doctorParam && doctorParam !== "ALL") {
    if (doctorParam === "MY" || doctorParam === "Của tôi") {
      encounters = encounters.filter((item) => item.assignedDoctor.includes("Trần Minh Khoa"))
    } else {
      encounters = encounters.filter((item) => item.assignedDoctor === doctorParam)
    }
  }

  // 1. Priority: Currently EXAMINING encounter
  const examiningEncounter = encounters.find((item) => item.status === "EXAMINING")
  if (examiningEncounter) {
    return {
      actionType: "CONTINUE",
      encounter: examiningEncounter,
    }
  }

  // 2. Next patient waiting for exam
  const waitingEncounters = encounters.filter((item) => item.status === "WAITING_EXAM")
  if (waitingEncounters.length > 0) {
    const priorityWeights: Record<string, number> = {
      EMERGENCY: 3,
      PRIORITY: 2,
      NORMAL: 1,
    }
    waitingEncounters.sort((a, b) => {
      const pA = priorityWeights[a.priority ?? "NORMAL"] || 1
      const pB = priorityWeights[b.priority ?? "NORMAL"] || 1
      if (pA !== pB) {
        return pB - pA
      }
      return a.checkinTime.localeCompare(b.checkinTime)
    })
    return {
      actionType: "NEXT",
      encounter: waitingEncounters[0],
    }
  }

  return {
    actionType: "NONE",
    encounter: null,
  }
}

export async function startDoctorEncounter(id: string): Promise<DoctorEncounter | null> {
  const encounter = initialDoctorEncounters.find((item) => item.id === id || item.encounterCode === id)
  if (encounter && encounter.status === "WAITING_EXAM") {
    encounter.status = "EXAMINING"
  }
  return encounter ?? null
}
