export interface ApiResponse<T> {
  result: "OK" | "NG"
  code: number
  message?: string
  data?: T
}

export interface BlobResponse {
  blob: Blob
  filename?: string
}

export interface ApiClientRequestOptions
  extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown
  headers?: HeadersInit
}

export class ApiClientError extends Error {
  readonly status: number
  readonly code?: number

  constructor(message: string, status: number, code?: number) {
    super(message)
    this.name = "ApiClientError"
    this.status = status
    this.code = code
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (typeof value !== "object" || value === null) return false
  const record = value as Record<string, unknown>
  return (record.result === "OK" || record.result === "NG") && typeof record.code === "number"
}

function serializeBody(body: unknown) {
  if (body === undefined || body instanceof FormData || body instanceof Blob) {
    return body as BodyInit | undefined
  }

  if (typeof body === "string" || body instanceof URLSearchParams) {
    return body
  }

  return JSON.stringify(body)
}

function getFilename(response: Response) {
  const disposition = response.headers.get("content-disposition")
  return disposition?.match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i)?.[1]
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined

  try {
    return JSON.parse(text) as unknown
  } catch {
    return undefined
  }
}

async function request<T>(path: string, options: ApiClientRequestOptions = {}) {
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")

  const body = serializeBody(options.body)
  if (body !== undefined && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers.set("Content-Type", "application/json")
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path), {
      ...options,
      body,
      cache: options.cache ?? "no-store",
      headers,
    })
  } catch (error) {
    throw new ApiClientError(
      error instanceof Error ? error.message : "Không thể kết nối tới máy chủ.",
      0
    )
  }

  const payload = await readJson(response)
  if (!response.ok) {
    const errorPayload = isApiResponse(payload) ? payload : undefined
    throw new ApiClientError(
      errorPayload?.message ?? "Yêu cầu tới máy chủ thất bại.",
      response.status,
      errorPayload?.code
    )
  }

  if (!isApiResponse(payload)) {
    throw new ApiClientError("Phản hồi từ máy chủ không đúng định dạng.", response.status)
  }

  if (payload.result !== "OK") {
    throw new ApiClientError(
      payload.message ?? "Yêu cầu không được chấp nhận.",
      response.status,
      payload.code
    )
  }

  return payload as ApiResponse<T>
}

export const apiClient = {
  async get<T>(path: string, options?: ApiClientRequestOptions) {
    return request<T>(path, { ...options, method: "GET" })
  },

  async post<TRequest, TResponse>(path: string, body: TRequest) {
    return request<TResponse>(path, { method: "POST", body })
  },

  async put<TRequest, TResponse>(path: string, body: TRequest) {
    return request<TResponse>(path, { method: "PUT", body })
  },

  async delete<T>(path: string, options?: ApiClientRequestOptions) {
    return request<T>(path, { ...options, method: "DELETE" })
  },

  async getBlob(path: string, options?: ApiClientRequestOptions): Promise<BlobResponse> {
    const { body, ...requestOptions } = options ?? {}
    void body
    const headers = new Headers(options?.headers)
    headers.set("Accept", "application/octet-stream")
    const response = await fetch(buildUrl(path), {
      ...requestOptions,
      method: "GET",
      cache: options?.cache ?? "no-store",
      headers,
    })

    if (!response.ok) {
      throw new ApiClientError("Không thể tải tệp từ máy chủ.", response.status)
    }

    return { blob: await response.blob(), filename: getFilename(response) }
  },
}
