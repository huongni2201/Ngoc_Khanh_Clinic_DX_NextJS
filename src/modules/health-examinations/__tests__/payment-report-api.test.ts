import { afterEach, describe, expect, it, vi } from "vitest"
import { ZodError } from "zod"
import { apiClient } from "@/shared/api/api-client"
import {
  buildPaymentSummaryDocxUrl,
  buildPaymentSummaryUrl,
  downloadPaymentSummaryDocx,
  fetchPaymentSummaryReport,
} from "../api/reports"

const BASE =
  "/api/v1/organizations/org-1/health-examination-batches/batch-1/reports/payment-summary"

const backendReport = {
  batchId: "batch-1",
  batchCode: "DK001",
  batchName: "Khám định kỳ",
  batchStatus: "READY",
  provisional: true,
  registeredCount: 120,
  attendedCount: 105,
  reconciledCount: 100,
  items: [
    {
      batchServiceId: "s1",
      serviceCode: "KNTQ",
      serviceName: "Khám nội tổng quát",
      displayOrder: 1,
      unitPrice: 100000,
      examinedCount: 50,
      amount: 5000000,
    },
    {
      batchServiceId: "s2",
      serviceCode: null,
      serviceName: null,
      displayOrder: 2,
      unitPrice: 40000,
      examinedCount: 0,
      amount: 0,
    },
  ],
  totalAmount: 5000000,
  generatedAt: "2026-10-07T03:00:00Z",
}

afterEach(() => vi.restoreAllMocks())

describe("payment report", () => {
  it("builds the JSON and Word URLs", () => {
    expect(buildPaymentSummaryUrl("org-1", "batch-1")).toBe(BASE)
    expect(buildPaymentSummaryDocxUrl("org-1", "batch-1")).toBe(`${BASE}/docx`)
    expect(buildPaymentSummaryDocxUrl("a/b", "c d")).toContain("organizations/a%2Fb/")
  })

  it("parses the report and maps an unknown catalog service to undefined", async () => {
    const get = vi
      .spyOn(apiClient, "get")
      .mockResolvedValue({ result: "OK", code: 200, message: "ok", data: backendReport })

    const report = await fetchPaymentSummaryReport("org-1", "batch-1")

    expect(get).toHaveBeenCalledWith(BASE, { signal: undefined })
    expect(report).toMatchObject({ provisional: true, totalAmount: 5000000, registeredCount: 120 })
    expect(report.items[0]).toMatchObject({ serviceName: "Khám nội tổng quát", amount: 5000000 })
    expect(report.items[1]).toMatchObject({ serviceCode: undefined, serviceName: undefined })
  })

  it("rejects an unknown batch status", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      result: "OK",
      code: 200,
      message: "ok",
      data: { ...backendReport, batchStatus: "ARCHIVED" },
    })

    await expect(fetchPaymentSummaryReport("org-1", "batch-1")).rejects.toBeInstanceOf(ZodError)
  })

  it("downloads the Word file with the backend name or a default", async () => {
    const blob = new Blob(["docx"])
    const getBlob = vi
      .spyOn(apiClient, "getBlob")
      .mockResolvedValueOnce({ blob, filename: "bao-cao-thanh-toan-DK001.docx" })
      .mockResolvedValueOnce({ blob })

    await expect(downloadPaymentSummaryDocx("org-1", "batch-1")).resolves.toEqual({
      blob,
      fileName: "bao-cao-thanh-toan-DK001.docx",
    })
    await expect(downloadPaymentSummaryDocx("org-1", "batch-1")).resolves.toMatchObject({
      fileName: "bao-cao-thanh-toan.docx",
    })
    expect(getBlob).toHaveBeenCalledWith(`${BASE}/docx`, { signal: undefined })
  })
})
