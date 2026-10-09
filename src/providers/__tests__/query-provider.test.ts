import { describe, expect, it } from "vitest"
import { ApiClientError } from "@/shared/api/api-client"
import { ApiUnavailableError } from "@/shared/api/api-unavailable"
import { shouldRetryQuery } from "../query-provider"

describe("shouldRetryQuery", () => {
  it("does not retry client errors or unavailable endpoints", () => {
    expect(shouldRetryQuery(0, new ApiClientError("bad request", 400))).toBe(false)
    expect(shouldRetryQuery(0, new ApiClientError("not implemented", 501))).toBe(false)
    expect(shouldRetryQuery(0, new ApiUnavailableError("danh sách lịch hẹn"))).toBe(false)
  })

  it("retries transient server errors up to the configured limit", () => {
    expect(shouldRetryQuery(0, new ApiClientError("temporary failure", 503))).toBe(true)
    expect(shouldRetryQuery(3, new Error("network failure"))).toBe(false)
  })
})
