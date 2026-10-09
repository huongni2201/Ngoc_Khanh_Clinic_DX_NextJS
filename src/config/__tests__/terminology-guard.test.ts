import { describe, expect, it } from "vitest"
import { scanFile } from "../../../scripts/terminology-guard.mjs"

const labelsFor = (path: string, content: string) =>
  scanFile(path, content).map((finding: { label: string }) => finding.label)

describe("terminology guard", () => {
  it("does not exempt whole modules: health-examinations is scanned like any other", () => {
    expect(
      labelsFor("src/modules/healthexamination/batches/api/index.ts", "const companyId = organizationId")
    ).toEqual(["Company"])
    expect(
      labelsFor("src/modules/appointment/types/index.ts", 'type Channel = "FRONT_DESK" | "ONLINE"')
    ).toEqual(["FRONT_DESK"])
  })

  it("catches camelCase, PascalCase and plural company/enterprise identifiers", () => {
    for (const code of [
      "const matchCompany = true",
      "type CompanyList = string[]",
      "const companies = []",
      "const { enterpriseId } = params",
      "export function EnterpriseTable() {}",
    ]) {
      expect(labelsFor("src/modules/healthexamination/organizations/x.ts", code), code).not.toEqual([])
    }
  })

  it("accepts legal names, EMPLOYEE subjects and clinic staff", () => {
    for (const code of [
      'name: "Công ty Cổ phần FPT"',
      'participantType: "EMPLOYEE"',
      'examinationSiteType: "ORGANIZATION_SITE"',
      'principalType: "STAFF" // nhân viên phòng khám',
      'participantCode: "FPT001"',
    ]) {
      expect(labelsFor("src/modules/healthexamination/organizations/x.ts", code), code).toEqual([])
    }
  })

  it("rejects the legacy COMPANY site type in types, schemas and options", () => {
    for (const code of [
      'export type ExaminationSiteType = "CLINIC" | "COMPANY"',
      'examinationSiteType: z.enum(["CLINIC", "COMPANY"])',
      'examinationSiteType: "COMPANY"',
    ]) {
      expect(labelsFor("src/modules/healthexamination/batches/types/x.ts", code), code).toEqual([
        "site type COMPANY",
      ])
    }
  })

  it("rejects employee-as-participant identifiers and removed import endpoints", () => {
    for (const code of [
      "employeeCode: row.code",
      "type LegacyEmployeeImportRow = {}",
      "const url = `${base}/employee-imports`",
      "const url = `${base}/employees/import-template`",
    ]) {
      expect(labelsFor("src/modules/healthexamination/batches/x.ts", code), code).toEqual([
        "employee-as-participant",
      ])
    }
  })

  it("allows the accepted health-check route and print model but not other health-check names", () => {
    expect(labelsFor("src/app/x.ts", 'href: "/health-check/print/preview"')).toEqual([])
    expect(labelsFor("src/modules/x.ts", "type Model = HealthCheckPrintModel")).toEqual([])
    expect(labelsFor("src/modules/x.ts", "function HealthCheckForm() {}")).toEqual(["HealthCheck"])
    expect(labelsFor("src/modules/x.ts", 'className="health-check-card"')).toHaveLength(1)
  })

  it("reports an overlapping match once", () => {
    expect(scanFile("src/modules/appointment/x.ts", 'channel = "FRONT_DESK"')).toHaveLength(1)
  })

  it("forbids production source from importing tests or fixtures, including type-only imports", () => {
    for (const code of [
      'type Api = typeof import("../__tests__/fixtures/api-fixtures")',
      'import type { Row } from "./__tests__/fixtures/rows"',
      'import { seed } from "../fixtures/seed"',
      'const mod = await import("./thing.test")',
    ]) {
      expect(labelsFor("src/modules/billing/api/index.ts", code), code).toEqual([
        "production imports test code",
      ])
    }
    expect(
      labelsFor("src/modules/billing/__tests__/billing.test.ts", 'import { x } from "./fixtures/api-fixtures"')
    ).toEqual([])
  })

  it("keeps exceptions narrow: a listed file is only exempt for its listed labels", () => {
    const path = "src/modules/healthexamination/batches/__tests__/health-examination-batch-schema.test.ts"
    expect(labelsFor(path, 'examinationSiteType: "COMPANY"')).toEqual([])
    expect(labelsFor(path, "const companyId = 1")).toEqual(["Company"])
  })
})
