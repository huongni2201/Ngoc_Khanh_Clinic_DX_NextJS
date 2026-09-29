import type { z } from "zod"
import type { staffSessionSchema } from "../schemas/session.schema"

export interface LoginCredentials {
  username: string
  password: string
}
export type StaffSession = z.infer<typeof staffSessionSchema>
