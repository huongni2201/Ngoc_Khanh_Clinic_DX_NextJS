import { describe, expect, it } from "vitest"
import { mapLegacyEmployeeImportRow } from "@/modules/health-examinations/api"

describe("health examination participant import adapter", () => {
  it("maps legacy employee columns into the canonical participant model", () => {
    const participant = mapLegacyEmployeeImportRow(
      {
        id: "legacy-1",
        employeeCode: "FPT001",
        fullName: "Trần Minh Đức",
        dob: "14/03/1990",
        gender: "Nam",
        cccd: "090312345678",
        phone: "0901234567",
        department: "Kỹ thuật",
      },
      "batch-1"
    )

    expect(participant).toMatchObject({
      id: "legacy-1",
      batchId: "batch-1",
      participantCode: "FPT001",
      participantType: "EMPLOYEE",
      fullName: "Trần Minh Đức",
      dateOfBirth: "14/03/1990",
      identificationNumber: "090312345678",
      phoneNumber: "0901234567",
      organizationUnit: "Kỹ thuật",
    })
    expect(participant).not.toHaveProperty("employeeCode")
    expect(participant).not.toHaveProperty("dob")
    expect(participant).not.toHaveProperty("cccd")
    expect(participant).not.toHaveProperty("department")
  })
})
