import { describe, expect, it } from "vitest"
import {
  buildEmployeeListUrl,
  mapEmployeePageResponse,
  type EmployeePageResponse,
} from "../api/employees"

describe("employee roster API mapping", () => {
  it("builds the backend query and maps a snapshot employee to the table model", () => {
    const response: EmployeePageResponse = {
      result: "OK",
      code: 200,
      message: "Health examination batch employees",
      data: {
        items: [
          {
            batchEmployeeId: "batch-employee-1",
            employeeId: "employee-1",
            employeeCode: "NV001",
            departmentName: "Khối Công nghệ",
            jobTitle: "Kỹ sư",
            occupation: "Phát triển phần mềm",
            snapshot: {
              fullName: "Nguyễn Văn A",
              dateOfBirth: "1990-03-14",
              sex: "MALE",
              identificationNumber: { value: "012345678901" },
              phone: "0901234567",
              province: "Hà Nội",
              ward: "Cầu Giấy",
              addressDetail: "10 Phạm Văn Bạch",
            },
            status: "ACTIVE",
            createdAt: "2026-09-28T10:00:00Z",
          },
        ],
        page: 2,
        size: 10,
        totalElements: 11,
        totalPages: 2,
      },
    }

    expect(
      buildEmployeeListUrl("org-1", "batch-1", {
        search: "Nguyễn",
        page: 2,
        pageSize: 10,
      })
    ).toBe(
      "http://localhost:8080/api/v1/organizations/org-1/health-examination-batches/batch-1/employees?page=2&size=10&searchKey=Nguy%E1%BB%85n&sortBy=ASC&sortKey=id"
    )

    expect(mapEmployeePageResponse(response, "batch-1")).toEqual({
      data: [
        {
          id: "batch-employee-1",
          batchId: "batch-1",
          participantCode: "NV001",
          participantType: "EMPLOYEE",
          fullName: "Nguyễn Văn A",
          dateOfBirth: "14/03/1990",
          gender: "Nam",
          identificationNumber: "012345678901",
          phoneNumber: "0901234567",
          organizationUnit: "Khối Công nghệ",
          jobTitle: "Kỹ sư",
          address: "10 Phạm Văn Bạch, Cầu Giấy, Hà Nội",
          profileStatus: "VALID",
        },
      ],
      total: 11,
      page: 2,
      pageSize: 10,
      totalPages: 2,
    })
  })
})
