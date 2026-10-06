/**
 * Raised on the client when the backend exposes no endpoint for a feature yet.
 * It is not an HTTP response: no request is sent and there is no status code.
 */
export class ApiUnavailableError extends Error {
  readonly feature: string

  constructor(feature: string) {
    super(`Backend chưa cung cấp API cho ${feature}.`)
    this.name = "ApiUnavailableError"
    this.feature = feature
  }
}

export function unavailableApi(feature: string): Promise<never> {
  return Promise.reject(new ApiUnavailableError(feature))
}
