import type { z } from "zod"
import type { userSessionSchema } from "../schemas/session.schema"

export interface LoginCredentials {
  username: string
  password: string
}
export type UserSession = z.infer<typeof userSessionSchema>
