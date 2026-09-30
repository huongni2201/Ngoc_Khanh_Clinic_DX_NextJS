import { ApiClientError } from "./api-client"

export function developmentFixtureUnavailable(feature: string) {
  return new ApiClientError(`Backend chưa cung cấp API cho ${feature}.`, 501)
}

export function unavailableDevelopmentApi(feature: string): Promise<never> {
  return Promise.reject(developmentFixtureUnavailable(feature))
}
