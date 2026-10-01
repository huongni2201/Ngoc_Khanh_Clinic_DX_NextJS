import { HttpError, withHttpResponse } from "./http-client"

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

function getApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (configuredBaseUrl) return configuredBaseUrl
  if (process.env.NODE_ENV !== "production") return "http://localhost:8080"

  throw new ApiClientError(
    "NEXT_PUBLIC_API_BASE_URL is required outside development",
    0
  )
}

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  return `${getApiBaseUrl().replace(/\/$/, "")}/${path.replace(/^\//, "")}`
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

async function fetchApiResponse<T>(
  path: string,
  options: RequestInit,
  readResponse: (response: Response) => Promise<T>
): Promise<T> {
  const url = buildUrl(path)
  try {
    return await withHttpResponse(url, options, readResponse)
  } catch (error) {
    if (error instanceof HttpError) {
      throw new ApiClientError(error.message, error.status ?? 0)
    }
    throw error
  }
}

async function request<T>(path: string, options: ApiClientRequestOptions = {}) {
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")

  const body = serializeBody(options.body)
  if (body !== undefined && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers.set("Content-Type", "application/json")
  }

  return fetchApiResponse(path, { ...options, body, headers }, async (response) => {
    if (response.status === 204) {
      return { result: "OK", code: 204 } as ApiResponse<T>
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
  })
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
    return fetchApiResponse(
      path,
      {
        ...requestOptions,
        method: "GET",
        headers,
      },
      async (response) => {
        if (!response.ok) {
          const payload = await readJson(response)
          const errorPayload = isApiResponse(payload) ? payload : undefined
          throw new ApiClientError(
            errorPayload?.message ?? "Không thể tải tệp từ máy chủ.",
            response.status,
            errorPayload?.code
          )
        }

        return { blob: await response.blob(), filename: getFilename(response) }
      }
    )
  },
}
