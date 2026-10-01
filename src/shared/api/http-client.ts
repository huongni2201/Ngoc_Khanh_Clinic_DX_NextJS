export class HttpError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message)
    this.name = "HttpError"
  }
}

export function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:8080" : "")
  if (!base) throw new HttpError("CONFIGURATION", "Chưa cấu hình kết nối máy chủ.")
  const origin = new URL(base)
  if (!/^https?:$/.test(origin.protocol) || !path.startsWith("/") || path.startsWith("//")) {
    throw new HttpError("CONFIGURATION", "Cấu hình kết nối máy chủ không hợp lệ.")
  }
  return `${base.replace(/\/$/, "")}${path}`
}

export function errorMessage(error: unknown): string {
  if (!(error instanceof HttpError)) return "Không thể hoàn tất thao tác. Vui lòng thử lại."
  switch (error.status) {
    case 400: return "Thông tin gửi lên không hợp lệ. Vui lòng kiểm tra lại."
    case 401: return "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
    case 403: return "Không được phép thực hiện thao tác này."
    case 429: return "Bạn đã thử quá nhiều lần. Vui lòng chờ rồi thử lại."
    default: return error.message
  }
}

export async function withHttpResponse<T>(
  url: string,
  options: RequestInit,
  readResponse: (response: Response) => Promise<T>,
): Promise<T> {
  const controller = new AbortController()
  let timedOut = false
  const abort = () => controller.abort(options.signal?.reason)
  if (options.signal?.aborted) abort()
  options.signal?.addEventListener("abort", abort, { once: true })
  const timeout = setTimeout(() => { timedOut = true; controller.abort() }, 15_000)
  const transportFailure = (error: unknown): never => {
    if (options.signal?.aborted) throw error
    throw new HttpError(timedOut ? "TIMEOUT" : "NETWORK_ERROR",
      timedOut ? "Máy chủ phản hồi quá lâu. Vui lòng thử lại." : "Không thể kết nối máy chủ. Vui lòng thử lại.")
  }
  try {
    let response: Response
    try {
      controller.signal.throwIfAborted()
      response = await fetch(url, {
        ...options, credentials: "include", cache: "no-store", signal: controller.signal,
      })
    } catch (error) {
      return transportFailure(error)
    }
    try {
      return await readResponse(response)
    } catch (error) {
      if (controller.signal.aborted) return transportFailure(error)
      throw error
    }
  } finally {
    clearTimeout(timeout)
    options.signal?.removeEventListener("abort", abort)
  }
}

export async function httpClient(path: string, options: RequestInit = {}): Promise<unknown> {
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")
  if (options.body) headers.set("Content-Type", "application/json")
  return withHttpResponse(apiUrl(path), { ...options, headers }, async (response) => {
    if (!response.ok) {
      const retry = response.headers.get("Retry-After")
      const seconds = retry && /^\d+$/.test(retry) ? Number(retry) : undefined
      const failure = new HttpError("HTTP_ERROR", "Không thể hoàn tất thao tác. Vui lòng thử lại.",
        response.status, seconds !== undefined && Number.isSafeInteger(seconds) ? seconds : undefined)
      throw new HttpError(failure.code, errorMessage(failure), response.status, failure.retryAfterSeconds)
    }
    if (response.status === 204) return undefined
    try {
      return await response.json() as unknown
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw error
      throw new HttpError("INVALID_RESPONSE", "Phản hồi máy chủ không hợp lệ. Vui lòng thử lại.")
    }
  })
}
