import { z } from "zod"

const assignmentSchema = z.object({
  assignmentId: z.uuid(),
  roleCode: z.string(),
  permissions: z.array(z.string()),
  departmentId: z.uuid().nullable(),
  roomId: z.uuid().nullable(),
  validFrom: z.iso.datetime(),
  validTo: z.iso.datetime().nullable(),
})

export const staffSessionSchema = z.object({
  userId: z.uuid(), staffId: z.uuid(), username: z.string(), principalType: z.literal("STAFF"),
  roleAssignments: z.array(assignmentSchema),
  idleExpiresAt: z.iso.datetime(), absoluteExpiresAt: z.iso.datetime(),
})

export const sessionEnvelopeSchema = z.object({
  result: z.literal("OK"), code: z.literal(200), message: z.string(), data: staffSessionSchema,
})

export const csrfEnvelopeSchema = z.object({
  result: z.literal("OK"), code: z.literal(200), message: z.string(),
  data: z.object({ token: z.string().min(1), headerName: z.literal("X-XSRF-TOKEN") }),
})
