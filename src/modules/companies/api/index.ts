import {
  Enterprise,
  EnterpriseDetail,
  EnterpriseFilterParams,
  EnterpriseListResponse,
  EnterpriseCounters,
  CreateEnterpriseDto,
  UpdateEnterpriseDto,
} from "../types"

// Initial enterprises seeded with 32 realistic Vietnamese enterprises
const initialEnterprises: Enterprise[] = [
  {
    id: "ent-1",
    code: "DN001",
    name: "Samsung Electronics Việt Nam",
    logoType: "samsung",
    contactPerson: "Trần Minh Đức",
    contactPhone: "0903 123 456",
    batchesCount: 6,
    status: "IN_PROGRESS",
    updatedAt: "12/09/2026",
    examDate: "20/09/2026",
    taxCode: "0102030405",
    address: "KCN Yên Bình, Phổ Yên, Thái Nguyên",
  },
  {
    id: "ent-2",
    code: "DN002",
    name: "Công ty Cổ phần FPT",
    logoType: "fpt",
    contactPerson: "Nguyễn Văn Hùng",
    contactPhone: "0912 345 678",
    batchesCount: 4,
    status: "COMPLETED",
    updatedAt: "10/09/2026",
    examDate: "10/09/2026",
    taxCode: "0101243150",
    address: "Tòa nhà FPT, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội",
  },
  {
    id: "ent-3",
    code: "DN003",
    name: "Canon Việt Nam",
    logoType: "canon",
    contactPerson: "Phạm Thị Mai",
    contactPhone: "0909 111 222",
    batchesCount: 3,
    status: "COMPLETED",
    updatedAt: "03/09/2026",
    examDate: "03/09/2026",
    taxCode: "0103456789",
    address: "KCN Thăng Long, Đông Anh, Hà Nội",
  },
  {
    id: "ent-4",
    code: "DN004",
    name: "Ngân hàng TMCP Ngoại thương Việt Nam",
    logoType: "vietcombank",
    contactPerson: "Lê Quang Huy",
    contactPhone: "0987 654 321",
    batchesCount: 2,
    status: "IN_PROGRESS",
    updatedAt: "15/09/2026",
    examDate: "25/09/2026",
    taxCode: "0100112437",
    address: "198 Trần Quang Khải, Hoàn Kiếm, Hà Nội",
  },
  {
    id: "ent-5",
    code: "DN005",
    name: "Công ty Cổ phần VNG",
    logoType: "vng",
    contactPerson: "Đặng Hoàng Nam",
    contactPhone: "0933 222 888",
    batchesCount: 3,
    status: "COMPLETED",
    updatedAt: "08/09/2026",
    examDate: "08/09/2026",
    taxCode: "0303886515",
    address: "Z06 Đường số 13, Tân Thuận Đông, Quận 7, TP.HCM",
  },
  {
    id: "ent-6",
    code: "DN006",
    name: "Tập đoàn Hòa Phát",
    logoType: "hoaphat",
    contactPerson: "Nguyễn Văn Long",
    contactPhone: "0916 333 444",
    batchesCount: 5,
    status: "COMPLETED",
    updatedAt: "30/08/2026",
    examDate: "30/08/2026",
    taxCode: "0900189284",
    address: "KCN Phố Nối A, Giai Phạm, Yên Mỹ, Hưng Yên",
  },
  {
    id: "ent-7",
    code: "DN007",
    name: "Unilever Việt Nam",
    logoType: "unilever",
    contactPerson: "Vũ Thị Thanh Huyền",
    contactPhone: "0905 666 777",
    batchesCount: 2,
    status: "IN_PROGRESS",
    updatedAt: "14/09/2026",
    examDate: "22/09/2026",
    taxCode: "0301140927",
    address: "A4-5-6, KCN Tây Bắc Củ Chi, Củ Chi, TP.HCM",
  },
  {
    id: "ent-8",
    code: "DN008",
    name: "Vinamilk",
    logoType: "vinamilk",
    contactPerson: "Hoàng Anh Tuấn",
    contactPhone: "0988 777 999",
    batchesCount: 4,
    status: "COMPLETED",
    updatedAt: "11/09/2026",
    examDate: "11/09/2026",
    taxCode: "0300588569",
    address: "10 Tân Trào, Tân Phú, Quận 7, TP.HCM",
  },
  {
    id: "ent-9",
    code: "DN009",
    name: "Tập đoàn Công nghiệp - Viễn thông Quân đội Viettel",
    logoType: "default",
    contactPerson: "Phan Văn Quân",
    contactPhone: "0989 123 789",
    batchesCount: 7,
    status: "IN_PROGRESS",
    updatedAt: "16/09/2026",
    examDate: "28/09/2026",
    taxCode: "0100109106",
    address: "Số 1 Trần Hữu Dực, Mỹ Đình 2, Nam Từ Liêm, Hà Nội",
  },
  {
    id: "ent-10",
    code: "DN010",
    name: "Công ty Cổ phần Chuỗi Thực phẩm TH (TH True Milk)",
    logoType: "default",
    contactPerson: "Lê Thị Hồng Nhung",
    contactPhone: "0978 456 123",
    batchesCount: 3,
    status: "COMPLETED",
    updatedAt: "09/09/2026",
    examDate: "09/09/2026",
    taxCode: "2901267448",
    address: "Tòa nhà BAC A BANK, 09 Đào Duy Anh, Đống Đa, Hà Nội",
  },
  {
    id: "ent-11",
    code: "DN011",
    name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)",
    logoType: "default",
    contactPerson: "Trịnh Bá Duy",
    contactPhone: "0904 888 333",
    batchesCount: 5,
    status: "IN_PROGRESS",
    updatedAt: "15/09/2026",
    examDate: "18/09/2026",
    taxCode: "0100150619",
    address: "Tháp BIDV, 194 Trần Quang Khải, Hoàn Kiếm, Hà Nội",
  },
  {
    id: "ent-12",
    code: "DN012",
    name: "Công ty Cổ phần Hàng không Vietjet",
    logoType: "default",
    contactPerson: "Ngô Thị Thu Hà",
    contactPhone: "0918 222 999",
    batchesCount: 2,
    status: "COMPLETED",
    updatedAt: "07/09/2026",
    examDate: "07/09/2026",
    taxCode: "0102325379",
    address: "302/3 Phố Kim Mã, Ngọc Khánh, Ba Đình, Hà Nội",
  },
  {
    id: "ent-13",
    code: "DN013",
    name: "Tập đoàn Vingroup",
    logoType: "default",
    contactPerson: "Vũ Đình Cường",
    contactPhone: "0936 111 888",
    batchesCount: 8,
    status: "IN_PROGRESS",
    updatedAt: "17/09/2026",
    examDate: "29/09/2026",
    taxCode: "0101245486",
    address: "Số 7 đường Bằng Lăng 1, Vinhomes Riverside, Long Biên, Hà Nội",
  },
  {
    id: "ent-14",
    code: "DN014",
    name: "Công ty Cổ phần Tập đoàn Masan",
    logoType: "default",
    contactPerson: "Phan Quốc Tuấn",
    contactPhone: "0908 666 333",
    batchesCount: 4,
    status: "COMPLETED",
    updatedAt: "05/09/2026",
    examDate: "05/09/2026",
    taxCode: "0303576603",
    address: "Phòng 802, Central Plaza, 17 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM",
  },
  {
    id: "ent-15",
    code: "DN015",
    name: "Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)",
    logoType: "default",
    contactPerson: "Đỗ Mai Trang",
    contactPhone: "0977 333 444",
    batchesCount: 6,
    status: "IN_PROGRESS",
    updatedAt: "16/09/2026",
    examDate: "26/09/2026",
    taxCode: "0100230800",
    address: "Số 6 Quang Trung, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
  },
  {
    id: "ent-16",
    code: "DN016",
    name: "Công ty TNHH LG Electronics Việt Nam Hải Phòng",
    logoType: "default",
    contactPerson: "Nguyễn Hải Nam",
    contactPhone: "0913 555 777",
    batchesCount: 3,
    status: "COMPLETED",
    updatedAt: "04/09/2026",
    examDate: "04/09/2026",
    taxCode: "0201311397",
    address: "Lô E, KCN Tràng Duệ, An Dương, Hải Phòng",
  },
  {
    id: "ent-17",
    code: "DN017",
    name: "Công ty Cổ phần Đầu tư Thế Giới Di Động",
    logoType: "default",
    contactPerson: "Trần Anh Khoa",
    contactPhone: "0944 222 666",
    batchesCount: 5,
    status: "IN_PROGRESS",
    updatedAt: "13/09/2026",
    examDate: "24/09/2026",
    taxCode: "0306172363",
    address: "128 Trần Quang Khải, Tân Định, Quận 1, TP.HCM",
  },
  {
    id: "ent-18",
    code: "DN018",
    name: "Công ty TNHH Nestlé Việt Nam",
    logoType: "default",
    contactPerson: "Lý Kiều Oanh",
    contactPhone: "0902 444 888",
    batchesCount: 2,
    status: "COMPLETED",
    updatedAt: "06/09/2026",
    examDate: "06/09/2026",
    taxCode: "3600235305",
    address: "KCN Biên Hòa 2, Biên Hòa, Đồng Nai",
  },
  {
    id: "ent-19",
    code: "DN019",
    name: "Công ty Cổ phần Tập đoàn Đất Xanh",
    logoType: "default",
    contactPerson: "Dương Minh Trí",
    contactPhone: "0982 555 111",
    batchesCount: 1,
    status: "IN_PROGRESS",
    updatedAt: "14/09/2026",
    examDate: "21/09/2026",
    taxCode: "0303104342",
    address: "2W Ung Văn Khiêm, Phường 25, Bình Thạnh, TP.HCM",
  },
  {
    id: "ent-20",
    code: "DN020",
    name: "Tập đoàn Xăng dầu Việt Nam (Petrolimex)",
    logoType: "default",
    contactPerson: "Bùi Thị Lan",
    contactPhone: "0915 777 444",
    batchesCount: 4,
    status: "COMPLETED",
    updatedAt: "02/09/2026",
    examDate: "02/09/2026",
    taxCode: "0100107624",
    address: "Số 1 Khâm Thiên, Đống Đa, Hà Nội",
  },
  {
    id: "ent-21",
    code: "DN021",
    name: "Ngân hàng TMCP Quân đội (MBBank)",
    logoType: "default",
    contactPerson: "Nguyễn Tuấn Anh",
    contactPhone: "0986 333 222",
    batchesCount: 3,
    status: "IN_PROGRESS",
    updatedAt: "15/09/2026",
    examDate: "27/09/2026",
    taxCode: "0100283873",
    address: "Số 18 Lê Văn Lương, Trung Hòa, Cầu Giấy, Hà Nội",
  },
  {
    id: "ent-22",
    code: "DN022",
    name: "Công ty Cổ phần Sữa Quốc tế LOF",
    logoType: "default",
    contactPerson: "Hoàng Ngọc Mai",
    contactPhone: "0934 999 555",
    batchesCount: 2,
    status: "COMPLETED",
    updatedAt: "01/09/2026",
    examDate: "01/09/2026",
    taxCode: "0101689255",
    address: "Tầng 3, Tòa nhà Hà Nội Center Point, 27 Lê Văn Lương, Thanh Xuân, Hà Nội",
  },
  {
    id: "ent-23",
    code: "DN023",
    name: "Tổng Công ty Viễn thông MobiFone",
    logoType: "default",
    contactPerson: "Lê Đức Thắng",
    contactPhone: "0904 111 555",
    batchesCount: 4,
    status: "IN_PROGRESS",
    updatedAt: "12/09/2026",
    examDate: "23/09/2026",
    taxCode: "0100124314",
    address: "Tòa nhà MobiFone, Lô VP1, Yên Hòa, Cầu Giấy, Hà Nội",
  },
  {
    id: "ent-24",
    code: "DN024",
    name: "Công ty Cổ phần Dược Hậu Giang",
    logoType: "default",
    contactPerson: "Võ Thị Bích Ngọc",
    contactPhone: "0919 777 666",
    batchesCount: 2,
    status: "COMPLETED",
    updatedAt: "31/08/2026",
    examDate: "31/08/2026",
    taxCode: "1800156801",
    address: "288 Nguyễn Văn Cừ, An Hòa, Ninh Kiều, Cần Thơ",
  },
  {
    id: "ent-25",
    code: "DN025",
    name: "Công ty TNHH Panasonic Việt Nam",
    logoType: "default",
    contactPerson: "Đặng Thị Thảo",
    contactPhone: "0983 444 777",
    batchesCount: 3,
    status: "IN_PROGRESS",
    updatedAt: "11/09/2026",
    examDate: "19/09/2026",
    taxCode: "0101740924",
    address: "Lô J1-J2, KCN Thăng Long, Đông Anh, Hà Nội",
  },
  {
    id: "ent-26",
    code: "DN026",
    name: "Ngân hàng TMCP Á Châu (ACB)",
    logoType: "default",
    contactPerson: "Trương Quốc Huy",
    contactPhone: "0909 333 888",
    batchesCount: 5,
    status: "COMPLETED",
    updatedAt: "29/08/2026",
    examDate: "29/08/2026",
    taxCode: "0301452948",
    address: "442 Nguyễn Thị Minh Khai, Phường 5, Quận 3, TP.HCM",
  },
  {
    id: "ent-27",
    code: "DN027",
    name: "Công ty Cổ phần Vàng bạc Đá quý Phú Nhuận (PNJ)",
    logoType: "default",
    contactPerson: "Nguyễn Thị Thanh Hương",
    contactPhone: "0917 888 222",
    batchesCount: 2,
    status: "IN_PROGRESS",
    updatedAt: "10/09/2026",
    examDate: "17/09/2026",
    taxCode: "0300521758",
    address: "170E Phan Đăng Lưu, Phường 3, Phú Nhuận, TP.HCM",
  },
  {
    id: "ent-28",
    code: "DN028",
    name: "Tập đoàn Novaland",
    logoType: "default",
    contactPerson: "Hồ Bá Lâm",
    contactPhone: "0938 123 999",
    batchesCount: 1,
    status: "COMPLETED",
    updatedAt: "28/08/2026",
    examDate: "28/08/2026",
    taxCode: "0301444753",
    address: "65 Nguyễn Du, Bến Nghé, Quận 1, TP.HCM",
  },
  {
    id: "ent-29",
    code: "DN029",
    name: "Tổng Công ty Cổ phần Bia - Rượu - Nước giải khát Sài Gòn (Sabeco)",
    logoType: "default",
    contactPerson: "Trần Thế Bảo",
    contactPhone: "0906 444 333",
    batchesCount: 3,
    status: "COMPLETED",
    updatedAt: "27/08/2026",
    examDate: "27/08/2026",
    taxCode: "0300583659",
    address: "Tầng 5, Tòa nhà Vincom Center, 72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM",
  },
  {
    id: "ent-30",
    code: "DN030",
    name: "Công ty Cổ phần Cơ Điện Lạnh (REE)",
    logoType: "default",
    contactPerson: "Phạm Thúy Hằng",
    contactPhone: "0981 777 555",
    batchesCount: 2,
    status: "IN_PROGRESS",
    updatedAt: "09/09/2026",
    examDate: "15/09/2026",
    taxCode: "0300741143",
    address: "Tòa nhà REE, 364 Cộng Hòa, Phường 13, Tân Bình, TP.HCM",
  },
  {
    id: "ent-31",
    code: "DN031",
    name: "Tổng Công ty Hàng không Việt Nam (Vietnam Airlines)",
    logoType: "default",
    contactPerson: "Nguyễn Nhật Minh",
    contactPhone: "0912 999 888",
    batchesCount: 4,
    status: "COMPLETED",
    updatedAt: "25/08/2026",
    examDate: "25/08/2026",
    taxCode: "0100107518",
    address: "Số 200 Nguyễn Sơn, Bồ Đề, Long Biên, Hà Nội",
  },
  {
    id: "ent-32",
    code: "DN032",
    name: "Công ty Cổ phần Tập đoàn Gelex",
    logoType: "default",
    contactPerson: "Đinh Xuân Bách",
    contactPhone: "0932 666 111",
    batchesCount: 2,
    status: "IN_PROGRESS",
    updatedAt: "08/09/2026",
    examDate: "16/09/2026",
    taxCode: "0100100514",
    address: "Số 52 Lê Đại Hành, Lê Đại Hành, Hai Bà Trưng, Hà Nội",
  },
]

// Detailed enterprises database
const initialEnterpriseDetails: Record<string, EnterpriseDetail> = {
  "ent-2": {
    id: "ent-2",
    code: "DN002",
    name: "Công ty Cổ phần FPT",
    taxCode: "0101243150",
    contactName: "Nguyễn Văn Hùng",
    contactPerson: "Nguyễn Văn Hùng",
    phone: "0912 345 678",
    contactPhone: "0912 345 678",
    email: "hungnv@fpt.com.vn",
    address: "Tòa nhà FPT, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội",
    shortAddress: "Tòa nhà FPT, Cầu Giấy, Hà Nội",
    note: "Đối tác khám sức khỏe định kỳ hằng năm.",
    status: "PARTNERING",
    batchesCount: 4,
    updatedAt: "10/09/2026",
  },
  DN002: {
    id: "ent-2",
    code: "DN002",
    name: "Công ty Cổ phần FPT",
    taxCode: "0101243150",
    contactName: "Nguyễn Văn Hùng",
    contactPerson: "Nguyễn Văn Hùng",
    phone: "0912 345 678",
    contactPhone: "0912 345 678",
    email: "hungnv@fpt.com.vn",
    address: "Tòa nhà FPT, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội",
    shortAddress: "Tòa nhà FPT, Cầu Giấy, Hà Nội",
    note: "Đối tác khám sức khỏe định kỳ hằng năm.",
    status: "PARTNERING",
    batchesCount: 4,
    updatedAt: "10/09/2026",
  },
}

// In-memory store supporting addition, search, and update
let enterprisesStore: Enterprise[] = [...initialEnterprises]
const enterpriseDetailsStore: Record<string, EnterpriseDetail> = {
  ...initialEnterpriseDetails,
}

export function resetEnterprisesStore() {
  enterprisesStore = [...initialEnterprises]
  for (const key of Object.keys(enterpriseDetailsStore)) {
    delete enterpriseDetailsStore[key]
  }
  Object.assign(enterpriseDetailsStore, initialEnterpriseDetails)
}

// Helper to get or build detail for any enterprise
function getOrCreateDetail(base: Enterprise): EnterpriseDetail {
  if (enterpriseDetailsStore[base.id]) {
    return enterpriseDetailsStore[base.id]
  }

  const detail: EnterpriseDetail = {
    id: base.id,
    code: base.code,
    name: base.name,
    taxCode: base.taxCode || "0101000000",
    contactName: base.contactPerson,
    contactPerson: base.contactPerson,
    phone: base.contactPhone,
    contactPhone: base.contactPhone,
    email: `contact@${base.code.toLowerCase()}.vn`,
    address: base.address || "Hà Nội, Việt Nam",
    shortAddress: base.address ? base.address.split(",").slice(-2).join(",").trim() : "Hà Nội",
    note: "Đối tác khám sức khỏe định kỳ hằng năm.",
    status: "PARTNERING",
    batchesCount: base.batchesCount,
    updatedAt: base.updatedAt,
  }

  enterpriseDetailsStore[base.id] = detail
  enterpriseDetailsStore[base.code] = detail
  return detail
}

export async function fetchEnterprises(
  params?: EnterpriseFilterParams
): Promise<EnterpriseListResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 200))

  let filtered = [...enterprisesStore]

  // Filter by search keyword
  if (params?.search && params.search.trim() !== "") {
    const keyword = params.search.trim().toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword) ||
        item.contactPerson.toLowerCase().includes(keyword) ||
        item.contactPhone.toLowerCase().includes(keyword) ||
        (item.address && item.address.toLowerCase().includes(keyword))
    )
  }

  // Filter by status
  if (params?.status && params.status !== "ALL") {
    filtered = filtered.filter((item) => item.status === params.status)
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startIndex = (page - 1) * pageSize
  const pagedData = filtered.slice(startIndex, startIndex + pageSize)

  return {
    data: pagedData,
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function fetchEnterpriseById(
  id: string
): Promise<EnterpriseDetail> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Direct lookup in details store
  if (enterpriseDetailsStore[id]) {
    return { ...enterpriseDetailsStore[id] }
  }

  // Lookup in base store by id or code
  const base = enterprisesStore.find(
    (item) => item.id === id || item.code.toLowerCase() === id.toLowerCase()
  )

  if (!base) {
    throw new Error(`Không tìm thấy doanh nghiệp với mã hoặc ID: ${id}`)
  }

  const detail = getOrCreateDetail(base)
  return { ...detail }
}

export async function createEnterprise(
  dto: CreateEnterpriseDto
): Promise<Enterprise> {
  await new Promise((resolve) => setTimeout(resolve, 250))

  const newCodeNumber = enterprisesStore.length + 1
  const formattedCode = `DN${String(newCodeNumber).padStart(3, "0")}`

  const now = new Date()
  const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`

  const newId = `ent-${Date.now()}`
  const newEnterprise: Enterprise = {
    id: newId,
    code: formattedCode,
    name: dto.name,
    logoType: "default",
    contactPerson: dto.contactPerson,
    contactPhone: dto.contactPhone,
    batchesCount: 0,
    status: "IN_PROGRESS",
    updatedAt: formattedDate,
    taxCode: dto.taxCode,
    address: dto.address,
  }

  enterprisesStore = [newEnterprise, ...enterprisesStore]

  // Also create detail
  const newDetail: EnterpriseDetail = {
    id: newId,
    code: formattedCode,
    name: dto.name,
    taxCode: dto.taxCode || "",
    contactName: dto.contactPerson,
    contactPerson: dto.contactPerson,
    phone: dto.contactPhone,
    contactPhone: dto.contactPhone,
    email: "",
    address: dto.address || "",
    shortAddress: dto.address || "",
    note: "",
    status: "PARTNERING",
    batchesCount: 0,
    updatedAt: formattedDate,
  }

  enterpriseDetailsStore[newId] = newDetail
  enterpriseDetailsStore[formattedCode] = newDetail

  return newEnterprise
}

export async function updateEnterprise(
  id: string,
  dto: UpdateEnterpriseDto
): Promise<EnterpriseDetail> {
  await new Promise((resolve) => setTimeout(resolve, 250))

  // Find existing detail
  let currentDetail = enterpriseDetailsStore[id]
  if (!currentDetail) {
    const base = enterprisesStore.find(
      (item) => item.id === id || item.code.toLowerCase() === id.toLowerCase()
    )
    if (!base) {
      throw new Error(`Không tìm thấy doanh nghiệp để cập nhật: ${id}`)
    }
    currentDetail = getOrCreateDetail(base)
  }

  const updatedDetail: EnterpriseDetail = {
    ...currentDetail,
    name: dto.name,
    taxCode: dto.taxCode ?? currentDetail.taxCode,
    contactName: dto.contactName,
    contactPerson: dto.contactName,
    phone: dto.phone,
    contactPhone: dto.phone,
    email: dto.email ?? currentDetail.email,
    address: dto.address ?? currentDetail.address,
    shortAddress: dto.address
      ? dto.address.split(",").slice(-2).join(",").trim() || dto.address
      : currentDetail.shortAddress,
    note: dto.note ?? currentDetail.note,
  }

  // Update in stores
  enterpriseDetailsStore[currentDetail.id] = updatedDetail
  enterpriseDetailsStore[currentDetail.code] = updatedDetail

  // Also update list store item
  enterprisesStore = enterprisesStore.map((item) =>
    item.id === currentDetail.id || item.code === currentDetail.code
      ? {
          ...item,
          name: dto.name,
          taxCode: dto.taxCode ?? item.taxCode,
          contactPerson: dto.contactName,
          contactPhone: dto.phone,
          address: dto.address ?? item.address,
        }
      : item
  )

  return { ...updatedDetail }
}

export async function fetchEnterpriseCounters(): Promise<EnterpriseCounters> {
  await new Promise((resolve) => setTimeout(resolve, 80))
  const total = enterprisesStore.length
  const inProgress = enterprisesStore.filter((e) => e.status === "IN_PROGRESS").length
  const completed = enterprisesStore.filter((e) => e.status === "COMPLETED").length
  const totalBatches = enterprisesStore.reduce((acc, e) => acc + (e.batchesCount || 0), 0)
  const estimatedEmployees = totalBatches * 45

  return {
    total,
    inProgress,
    completed,
    totalBatches,
    estimatedEmployees,
  }
}
