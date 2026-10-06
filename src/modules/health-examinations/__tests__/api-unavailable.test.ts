import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "@/shared/api/api-client"
import { ApiUnavailableError } from "@/shared/api/api-unavailable"
import {
  fetchExaminationDetailExportData,
  fetchExaminationSummaryExportData,
  fetchHealthExaminationBatchMatrix,
  fetchHealthExaminationBatchReport,
} from "../api"

vi.unmock("../api")

afterEach(() => vi.restoreAllMocks())

describe("health examination backend gaps", () => {
  it.each([
    ["tiến độ khám", () => fetchHealthExaminationBatchMatrix("batch-1")],
    ["báo cáo đợt khám", () => fetchHealthExaminationBatchReport("batch-1")],
    ["xuất tiến độ khám", () => fetchExaminationDetailExportData("batch-1")],
    ["xuất báo cáo đợt khám", () => fetchExaminationSummaryExportData("batch-1")],
  ])("reports %s as unavailable without sending any request", async (feature, call) => {
    const get = vi.spyOn(apiClient, "get")
    const post = vi.spyOn(apiClient, "post")
    const getBlob = vi.spyOn(apiClient, "getBlob")

    const failure = await call().catch((error: unknown) => error)

    expect(failure).toBeInstanceOf(ApiUnavailableError)
    expect(failure).toMatchObject({
      feature,
      message: `Backend chưa cung cấp API cho ${feature}.`,
    })
    expect(failure).not.toHaveProperty("status")
    expect(get).not.toHaveBeenCalled()
    expect(post).not.toHaveBeenCalled()
    expect(getBlob).not.toHaveBeenCalled()
  })
})
